const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate(
    "reviews"
  );
  for (reviewOne of campground.reviews) {
    if (reviewOne.author.equals(req.user._id)) {
      // not only block duplicated review in front end but also backend
      return res.redirect(`/campgrounds/${campground._id}`);
    }
  }
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Successfully created a new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.editReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Review.findByIdAndUpdate(reviewId, {
    body: req.body.review.body,
    rating: req.body.review.rating,
  });
  req.flash("success", "Successfully edit the review!");
  res.redirect(`/campgrounds/${id}`);
};
