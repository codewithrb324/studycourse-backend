const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
);

const sendEmail = async (
    to,
    subject,
    html,
    replyEmail = "",
    replyName = ""
) => {
    try {

        const payload = {
            Messages: [
                {
                    From: {
                        Email: process.env.MAIL_SENDER,
                        Name: "StudyCourse"
                    },

                    To: [
                        {
                            Email: to
                        }
                    ],

                    Subject: subject,

                    HTMLPart: html,

                    TextPart: html
                        .replace(/<br\s*\/?>/gi, "\n")
                        .replace(/<[^>]*>/g, ""),

                    ...(replyEmail && {
                        ReplyTo: {
                            Email: replyEmail,
                            Name: replyName || "User"
                        }
                    })
                }
            ]
        };

        const result = await mailjet
            .post("send", { version: "v3.1" })
            .request(payload);

        console.log("EMAIL SENT");
        console.log(JSON.stringify(result.body, null, 2));

        return result;

    } catch (err) {

        console.log("MAIL ERROR:");

        if (err.response && err.response.body) {
            console.log(JSON.stringify(err.response.body, null, 2));
        } else {
            console.log(err);
        }

        throw err;
    }
};

module.exports = sendEmail;