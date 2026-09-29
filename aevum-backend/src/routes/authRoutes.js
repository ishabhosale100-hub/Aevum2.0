const express = require('express');
const router = express.Router();
const { signup, login, verifyOtpAndLogin } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtpAndLogin);

module.exports = router;