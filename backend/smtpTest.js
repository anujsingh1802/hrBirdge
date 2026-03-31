const nodemailer = require('nodemailer');
(async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      logger: true,
      debug: true,
    });

    const info = await transporter.sendMail({
      from: '"HyreIn Test" <' + process.env.EMAIL_USER + '>',
      to: process.env.EMAIL_USER,
      subject: 'SMTP Test',
      text: 'Test successful',
    });

    console.log('sent', info);
  } catch (e) {
    console.error('send test error', e);
    process.exit(1);
  }
})();
