const router = require("express").Router();
const c = require("../controllers/subCategoryController");
const verifyAdmin = require("../middleware/verifyAdmin");
const verify = require("../middleware/verifyToken");

const multer = require("multer");

/* STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fname = Date.now() + "-" + file.originalname;
    cb(null, fname);
  }
});

const upload = multer({ storage });

/* ROUTES */

// add subcategory (admin)
router.post("/add", verify, verifyAdmin, upload.single("pic"), c.addSubCategory);

// get by category
router.get("/bycat", c.getByCategory);

// get all
router.get("/getall", c.getAll);

// update
router.put("/update", verify, verifyAdmin, upload.single("pic"), c.updateSubCategory);

// delete
router.delete("/delete", verify, verifyAdmin, c.deleteSubCategory);

module.exports = router;