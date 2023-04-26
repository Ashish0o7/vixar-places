const User = require("../models/user");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { cloudinary } = require("../cloudinary");

module.exports.login = async (req, res) => {
  req.flash("success", "welcome back");
  const redirectUrl = req.session.returnTo || "/places";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.createUser = async (req, res) => {
  const { email, username, password } = req.body;
  const user = new User({ email, username });
  if (req.file) {
    user.image = { url: req.file.path, filename: req.file.filename };
  }

  const registeredUser = await User.register(user, password);
  req.login(registeredUser, (err) => {
    if (err) return next(err);
    req.flash("success", "Sucessfully registered! Welcome to Vixar Places!");
    res.redirect("places");
  });
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};
module.exports.renderNewUser = (req, res) => {
  res.render("users/new");
};
module.exports.renderLogout = (req, res) => {
  req.logout();
  req.flash("success", "GoodBye!");
  res.redirect("/places");
};

module.exports.renderUsers = async (req, res) => {
  const users = await User.find({});
  res.render("users/index", { users });
};

module.exports.renderUser = async (req, res) => {
  const { userId } = req.params;
  const userShown = await User.findById(userId);
  const campgroundAll = await Campground.find()
    .populate({
      path: "author",
      select: "username",
    })
    .populate("reviews")
    .populate("images");
  const campgrounds = campgroundAll.filter(
    (campground) => campground.author.username === userShown.username
  );

  res.render("users/show", { userShown, campgrounds });
};

module.exports.renderEditUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  res.render("users/edit", { user });
};
module.exports.editUser = async (req, res) => {
  const { email } = req.body;
  const { userId } = req.params;
  const user = await User.findById(userId);
  user.email = email;
  if (req.file) {
    if (user.image) {
      try {
        cloudinary.uploader.destroy(
          user.image.filename,
          function (err, result) {
            console.log("delete cloudinary error", err);
            console.log("delete cloudinary result", result);
          }
        );
      } catch (err) {
        console.log("fail to destroy user img in cloudinary");
      }
    }
    user.image = { url: req.file.path, filename: req.file.filename };
  }
  await User.findByIdAndUpdate(userId, user);
  res.redirect(`/users/${userId}`);
};

module.exports.deleteUser = async (req, res) => {
  const reviewsAll = await Review.find().populate({
    path: "author",
    select: "_id",
  });
  const userReviews = reviewsAll.filter((review) =>
    review.author._id.equals(req.user._id)
  );

  for (userReview of userReviews) {
    let result = await Review.findByIdAndDelete(userReview._id);
  }
  const campgroundAll = await Campground.find().populate({
    path: "author",
    select: "_id",
  });
  const userCampgrounds = campgroundAll.filter((campground) =>
    campground.author._id.equals(req.user._id)
  );
  for (userCampground of userCampgrounds) {
    await Campground.findByIdAndDelete(userCampground._id);
  }
  await User.findByIdAndDelete(req.user._id);
  if (req.user.image) {
    try {
      cloudinary.uploader.destroy(user.image.filename, function (err, result) {
        console.log("delete cloudinary error", err);
        console.log("delete cloudinary result", result);
      });
    } catch (err) {
      console.log("fail to destroy user img in cloudinary");
    }
  }
  req.flash("success", `Delete User ${req.user.username} sucessfully!`);
  req.logout();
  res.redirect("/users");
};
