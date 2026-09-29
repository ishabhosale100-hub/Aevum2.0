const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Temporary store for OTPs
const otpStorage = new Map();

// Configure Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Dynamic Signup/Login endpoint: Accepts any email/password and sends OTP
app.post('/api/auth/login-signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with a 5-minute expiration
  otpStorage.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Aevum Security - Your Verification OTP',
    text: `Your login/signup verification code for Aevum is: ${otp}. This code is valid for 5 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent successfully to your email.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send OTP email. Check backend console.' });
  }
});

// Endpoint to verify the OTP entered by the user
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStorage.get(email);

  if (!record) {
    return res.status(400).json({ error: 'No OTP requested for this email. Please request a new one.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStorage.delete(email);
    return res.status(400).json({ error: 'OTP has expired.' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP code.' });
  }

  // Verification successful
  otpStorage.delete(email);
  res.json({ success: true, message: 'Verified successfully!', token: 'dummy-jwt-token-aevum' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));