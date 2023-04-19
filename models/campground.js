const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const { cloudinary } = require("./../cloudinary");

const ImageSchema = mongoose.Schema({ url: String, filename: String });
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: { type: String, enum: ["Point"], requried: true },
      coordinates: { type: [Number], required: true },
    },
    price: Number,
    description: String,
    location: String,
    time: { type: Date, default: Date.now },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  opts
);

CampgroundSchema.virtual("averageRating").get(function () {
  if (this.reviews && this.reviews.length > 0) {
    let rating = 0;
    this.reviews.forEach((review) => {
      rating = rating + review.rating / this.reviews.length;
    });
    return rating;
  } else {
    return 0;
  }
});

CampgroundSchema.virtual("properties.popUpMarkup").get(function (e) {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  try {
    for (img of doc.images) {
      cloudinary.uploader.destroy(img.filename, function (err, result) {
        console.log("delete cloudinary error", err);
        console.log("delete cloudinary result", result);
      });
    }
  } catch (err) {
    console.log("failed to destroy campground img in cloudinary");
  }

  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
