const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const app = express();

/* SECURITY */
app.disable("x-powered-by");

/* TRUST PROXY (important for production cookies on render/vercel) */
app.set("trust proxy", 1);

/* CORS */
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

/* BODY PARSER */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* COOKIES */
app.use(cookieParser());


/* STATIC FILES */
app.use("/uploads", express.static("public/uploads"));

/* SECURITY HEADERS */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ROUTES */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/subcategory", require("./routes/subCategoryRoutes"));
app.use("/api", require("./routes/contactRoutes"));
app.use("/api/lesson", require("./routes/lessonRoutes"));
app.use("/api/enrollment", require("./routes/enrollmentRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/comment", require("./routes/commentRoutes"));
app.use("/api", require("./routes/searchRoutes"));

/* HEALTH CHECK (useful for deployment) */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* 404 HANDLER */
app.use((req, res) => {
  res.status(404).json({ code: 0, msg: "Route not found" });
});

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    code: 0,
    msg: err.message || "Server Error",
  });
});

module.exports = app;