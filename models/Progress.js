const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "signup",  required: true },
  lessonId:  { type: mongoose.Schema.Types.ObjectId, ref: "lesson",  required: true },
  subcatId:  { type: mongoose.Schema.Types.ObjectId, ref: "subcategory", required: true },
  watchedAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model("progress", ProgressSchema, "progress");