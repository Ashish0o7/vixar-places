const passport = require("passport");
const googleStrategy = require("passport-google-oidc");
const LocalStrategy = require("passport-local");
const User = require("../models/user");
passport.use(new LocalStrategy(User.authenticate())); // User.authenticate comes with passport
passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/users/loginGoogle/redirect",
      scope: ["profile", "email"],
    },
    async function (issuer, profile, email, cb) {
      // implement: checking user in db then return user or creating new user
      if (typeof profile.displayname == "undefined") {
        // replace username with email in case of invalid profile.displayname (chinese)
        profile.displayname = profile.emails[0].value.split("@")[0];
      }
      let findUser = await User.findOne({ username: profile.displayname });
      if (!findUser) {
        findUser = new User({
          email: profile.emails[0].value,
          username: profile.displayname,
        });
        await findUser.save();
      }
      let newUser = {
        google_id: profile.id,
        username: profile.displayname,
        email: profile.emails[0].value,
      };
      return cb(null, newUser);
    }
  )
);

// passport.serializeUser(User.serializeUser()); // how to store
// passport.deserializeUser(User.deserializeUser()); // how to unstore
passport.serializeUser(function (user, cb) {
  cb(null, user.username);
});
passport.deserializeUser(async function (user, cb) {
  let userData = await User.findOne({ username: user });
  return cb(null, userData);
});
