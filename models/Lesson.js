const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  catid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true
  },
  subcatid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subcategory",
    required: true
  },
  title: String,
  description: String,
  youtubeUrl: String,  
  thumbnail: String,
  duration: String,    
  order: Number
}, { versionKey: false });

module.exports = mongoose.model("lesson", LessonSchema, "lesson");