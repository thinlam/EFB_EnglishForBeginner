const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

// Email cấu hình
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'your-app-password' // tạo ở https://myaccount.google.com/apppasswords
  },
});

// Gửi OTP
exports.sendOtpEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).send({ error: 'Thiếu email hoặc OTP' });
    }

    const mailOptions = {
      from: 'EFB <youremail@gmail.com>',
      to: email,
      subject: 'Mã OTP xác thực',
      text: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong 5 phút.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.send({ success: true });
    } catch (error) {
      console.error('Lỗi gửi email:', error);
      res.status(500).send({ error: 'Gửi email thất bại' });
    }
  });
});
