const router = require("express").Router();
const c = require("../controllers/enrollmentController");
const verify = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/enroll", verify, c.enrollUser);
router.get("/check", verify, c.checkEnrollment);
router.get("/count", verify, c.getEnrollmentCount);
router.get("/myenrollments", verify, c.getMyEnrollments);
router.get("/student/:userId", verify, verifyAdmin, c.getStudentEnrollments);

module.exports = router;