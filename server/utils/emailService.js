const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || 'test',
      pass: process.env.SMTP_PASS || 'test',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Pustak Market HR'} <${process.env.FROM_EMAIL || 'noreply@pustakmarket.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`[Email Sent]: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[Email Error]: ${err.message}`);
    return false;
  }
};

module.exports = sendEmail;
