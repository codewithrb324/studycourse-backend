const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  username: String,
  pass: String,
  usertype: { type: String, default: "user" },
  isActivated: { type: Boolean, default: false },
  actcode: String
}, { versionKey: false });

module.exports = mongoose.model("signup", UserSchema, "signup");