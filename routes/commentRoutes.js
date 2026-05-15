const router = require("express").Router();

const c = require("../controllers/commentController");
const verifyToken = require("../middleware/verifyToken");

// add comment
router.post("/add", verifyToken, c.addComment);

// get comments
router.get("/get", c.getComments);

// delete comment
router.delete("/delete/:id", verifyToken, c.deleteComment);

module.exports = router;