const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserImageSchema = Schema({
  url: String,
  filename: String,
});

const UserSchema = Schema({
  image: UserImageSchema,
  email: {
    type: String,
    required: true,
    unique: true,
  },
});
UserSchema.plugin(passportLocalMongoose); // add useranme and password

// UserSchema.post("findOneAndDelete", function (doc) {
//   console.log("userSchema middleware delete is triggered");
// });

module.exports = mongoose.model("User", UserSchema);
