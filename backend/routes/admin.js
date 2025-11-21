const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticate, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Admin login with single backend key (kept in .env)
router.post('/login', async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ message: 'Key required' });
    if (key !== process.env.ADMIN_KEY) return res.status(401).json({ message: 'Invalid admin key' });

    const token = jwt.sign({ id: 'admin', role: 'admin', email: process.env.ADMIN_EMAIL || 'admin@risingherb' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Example admin-only endpoint: list users (no passwordHash returned)
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('admin users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
