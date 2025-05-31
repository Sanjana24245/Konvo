import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOTP } from '../utils/sendEmail.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword)
      return res.status(400).json({ msg: 'All fields are required' });

    if (password !== confirmPassword)
      return res.status(400).json({ msg: 'Passwords do not match' });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ msg: 'Username or Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ msg: 'User registered successfully. You can now login.' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ msg: 'Username and password are required' });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ msg: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Invalid username or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// Send OTP route (no DB storage)
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: 'Email already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await sendOTP(email, otp); // Send OTP via email

    const otpToken = jwt.sign(
      { email, otp },
      process.env.JWT_SECRET,
      { expiresIn: '10m' } // OTP valid for 10 mins
    );

    res.status(200).json({
      msg: 'OTP sent to your email. Please verify.',
      otpToken, // return OTP token to client
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ msg: 'Server error while sending OTP' });
  }
});

// Verify OTP route (no DB check)
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp, otpToken } = req.body;

    if (!otp || !otpToken)
      return res.status(400).json({ msg: 'OTP and token are required' });

    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

    if (decoded.otp !== otp)
      return res.status(400).json({ msg: 'Invalid OTP' });

    res.status(200).json({ msg: 'OTP verified successfully' });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
    }
    res.status(500).json({ msg: 'Server error during OTP verification' });
  }
});

// Search registered users by username
router.get('/search-users', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ msg: "Search query required" });
    }

    const users = await User.find({
      username: { $regex: q, $options: "i" }
    }).select("username");

    res.json(users);
  } catch (err) {
    console.error("User Search Error:", err);
    res.status(500).json({ msg: "Server error during user search" });
  }
});
// ✅ GET /api/auth/me
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password'); // remove password from response
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



export default router;
