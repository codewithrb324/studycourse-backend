const User = require("../models/User");
const Reset = require("../models/ResetPassword");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const sendEmail = require("../utils/mailer");

/* SIGNUP */
exports.signup = async (req, res) => {
    try {
        //  Captcha verify first
        const { captcha } = req.body;
        if (!captcha) return res.send({ code: 0, msg: "Captcha required" });

        const verifyURL = "https://www.google.com/recaptcha/api/siteverify";
        const captchaRes = await fetch(verifyURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: captcha
            })
        });
        const captchaData = await captchaRes.json();
        if (!captchaData.success) return res.send({ code: 0, msg: "Captcha verification failed" });

        // Baaki same
        const exists = await User.findOne({ username: req.body.uname });
        if (exists) return res.send({ code: -2 });

        const hash = bcrypt.hashSync(req.body.pass, 10);
        const code = uuid.v4();

        await new User({
            name: req.body.pname,
            phone: req.body.phone,
            username: req.body.uname,
            pass: hash,
            actcode: code
        }).save();

        res.send({ code: 1 });

        sendEmail(
            req.body.uname,
            'Activation mail from StudyCourse',
            `Dear ${req.body.pname},<br/><br/>
    Thank you for registering on <b>Study Course</b>!<br/><br/>
    Click the link below to activate your account:<br/><br/>
    <a href="${process.env.CLIENT_URL}/activateaccount?id=${code}">
        ${process.env.CLIENT_URL}/activateaccount?id=${code}
    </a><br/><br/>
    If you did not register, please ignore this email.<br/><br/>`
        );

    } catch (err) {
    console.log("SIGNUP ERROR:", err.message); // already hai
    console.log("SIGNUP FULL ERROR:", err); // ← yeh add karo
    res.send({ code: 0 });
}
};

exports.login = async (req, res) => {
    try {
        const { uname, pass, remember, captcha } = req.body;

        // First Find User
        const result = await User.findOne({ username: uname });
        if (!result) return res.send({ code: 0 });

        if (!bcrypt.compareSync(pass, result.pass)) return res.send({ code: 0 });

        if (!result.isActivated) return res.send({ code: 0 });
        // Then captcha verify
        if (!captcha) return res.send({ code: 0, msg: "Captcha required" });

        const verifyURL = "https://www.google.com/recaptcha/api/siteverify";
        const captchaRes = await fetch(verifyURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: captcha
            })
        });
        const captchaData = await captchaRes.json();
        // console.log("CAPTCHA RESPONSE:", captchaData);
        if (!captchaData.success) return res.send({ code: 0, msg: "Captcha verification failed" });

        // Token generate
        const respdata = { _id: result._id, name: result.name, phone: result.phone, username: result.username, usertype: result.usertype };

        const expiresIn = remember ? "7d" : "1h";
        const maxAge = remember ? 7 * 24 * 3600000 : 3600000;

        let jtoken = jwt.sign(
            { id: result._id, role: result.usertype },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        res.cookie("authToken", jtoken, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: process.env.COOKIE_SAMESITE || "lax",
            maxAge,
        });

        res.send({ code: 1, udata: respdata });

    } catch (e) {
        console.log(e.message);
        res.send({ code: 0 });
    }
};

/* ACTIVATE */
exports.activate = async (req, res) => {
    try {
        const result = await User.updateOne(
            { actcode: req.params.code, isActivated: false },
            { isActivated: true }
        );

        res.send({ code: result.modifiedCount ? 1 : 0 });

    } catch (err) {
        console.log(err.message);
        res.send({ code: 0 });
    }
};

/* RESEND ACTIVATION */
exports.resend = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.email,
            isActivated: false
        });

        if (!user) return res.send({ code: 0 });

        const newCode = uuid.v4();

        await User.updateOne(
            { username: req.params.email },
            { actcode: newCode }
        );

        res.send({ code: 1 });

        sendEmail(
            req.params.email,
            'Resend Activation Mail from StudyCourse',
            `Click the link to activate your account:<br/><br/>
    <a href="${process.env.CLIENT_URL}/activateaccount?id=${newCode}">
        ${process.env.CLIENT_URL}/activateaccount?id=${newCode}
    </a>`
        );

    } catch (err) {
        console.log(err.message);
        res.send({ code: 0 });
    }
};

/* CHANGE PASSWORD */
exports.changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.send({ code: 0 });

        const ok = bcrypt.compareSync(req.body.oldpass, user.pass);
        if (!ok) return res.send({ code: -1 }); // wrong password

        const hash = bcrypt.hashSync(req.body.newpass, 10);
        await User.updateOne({ _id: req.user.id }, { pass: hash });

        res.send({ code: 1 });
    } catch (e) {
        console.log(e.message);
        res.send({ code: 0 });
    }
};

/* FORGOT PASSWORD */
exports.forgot = async (req, res) => {
    try {
        // Captcha verify first
        const { email, captcha } = req.body;

        if (!captcha) return res.send({ code: 0, msg: "Captcha required" });

        const verifyURL = "https://www.google.com/recaptcha/api/siteverify";
        const captchaRes = await fetch(verifyURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: captcha
            })
        });
        const captchaData = await captchaRes.json();
        if (!captchaData.success) return res.send({ code: 0, msg: "Captcha verification failed" });

        // Baaki same — req.params.un ki jagah email use karo
        const user = await User.findOne({ username: email });
        if (!user) return res.send({ code: 0 });

        await Reset.deleteMany({ username: email });

        const token = uuid.v4();
        const exptime = new Date(Date.now() + 15 * 60000);

        await new Reset({ username: email, token, exptime }).save();

        sendEmail(
            email,
            'Reset Password Mail from StudyCourse',
            `Dear ${user.name},<br/><br/>
    Click on the following link to reset your password:<br/><br/>
    <a href="${process.env.CLIENT_URL}/resetpassword?token=${token}">
        ${process.env.CLIENT_URL}/resetpassword?token=${token}
    </a><br/><br/>
    This link is valid for 15 minutes only.<br/><br/>`
        );

        res.send({ code: 1 });

    } catch (err) {
        console.log(err.message);
        res.send({ code: 0 });
    }
};

/* RESET PASSWORD */
exports.reset = async (req, res) => {
    try {
        const resetEntry = await Reset.findOne({ token: req.body.token });

        if (!resetEntry) return res.send({ code: 0 });

        // Token expired check
        if (new Date() > resetEntry.exptime) {
            await Reset.deleteOne({ token: req.body.token });
            return res.send({ code: -1 }); // expired
        }

        const hash = bcrypt.hashSync(req.body.pass, 10);

        await User.updateOne(
            { username: resetEntry.username },
            { pass: hash }
        );

        await Reset.deleteOne({ token: req.body.token });

        res.send({ code: 1 });

    } catch (err) {
        console.log(err.message);
        res.send({ code: 0 });
    }
};

/* GET USER */
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-pass");
        if (!user) return res.send({ code: 0 });
        res.send({ code: 1, udata: user });

    } catch (err) {
        console.log(err.message);
        res.send({ code: 0 });
    }
};

/* GET ALL USERS */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-pass");
        res.send({ code: 1, udata: users });
    } catch (e) {
        console.log(e.message);
        res.send({ code: 0 });
    }
};

/* LOGOUT */
exports.logout = async (req, res) => {
    try {
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: process.env.COOKIE_SAMESITE || "lax"
        });
        res.send({ code: 1 });

    } catch (err) {
        console.log(err.message);
        res.send({ code: 0 });
    }
};

//SEARCH USER
exports.searchUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.email }).select("-pass");
        if (!user) return res.send({ code: 0 });
        res.send({ code: 1, udata: user });
    } catch (e) {
        console.log(e.message);
        res.send({ code: 0 });
    }
};

//DELETE USER
exports.deleteMember = async (req, res) => {
    try {

        if (req.body.mid === req.user.id.toString()) {
            return res.send({ success: false, msg: "You cannot delete your own account" });
        }
        const result = await User.deleteOne({ _id: req.body.mid });
        res.send({ success: result.deletedCount === 1 });

    } catch (e) {
        console.log(e.message);
        res.send({ success: false });
    }
};

//CREATE ADMIN
exports.createAdmin = async (req, res) => {
    try {
        const exists = await User.findOne({ username: req.body.uname });
        if (exists) return res.send({ code: -2, msg: "Email already exists" });

        const hash = bcrypt.hashSync(req.body.pass, 10);

        await new User({
            name: req.body.pname,
            phone: req.body.phone,
            username: req.body.uname,
            pass: hash,
            usertype: "admin",
            isActivated: true
        }).save();

        res.send({ code: 1 });
    } catch (e) {
        console.log(e.message);
        res.send({ code: 0 });
    }
};