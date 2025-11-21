// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Helper: require JWT secret and give a nice error if missing
function getJwtSecretOrThrow() {
  if (!process.env.JWT_SECRET) {
    // Throwing here will be caught in route try/catch and logged
    throw new Error('JWT_SECRET is not set. Please set JWT_SECRET in your .env file.');
  }
  return process.env.JWT_SECRET;
}

/**
 * POST /api/auth/signup
 * Body: { name, email, phone, password }
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email || !password || !phone) {
      return res.status(400).json({ message: 'Required fields missing (email, phone, password).' });
    }

    // Normalize email same as schema (lowercase/trim)
    const normalizedEmail = String(email).toLowerCase().trim();

    // explicit check for existing user
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      name: name ? String(name).trim() : undefined,
      email: normalizedEmail,
      phone: String(phone).trim(),
      passwordHash: hash
    });

    await user.save();

    // Create token
    const secret = getJwtSecretOrThrow();
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ message: 'User created', token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('signup error:', err && err.message ? err.message : err);

    // common duplicate key race - handle gracefully
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered (duplicate key)' });
    }

    if (err && err.message && err.message.includes('JWT_SECRET')) {
      return res.status(500).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Server error during signup' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).lean();
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // user.passwordHash in schema
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const secret = getJwtSecretOrThrow();
    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, secret, { expiresIn: '7d' });

    return res.json({ message: 'Login successful', token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('login error:', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
