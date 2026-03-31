const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, html }) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration is incomplete. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in env.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  const mailOptions = {
    from: `"HyreIn" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} | messageId=${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send OTP email to ${email}:`, error);
    throw new Error('Failed to send OTP email. Please try again later.');
  }
};

module.exports = sendEmail;
