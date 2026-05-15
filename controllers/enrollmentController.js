const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
// enroll user
exports.enrollUser = async (req, res) => {
  try {
    const exists = await Enrollment.findOne({
      userId: req.user.id,
      subcatId: req.body.subcatId
    });

    if (exists) {
      return res.json({ code: 2, msg: "Already enrolled" });
    }

    await Enrollment.create({
      userId: req.user.id,
      subcatId: req.body.subcatId
    });

    res.json({ code: 1 });
  } catch (err) {
    res.json({ code: 0 });
  }
};

// check enrollment
exports.checkEnrollment = async (req, res) => {
  try {
    const data = await Enrollment.findOne({
      userId: req.user.id,
      subcatId: req.query.subcatId
    });

    res.json({ code: 1, enrolled: !!data });
  } catch {
    res.json({ code: 0 });
  }
};

// get enrollment count
exports.getEnrollmentCount = async (req, res) => {
    try {
        const count = await Enrollment.countDocuments();
        res.json({ code: 1, count });
    } catch {
        res.json({ code: 0 });
    }
};

exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.user.id });
        
        // SubCategory details bhi fetch karo
        const SubCategory = require("../models/SubCategory");
        const result = await Promise.all(
            enrollments.map(async (enroll) => {
                const subcat = await SubCategory.findById(enroll.subcatId);
                return {
                    subcatId: enroll.subcatId,
                    subcatName: subcat?.subcatname || "Unknown",
                    thumbnail: subcat?.picname || "defaultpic.jpg",
                    enrolledAt: enroll.enrolledAt
                };
            })
        );

        res.json({ code: 1, enrollments: result });
    } catch(e) {
        console.log(e.message);
        res.json({ code: 0 });
    }
};

// Admin - kisi bhi student ki enrollments dekho
exports.getStudentEnrollments = async (req, res) => {
    try {
        const username = req.params.userId;

        //  username se user find karo
        const user = await User.findOne({ username });

        if (!user) return res.json({ code: 0 });

        // _id se enrollments lao
        const enrollments = await Enrollment.find({ userId: user._id });

        const SubCategory = require("../models/SubCategory");

        const result = await Promise.all(
            enrollments.map(async (enroll) => {
                const subcat = await SubCategory.findById(enroll.subcatId);

                return {
                    subcatId: enroll.subcatId,
                    subcatName: subcat?.subcatname || "Unknown",
                    thumbnail: subcat?.picname || "defaultpic.jpg",
                    enrolledAt: enroll.enrolledAt
                };
            })
        );

        res.json({ code: 1, enrollments: result });

    } catch (e) {
        console.log(e.message);
        res.json({ code: 0 });
    }
};