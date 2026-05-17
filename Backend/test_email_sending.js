const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Testing email sending with:');
console.log('USER:', process.env.EMAIL_USER);
console.log('PASS:', process.env.EMAIL_PASS ? '********' : 'MISSING');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to self
  subject: 'Vault Email Test',
  text: 'If you see this, your email configuration is working!'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('FAILED to send email:');
    console.error(error);
  } else {
    console.log('SUCCESS! Email sent: ' + info.response);
  }
});
