const router = require("express").Router();
const c = require("../controllers/authController");
const verifyAdmin = require("../middleware/verifyAdmin");
const verify = require("../middleware/verifyToken");
const Reset = require("../models/ResetPassword");

router.post("/signup", c.signup);
router.post("/login", c.login);

router.get("/activate/:code", c.activate);
router.get("/resend/:email", c.resend);

router.get("/validtoken", async (req, res) => {
    try {
        const reset = await Reset.findOne({ token: req.query.token });
        if (!reset) return res.send({ code: 0 });
        if (new Date() > reset.exptime) return res.send({ code: -1 });
        res.send({ code: 1 });
    } catch(e) {
        res.send({ code: 0 });
    }
});

router.post("/forgot", c.forgot);
router.post("/reset", c.reset);
router.post("/changepassword", verify, c.changePassword);
router.post("/createadmin", verify, verifyAdmin, c.createAdmin);
router.get("/getuser", verify, c.getUser);
router.get("/searchuser/:email", verify, verifyAdmin, c.searchUser);
router.get("/allusers", verify, verifyAdmin, c.getAllUsers);
router.delete("/deletemember", verify, verifyAdmin, c.deleteMember);
router.post("/logout",verify,c.logout);

module.exports = router;