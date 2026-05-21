import nodemailer from 'nodemailer';
import process from 'node:process';

const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables must be set');
  }

  const domain = emailUser.split('@')[1]?.toLowerCase();

  let transportConfig;

  if (domain === 'gmail.com') {
    transportConfig = {
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      greetingTimeout: 10000,
    };
  } else if (domain === 'yahoo.com' || domain === 'ymail.com') {
    transportConfig = {
      host: 'smtp.mail.yahoo.com',
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPass },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      greetingTimeout: 10000,
    };
  } else if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
    transportConfig = {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      greetingTimeout: 10000,
    };
  } else {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT) || 587;
    transportConfig = {
      host,
      port,
      secure: port === 465,
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      greetingTimeout: 10000,
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);

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
