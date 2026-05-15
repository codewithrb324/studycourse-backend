const express = require("express");
const { searchCourses } = require("../controllers/searchController");

const router = express.Router();

router.get("/searchcourses", searchCourses);

module.exports = router;