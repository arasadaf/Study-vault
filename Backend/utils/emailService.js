const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"Vault Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  };

  try {
    console.log(`Attempting to send email to ${to} via smtp.gmail.com:465...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully: ' + info.response);
    return info;
  } catch (error) {
    console.error('🚨 [Nodemailer SMTP Error]:', error.message);
    console.error('🚨 [Nodemailer Full Details]:', error);
    // In development, we log the OTP to the console if email fails
    if (text.includes('OTP')) {
      console.log('--- DEVELOPMENT OTP LOG ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${text}`);
      console.log('---------------------------');
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
