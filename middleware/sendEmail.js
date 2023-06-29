const nodemailer = require("nodemailer");



const sendMail = async(recipientEmail, emailSubject, emailText) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: recipientEmail,
        subject: emailSubject,
        text: emailText,
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = sendMail;
