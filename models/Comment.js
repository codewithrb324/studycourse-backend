const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lesson",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "signup",
      required: true,
    },
    username: String,
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("comment", CommentSchema,);