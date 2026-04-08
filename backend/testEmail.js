const nodemailer = require('nodemailer');
require('dotenv').config();

const sendTestEmail = async () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Test" <${process.env.EMAIL_USER}>`,
    to: "anujsingh020206@gmail.com",
    subject: "Test Email",
    text: "This is a test email.",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

sendTestEmail();
