const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment"); 
// add lesson
exports.addLesson = async (req, res) => {
  try {
    const lessonData = {
      ...req.body,
      thumbnail: req.file ? req.file.filename : "defaultpic.jpg" 
    };
    const lesson = await Lesson.create(lessonData);
    res.json({ code: 1, lesson });
  } catch (err) {
    res.json({ code: 0, msg: err.message });
  }
};



exports.getLessonsBySubcat = async (req, res) => {
  try {
    const data = await Lesson.find({ subcatid: req.params.scid }).populate("subcatid", "subcatname").sort({ order: 1 });
  
    let enrolled = false;
    if (req.user?.id) {
      const enroll = await Enrollment.findOne({
        userId: req.user.id,
        subcatId: req.params.scid
      });
      enrolled = !!enroll;
    }

    // ✅ Lock logic — first lesson free, remaining lessons unlocked after enroll
    const lessondata = data.map((lesson, index) => ({
      ...lesson.toObject(),
      isLocked: !enrolled && index !== 0  // first free, remaining lesson locked
    }));

    res.json({ code: 1, lessondata, enrolled });
  } catch (err) {
    res.json({ code: 0 });
  }
};


exports.getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.json({ code: 0 });

        let isLocked = false;

        // Pehle lesson ka order check karo
        const firstLesson = await Lesson.findOne({ subcatid: lesson.subcatid }).sort({ order: 1 });
        const isFirstLesson = firstLesson?._id.toString() === lesson._id.toString();

        if (isFirstLesson) {
            isLocked = false;  // ← pehla lesson hamesha free
        } else if (req.user?.id) {
            const enroll = await Enrollment.findOne({
                userId: req.user.id,
                subcatId: lesson.subcatid
            });
            isLocked = !enroll;
        } else {
            isLocked = true;  // login nahi + pehla lesson nahi = locked
        }

        res.json({
            code: 1,
            coursedata: {
                ...lesson.toObject(),
                isLocked,
                subcatId: lesson.subcatid
            }
        });
    } catch(e) {
        console.log(e.message);
        res.json({ code: 0 });
    }
};


//update lesson
exports.updateLesson = async (req, res) => {
  try {
    let thumbnail = req.body.oldthumbnail;
    
    if (req.file) {
      thumbnail = req.file.filename;
    }

    const result = await Lesson.updateOne(
      { _id: req.body.lid },
      {
        title: req.body.title,
        description: req.body.description,
        youtubeUrl: req.body.youtubeUrl,
        duration: req.body.duration,
        order: req.body.order,
        thumbnail
      }
    );

    res.json({ code: result.modifiedCount === 1 ? 1 : 0 });
  } catch (err) {
    res.json({ code: 0, msg: err.message });
  }
};

//delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const result = await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: result ? true : false });
  } catch (err) {
    console.log("Error:", err.message);
    res.json({ success: false });
  }
};