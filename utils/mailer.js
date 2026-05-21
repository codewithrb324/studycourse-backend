const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
);

const sendEmail = async (to, subject, html) => {
    try {
        await mailjet.post("send", { version: "v3.1" }).request({
            Messages: [
                {
                    From: {
                        Email: process.env.MAIL_SENDER,
                        Name: "StudyCourse"
                    },
                    To: [{ Email: to }],
                    Subject: subject,
                    HTMLPart: html
                }
            ]
        });
        console.log("Email sent to:", to);
    } catch (err) {
        console.log("Mail error:", err.statusCode, err.message);
    }
};

module.exports = sendEmail;