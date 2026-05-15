const router = require("express").Router();
const c = require("../controllers/progressController");
const verify = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
router.post("/mark", verify, c.markWatched);
router.get("/get", verify, c.getProgress);
router.get("/student/:userId", verify, verifyAdmin ,c.getStudentProgress);

module.exports = router;