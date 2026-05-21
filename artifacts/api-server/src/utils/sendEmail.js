import nodemailer from 'nodemailer';
import process from 'node:process';

const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables must be set');
  }

  // Auto-detect SMTP host/port based on EMAIL_USER if not explicitly set
  let host = process.env.EMAIL_HOST;
  let port = parseInt(process.env.EMAIL_PORT) || 587;
  let secure = false;

  if (!host) {
    const domain = emailUser.split('@')[1]?.toLowerCase();
    if (domain === 'gmail.com') {
      host = 'smtp.gmail.com';
      port = 587;
      secure = false;
    } else if (domain === 'yahoo.com' || domain === 'ymail.com') {
      host = 'smtp.mail.yahoo.com';
      port = 465;
      secure = true;
    } else if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
      host = 'smtp-mail.outlook.com';
      port = 587;
      secure = false;
    } else {
      // Generic fallback using Gmail
      host = 'smtp.gmail.com';
      port = 587;
      secure = false;
    }
  } else {
    secure = port === 465;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
    greetingTimeout: 10000,
  });

  const mailOptions = {
    from: `AniXo <${emailUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('SMTP Email Error:', error);
    throw error;
  }
};

export default sendEmail;
