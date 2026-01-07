// const nodemailer = require('nodemailer');
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
// const dotenv = require('dotenv');
dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // connectionTimeout: 20000, 
  // greetingTimeout: 20000,
  // socketTimeout: 20000,
  // tls: {
  //   rejectUnauthorized: false
  // }
});

async function sendVerificationEmail(toEmail, token){
  console.log("Sending verification email to:", toEmail);
    const verifyUrl = `${process.env.BACKEND_URL || "https://dacntt-mylms-1.onrender.com"}/api/v1/user/verify-email?token=${token}`;
    const html = `
    <p>Hello,</p>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verifyUrl}">Verify Email</a>
    <p>This link will expire in 1 hour.</p>
    
  `;

  await transporter.sendMail({
    from: `"My LMS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your email",
    html,
  });
}

async function sendEmail(toEmail, subject, html) {
  await transporter.sendMail({
    from: `"My LMS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
}


//tối 27/10 thêm chức năng quên mật khẩu
async function sendResetPasswordEmail(toEmail, token) {
  const resetUrl = `${process.env.FRONTEND_URL || "https://dacntt-my-lms.vercel.app"}/reset-password?token=${token}`;
  const html = `
    <p>Xin chào,</p>
    <p>Bấm vào link để đặt lại mật khẩu:</p>
    <a href="${resetUrl}">Reset mật khẩu</a>
    <p>Link sẽ hết hạn trong 1 giờ.</p>
  `;

  await transporter.sendMail({
    from: `"MY LMS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your password",
    html,
  });
}

// module.exports = { sendVerificationEmail, sendEmail };
export { sendVerificationEmail, sendEmail, sendResetPasswordEmail };
