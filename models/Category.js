const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  catname: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 3
  },
  picname: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("category", categorySchema, "category");