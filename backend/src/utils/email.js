import nodemailer from 'nodemailer';

const getFrontendUrl = () => {
  const value = process.env.FRONTEND_URL || 'http://localhost:5173';
  return value.startsWith('http') ? value : `https://${value}`;
};

const sendEmail = async ({ to, subject, html }) => {
  const smtpUser = process.env.SMTP_USER?.trim();
  const appPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '');

  if (!smtpUser || !appPassword) {
    throw new Error('Email delivery is not configured. Set SMTP_USER and SMTP_APP_PASSWORD.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: appPassword,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Dayflow HRMS <${smtpUser}>`,
    to,
    subject,
    html,
  });
};

export const sendInvitationEmail = ({ email, name, token }) => {
  const url = `${getFrontendUrl()}/register?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: 'You are invited to Dayflow HRMS',
    html: `<h2>Welcome to Dayflow, ${name}</h2><p>Your HR administrator created an account for you.</p><p><a href="${url}">Verify your email and create your password</a></p><p>This link expires in 24 hours.</p>`,
  });
};

export const sendPasswordResetEmail = ({ email, name, token }) => {
  const url = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: 'Reset your Dayflow password',
    html: `<h2>Password reset</h2><p>Hello ${name},</p><p><a href="${url}">Choose a new password</a></p><p>This link expires in 30 minutes. Ignore this message if you did not request it.</p>`,
  });
};
