const Campground = require("../models/campground");
const { cloudinary } = require("./../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const review = require("../models/review");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const apiKey = "2bcd938709b00304711740ebeb41f5bf";
module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({})
    .populate("reviews")
    .populate("author")
    .populate("images");
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  campground.geometry = geoData.body.features[0].geometry;
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};



module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");

  let isCommented = false;
  for (campgroundReview of campground.reviews) {
    if (req.user && campgroundReview.author.username === req.user.username) {
      isCommented = true;
    }
  }

  if (!campground) {
    req.flash("error", "Cannot find that camp!");
    return res.redirect("/campgrounds");
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${campground.location}&appid=${apiKey}&units=metric`;
    //const response = await fetch(url);
    //const weatherData = await response.json();
    res.render("campgrounds/show", { campground, isCommented});
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not retrieve weather data!");
    res.render("campgrounds/show", { campground, isCommented });
  }
};
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  req.flash("success", "Successfully updated a campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a campground!");
  res.redirect("/campgrounds");
};
