const Contact = require("../models/Contact");
const sendEmail = require("../utils/mailer");

exports.contactUs = async (req, res) => {
    try {
        const { name, email, phone, message, captcha } = req.body;

        if (!name || !email || !phone || !message)
            return res.send("All fields are required");

        if (!captcha)
            return res.send("Captcha is required");

        const verifyURL = "https://www.google.com/recaptcha/api/siteverify";
        const response = await fetch(verifyURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: captcha
            })
        });
        const data = await response.json();
        if (!data.success)
            return res.send("Captcha verification failed");

        await Contact.create({ name, email, phone, message });

        await sendEmail(
            "raghavbhanot908@gmail.com",
            "Message from Website - Contact Us",
            `<b>Name:-</b> ${name}<br/><b>Phone:-</b> ${phone}<br/><b>Email:-</b> ${email}<br/><b>Message:-</b> ${message}`
        );

        res.send({ code: 1, msg: "Message sent successfully" });

    } catch (e) {
        res.status(500).json({ code: -1, errmsg: e.message });
    }
};