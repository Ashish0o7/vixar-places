const express = require("express");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const campgrounds = require("./../controllers/campgrounds");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage: storage });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/").get(catchAsync(campgrounds.index)).post(
  isLoggedIn,
  upload.array("image"), // just temp workaround, it's weired to validate after updating
  validateCampground,
  catchAsync(campgrounds.createCampground)
);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .delete(isAuthor, isLoggedIn, catchAsync(campgrounds.deleteCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
