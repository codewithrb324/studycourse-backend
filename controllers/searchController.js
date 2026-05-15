import SubCategory from "../models/SubCategory.js";

export const searchCourses = async (req, res) => {
  try {
    const { s } = req.query;

    if (!s) {
      return res.send({
        code: 0,
        message: "Search text missing",
        subcats: []
      });
    }

    // case-insensitive search
    const results = await SubCategory.find({
      subcatname: { $regex: s, $options: "i" }
    });

    res.send({
      code: 1,
      subcats: results
    });

  } catch (err) {
    res.status(500).send({
      code: 0,
      message: err.message
    });
  }
};