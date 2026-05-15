const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const SubCategory = require("../models/SubCategory");
const User = require("../models/User");

// Mark Lesson Watched
exports.markWatched = async (req, res) => {
  try {
    await Progress.updateOne(
      {
        userId: req.user.id,
        lessonId: req.body.lessonId
      },
      {
        // latest time update on every watch
        $set: {
          watchedAt: new Date()
        },

        // These fields show only when inserts
        $setOnInsert: {
          userId: req.user.id,
          lessonId: req.body.lessonId,
          subcatId: req.body.subcatId
        }
      },
      { upsert: true }
    );

    res.json({ code: 1 });

  } catch (e) {
    console.log(e.message);
    res.json({ code: 0 });
  }
};

// Get Logged In User Progress
exports.getProgress = async (req, res) => {
  try {

    // latest watched first
    const progressData = await Progress.find({
      userId: req.user.id
    }).sort({ watchedAt: -1 });

    const totalWatched = progressData.length;

    // Last Watched Lesson
    let lastWatched = null;

    if (progressData.length > 0) {

      const lastLesson = await Lesson.findById(
        progressData[0].lessonId
      );

      if (lastLesson) {

        const subcat = await SubCategory.findById(
          lastLesson.subcatid
        );

        lastWatched = {
          title: lastLesson.title,
          subcatName: subcat?.subcatname || "",
          watchedAt: progressData[0].watchedAt
        };
      }
    }

   // Streak Calculate

const uniqueDates = [
  ...new Set(
    progressData.map(p => {
      const d = new Date(p.watchedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  )
];

// newest first
uniqueDates.sort((a, b) => b - a);

let streak = 0;

if (uniqueDates.length > 0) {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latestDate = new Date(uniqueDates[0]);

  const firstDiff =
    (today - latestDate) /
    (1000 * 60 * 60 * 24);

  // agar aaj ya kal activity hui hai tabhi streak valid
  if (firstDiff <= 1) {

    streak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {

      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);

      const diff =
        (prevDate - currDate) /
        (1000 * 60 * 60 * 24);

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
  }
}

    // Per Course Progress
    const enrollments = await Enrollment.find({
      userId: req.user.id
    });

    const courseProgress = await Promise.all(

      enrollments.map(async (enroll) => {

        const subcat = await SubCategory.findById(
          enroll.subcatId
        );

        const totalLessons =
          await Lesson.countDocuments({
            subcatid: enroll.subcatId
          });

        const lessons = await Lesson.find({
          subcatid: enroll.subcatId
        });

        const watchedLessons =
          await Progress.countDocuments({
            userId: req.user.id,
            lessonId: {
              $in: lessons.map(l => l._id)
            }
          });

        const percent =
          totalLessons > 0
            ? Math.round(
                (watchedLessons / totalLessons) * 100
              )
            : 0;

        return {
          subcatId: enroll.subcatId,
          subcatName:
            subcat?.subcatname || "Unknown",
          totalLessons,
          watchedCount: watchedLessons,
          percent
        };
      })
    );

    // Final Response
    res.json({
      code: 1,
      totalWatched,
      streak,
      lastWatched,
      courseProgress,

      progressData: progressData.map(p => ({
        lessonId: String(p.lessonId)
      }))
    });

  } catch (e) {

    console.log(e.message);

    res.json({
      code: 0
    });
  }
};

// Admin - Student Progress
exports.getStudentProgress = async (req, res) => {

  try {

    const username = req.params.userId;

    const user = await User.findOne({
      username
    });

    if (!user) {
      return res.json({ code: 0 });
    }

    const userId = user._id;

    const enrollments = await Enrollment.find({
      userId
    });

    const courseProgress = await Promise.all(

      enrollments.map(async (enroll) => {

        const subcat = await SubCategory.findById(
          enroll.subcatId
        );

        const totalLessons =
          await Lesson.countDocuments({
            subcatid: enroll.subcatId
          });

        const lessons = await Lesson.find({
          subcatid: enroll.subcatId
        });

        const watchedLessons =
          await Progress.countDocuments({
            userId,
            lessonId: {
              $in: lessons.map(l => l._id)
            }
          });

        const percent =
          totalLessons > 0
            ? Math.round(
                (watchedLessons / totalLessons) * 100
              )
            : 0;

        return {
          subcatId: enroll.subcatId,
          subcatName:
            subcat?.subcatname || "Unknown",
          totalLessons,
          watchedCount: watchedLessons,
          percent
        };
      })
    );

    res.json({
      code: 1,
      courseProgress
    });

  } catch (e) {

    console.log(e.message);

    res.json({
      code: 0
    });
  }
};