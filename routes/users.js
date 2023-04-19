const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage: storage });
const users = require("./../controllers/users");
const { isLoggedIn, isUser } = require("../middleware");

router.get("/loginGoogle", passport.authenticate("google"));
router.get(
  "/loginGoogle/redirect",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.get("/new", users.renderNewUser);
router.get("/logout", users.renderLogout);
router.get("/:userId/edit", isLoggedIn, isUser, users.renderEditUser);

router
  .route("/")
  .post(upload.single("image"), catchAsync(users.createUser))
  .get(catchAsync(users.renderUsers));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/users/login",
    }),
    catchAsync(users.login)
  );

router
  .route("/:userId")
  .get(users.renderUser)
  .put(isLoggedIn, isUser, upload.single("image"), catchAsync(users.editUser))
  .delete(isLoggedIn, isUser, catchAsync(users.deleteUser));

module.exports = router;
