const Comment = require("../models/Comment");
const User = require("../models/User");

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { lessonId, comment } = req.body;

    const user = await User.findById(req.user.id);

    const newComment = new Comment({
      lessonId,
      userId: req.user.id,
      username: user.name,
      comment,
    });

    await newComment.save();

    res.send({ code: 1, msg: "Comment added" });
  } catch (e) {
    res.send({ code: 0, msg: e.message });
  }
};

// GET COMMENTS BY LESSON
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ lessonId: req.query.lessonId })
      .sort({ createdAt: -1 });

    res.send({ code: 1, comments });
  } catch (e) {
    res.send({ code: 0 });
  }
};

// DELETE COMMENT
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.send({ code: 0, msg: "Comment not found" });
    }

    // owner ya admin check
    if (
      comment.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.send({ code: 0, msg: "Not allowed" });
    }

    await Comment.deleteOne({ _id: id });

    res.send({ code: 1, msg: "Deleted" });
  } catch (e) {
    res.send({ code: 0 });
  }
};