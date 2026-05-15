module.exports = (req, res, next) => {

    // Not logged in
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    // Not admin
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    next();
};