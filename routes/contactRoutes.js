const router = require("express").Router();
const Contact = require("../models/Contact");
const sendEmail = require("../utils/mailer");

router.post("/contactus", async (req, res) => {
    try {
        const { name, email, phone, message, captcha } = req.body;

        if (!name || !email || !phone || !message)
            return res.status(400).json("All fields are required");

        if (!captcha)
            return res.json("Captcha is required");

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
        if (!captchaData.success)
            return res.json("Captcha verification failed");

        await Contact.create({ name, email, phone, message });

        sendEmail(
            "raghavbhanot908@gmail.com",
            "Message from Website - Contact Us",
            `<b>Name:-</b> ${name}<br/><b>Phone:-</b> ${phone}<br/><b>Email:-</b> ${email}<br/><b>Message:-</b> ${message}`
        );

        res.json("Message sent successfully");

    } catch (e) {
        console.log(e.message);
        res.status(500).json("Something went wrong");
    }
});

module.exports = router;