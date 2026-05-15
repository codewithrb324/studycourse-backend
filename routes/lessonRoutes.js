const router = require("express").Router();
const c = require("../controllers/lessonController");
const optionalVerify = require("../middleware/optionalVerify");
const verifyAdmin = require("../middleware/verifyAdmin");
const verify = require("../middleware/verifyToken");
const multer = require("multer");  

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage }); 

// add lesson
router.post("/add", verify, verifyAdmin, upload.single("thumbnail"), c.addLesson);  

// get lessons by subcategory
router.get("/get/:scid", optionalVerify, c.getLessonsBySubcat);

router.get("/getone/:id", optionalVerify, c.getLessonById);

// update lesson
router.put("/update", verify, verifyAdmin, upload.single("thumbnail"), c.updateLesson);

// delete lesson
router.delete("/delete/:id",  verify, verifyAdmin, c.deleteLesson);

module.exports = router;