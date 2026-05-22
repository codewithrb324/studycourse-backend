const Category = require("../models/Category");
const fs = require("fs");

/* ADD CATEGORY */
exports.addCategory = async (req, res) => {
  try {
    let fname = "defaultpic.jpg";

    if (req.file) {
      fname = req.file.filename;
    }

    const exists = await Category.findOne({ catname: req.body.catname });
    if (exists) {
      return res.send({ code: -2, msg: "Category already exists" });
    }

    const newCat = new Category({
      catname: req.body.catname,
      picname: fname
    });

    const result = await newCat.save();

    res.send({ code: result ? 1 : 0 });

  } catch (e) {
    console.log(e.message);
    res.send({ code: 0 });
  }
};

/* GET ALL CATEGORIES */
exports.getAllCategories = async (req, res) => {
  try {
    const result = await Category.find().sort({ _id: 1 });

    if (result.length === 0) {
      return res.send({ code: 0 });
    }

    res.send({ code: 1, cdata: result });

  } catch {
    res.send({ code: 0 });
  }
};

/* UPDATE CATEGORY */
exports.updateCategory = async (req, res) => {
  try {
    let imagename;

    if (req.file) {
      imagename = req.file.filename;

      if (req.body.oldpicname !== "defaultpic.jpg") {
        fs.unlinkSync(`public/uploads/${req.body.oldpicname}`);
      }
    } else {
      imagename = req.body.oldpicname;
    }

    const result = await Category.updateOne(
      { _id: req.body.cid },
      { catname: req.body.catname, picname: imagename }
    );

    res.send({ code: result.modifiedCount === 1 ? 1 : 0 });

  } catch {
    res.send({ code: 0 });
  }
};

/* DELETE CATEGORY */
exports.deleteCategory = async (req, res) => {
  try {
    const cid = req.body.cid;

    const cat = await Category.findById(cid); // ✅ req.body.cid

    if (!cat) return res.send({ code: 0 });

    if (cat.picname !== "defaultpic.jpg") {
      fs.unlinkSync(`public/uploads/${cat.picname}`);
    }

    const result = await Category.deleteOne({ _id: cid }); // ✅ ek baar

    res.send({ success: result.deletedCount === 1 });

  } catch(e) {
    console.log(e.message);
    res.send({ code: 0 });
  }
};