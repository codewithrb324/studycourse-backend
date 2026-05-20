const router = require("express").Router();
const Contact = require("../models/Contact");

const sendMail = async ({ to, subject, html }) => {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
            sender: { name: "StudyCourse", email: process.env.SMTP_USER },
            to: [{ email: to }],
            subject,
            htmlContent: html
        })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
    }
};

router.post("/contactus", async (req, res) => {
    try {
        const { name, email, phone, message, captcha } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json("All fields are required");
        }

        if (!captcha) return res.json("Captcha is required");

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
        if (!captchaData.success) return res.json("Captcha verification failed");

        // DB save
        await Contact.create({ name, email, phone, message });

        // Email — transporter.sendMail ki jagah sendMail
        sendMail({
            to: "raghavbhanot908@gmail.com",
            subject: 'Message from Website - Contact Us',
            html: `<b>Name:-</b> ${name}<br/><b>Phone:-</b> ${phone}<br/><b>Email:-</b> ${email}<br/><b>Message:-</b> ${message}`
        }).catch(err => console.log("Mail error:", err));

        res.json({ code: 1, msg: "Message sent successfully" });

    } catch (e) {
        console.log(e.message);
        res.status(500).json("Something went wrong");
    }
});

module.exports = router;