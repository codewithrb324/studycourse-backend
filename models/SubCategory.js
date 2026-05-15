const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  catid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true
  },
  subcatname: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  picname: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("subcategory", subCategorySchema, "subcategory");