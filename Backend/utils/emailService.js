const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM ? `"Study Vault" <${process.env.EMAIL_FROM}>` : `"Study Vault" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  };

  try {
    console.log(`Attempting to send email to ${to} via ${process.env.SMTP_HOST || 'smtp.gmail.com'}:${process.env.SMTP_PORT || '465'}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully: ' + info.response);
    return info;
  } catch (error) {
    console.error('🚨 [Nodemailer SMTP Error]:', error.message);
    console.error('🚨 [Nodemailer Full Details]:', error);
    
    // Log OTP details to server console so registration/verification is not blocked during development/SMTP failure
    if (text && text.includes('OTP')) {
      console.log('\n⚠️  [SMTP FAILURE FALLBACK] Email delivery failed, but OTP is printed below for verification:');
      console.log('--- DEVELOPMENT OTP LOG ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${text}`);
      console.log('---------------------------\n');
    }

    return null;
  }
};

const sendVerificationOTP = async (email, otp) => {
  const subject = 'Verify your Vault Account';
  const text = `Your verification OTP is: ${otp}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6366f1;">Welcome to Vault!</h2>
      <p>Please use the following One-Time Password (OTP) to verify your account:</p>
      <div style="font-size: 24px; font-bold; letter-spacing: 5px; padding: 10px; background: #f3f4f6; text-align: center; border-radius: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;
  return await sendEmail(email, subject, text, html);
};

const sendPasswordResetOTP = async (email, otp) => {
  const subject = 'Reset your Vault Password';
  const text = `Your password reset OTP is: ${otp}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6366f1;">Password Reset Request</h2>
      <p>We received a request to reset your password. Use the OTP below to proceed:</p>
      <div style="font-size: 24px; font-bold; letter-spacing: 5px; padding: 10px; background: #f3f4f6; text-align: center; border-radius: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;
  return await sendEmail(email, subject, text, html);
};

module.exports = {
  sendVerificationOTP,
  sendPasswordResetOTP
};

// Verify transporter connectivity (useful at startup to ensure SMTP is configured)
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    const maskedUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/(^.).+(@.*$)/, '$1***$2') : 'unknown';
    console.log(`✅ SMTP transporter verified (host=${process.env.SMTP_HOST || 'smtp.gmail.com'}, user=${maskedUser})`);
    return true;
  } catch (err) {
    console.error('❌ SMTP verification failed:', err && err.message ? err.message : err);
    return false;
  }
};

module.exports.verifyTransporter = verifyTransporter;
