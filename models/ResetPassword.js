const mongoose = require("mongoose");

const ResetSchema = new mongoose.Schema({
  username: String,
  token: String,
  exptime: Date
}, { versionKey: false });

module.exports = mongoose.model("resetpass", ResetSchema, "resetpass");