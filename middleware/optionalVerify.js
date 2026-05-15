const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) return next(); // without token go to next

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    next(); // invalid token no restriction go to next
  }
};