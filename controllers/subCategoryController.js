const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");
const fs = require("fs");

/* ADD SUBCATEGORY */
exports.addSubCategory = async (req, res) => {
  try {
    let fname = "defaultpic.jpg";

    if (req.file) {
      fname = req.file.filename;
    }

    const exists = await SubCategory.findOne({
      subcatname: req.body.subcatname,
      catid: req.body.catid
    });

    if (exists) {
      return res.send({ code: -2, msg: "SubCategory already exists" });
    }

    const newSub = new SubCategory({
      catid: req.body.catid,
      subcatname: req.body.subcatname,
      picname: fname
    });

    const result = await newSub.save();

    res.send({ code: result ? 1 : 0 });

  } catch (e) {
    console.log(e.message);
    res.send({ code: 0 });
  }
};

/* GET BY CATEGORY */
exports.getByCategory = async (req, res) => {
  try {
    const result = await SubCategory.find({ catid: req.query.cid }).populate("catid");

    if (result.length === 0) {
      return res.send({ code: 0 });
    }

    res.send({ code: 1, scdata: result });

  } catch(err) {
    res.send({ code: 0 });
  }
};

/* GET ALL (optional but useful) */
exports.getAll = async (req, res) => {
  try {
    const result = await SubCategory.find();

    res.send({ code: 1, scdata: result });

  } catch {
    res.send({ code: 0 });
  }
};

/* UPDATE */
exports.updateSubCategory = async (req, res) => {
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

    const result = await SubCategory.updateOne(
      { _id: req.body.scid },
      {
        catid: req.body.catid,
        subcatname: req.body.subcatname,
        picname: imagename
      }
    );

    res.send({ code: result.modifiedCount === 1 ? 1 : 0 });

  } catch {
    res.send({ code: 0 });
  }
};

/* DELETE */
exports.deleteSubCategory = async (req, res) => {
  try {
    const scid = req.body.scid; 
    const subcat = await SubCategory.findById(scid);
    if (!subcat) return res.send({ code: 0 });

    if (subcat.picname !== "defaultpic.jpg") {
      fs.unlinkSync(`public/uploads/${subcat.picname}`);
    }

    const result = await SubCategory.deleteOne({ _id: scid });
    res.send({ success: result.deletedCount === 1 });

  } catch(e) {
    console.log(e.message);
    res.send({ code: 0 });
  }
};