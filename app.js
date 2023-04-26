if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const userRouter = require("./routes/users");
const campgroundsRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const passport = require("passport");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const db_url = process.env.DB_URL;
mongoose.connect(db_url);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});
const app = express();

app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());
// session
const sessionConfig = require("./config/session");
app.use(session(sessionConfig));
app.use(flash());
// passport
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

app.use((req, res, next) => {
  res.locals.currentUser = typeof req.user == "undefined" ? false : req.user;
  //res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/users", userRouter);
app.use("/places", campgroundsRouter);
app.use("/places/:id/reviews", reviewsRouter);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found"), 404);
});
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "oh no, something went wrong!";
  res.status(statusCode);
  res.render("error", { err });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`running on port ${port}`);
});


