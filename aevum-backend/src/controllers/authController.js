const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Signup
async function signup(req, res) {
  const { email, password, phone } = req.body;
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, phone) VALUES ($1, $2, $3) RETURNING id, email, phone',
      [email, passwordHash, phone]
    );

    res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup (Email may already exist)' });
  }
}

// Login
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // In a real flow, trigger OTP here before final JWT issue
    res.json({ message: 'Password verified. Proceed to OTP verification.', userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
}

// Verify OTP & Issue Final JWT
async function verifyOtpAndLogin(req, res) {
  const { userId, otp } = req.body;
  // Mock verification check (Accept '123456' for testing)
  if (otp !== '123456') {
    return res.status(400).json({ error: 'Invalid OTP code' });
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '4h' });
  res.json({ message: 'Authentication successful', token });
}

module.exports = { signup, login, verifyOtpAndLogin };