const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) return res.send({ code: 0 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // remaining time (in seconds)
    const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
    // console.log("Time left:", timeLeft, "seconds");
    // refresh only if less than 60 sec left
    if (timeLeft < 60) {
    const remember = decoded.remember || false; 
    const expiresIn = remember ? "7d" : "1h";  
    const maxAge = remember ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

    const newToken = jwt.sign(
        { id: decoded.id, role: decoded.role, remember },
        process.env.JWT_SECRET,
        { expiresIn }
    );

    res.cookie("authToken", newToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: process.env.COOKIE_SAMESITE || "lax",
        maxAge
    });
    console.log("Refreshing token...");
}

    next();

  } catch (err) {
    return res.send({ code: 0 });
  }
};