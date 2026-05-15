require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

/* Connect Database */
connectDB();

/* Debug Middleware */
app.use((req, res, next) => {
  console.log("COOKIE:", req.headers.cookie);
  next();
});

/* Port */
const PORT = process.env.PORT || 9000;

/* Start Server */
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});