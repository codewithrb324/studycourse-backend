const router = require("express").Router();
const c = require("../controllers/categoryController");
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

// add category (admin)
router.post("/add", verify, verifyAdmin, upload.single("pic"), c.addCategory);

// get all categories (public)
router.get("/getall", c.getAllCategories);

// update category (admin)
router.put("/update", verify, verifyAdmin, upload.single("pic"), c.updateCategory);

// delete category (admin)
router.delete("/delete", verify, verifyAdmin, c.deleteCategory);

module.exports = router;