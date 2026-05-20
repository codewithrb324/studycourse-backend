const Contact = require("../models/Contact");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

exports.contactUs = async (req, res) => {
  try {
       const { name, email, phone, message, captcha } = req.body;

       // Validate fields
    if (!name || !email || !phone || !message) {
      return res.send("All fields are required");
    }

    if (!captcha) {
      return res.send("Captcha is required");
    }

    //  Verify captcha
    const verifyURL = "https://www.google.com/recaptcha/api/siteverify";

    const response = await fetch(verifyURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: captcha
      })
    });

    const data = await response.json();

    if (!data.success) {
      return res.send("Captcha verification failed");
    }

    // SAVE TO DATABASE FIRST
    const savedData = await Contact.create({
      name,
      email,
      phone,
      message
    });


  // SEND EMAIL (even if this fails, data is saved)
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      replyTo: req.body.email,
      subject: 'Message from Website - Contact Us',
      html: `<b>Name:-</b> ${req.body.name}<br/><b>Phone:-</b> ${req.body.phone}<br/><b>Email:-</b> ${req.body.email}
        <br/><b>Message:-</b> ${req.body.message}`
    };

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log("Email failed but data saved:", error);
        return res.send({ code: 0, msg: "Saved, but email failed" }); 
    }
    return res.send({ code: 1, msg: "Message sent successfully" }); 
});
    
  } catch (e) {
    res.status(500).json({ code: -1, errmsg: e.message });
  }
};