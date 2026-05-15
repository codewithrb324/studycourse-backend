const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subcatId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
  amountPaid: { type: Number, default: 499 },     
  enrolledAt: { type: Date, default: Date.now }      
}, { versionKey: false });                            

module.exports = mongoose.model("enrollment", EnrollmentSchema, "enrollment");