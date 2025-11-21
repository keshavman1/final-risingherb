// backend/server.js
require('dotenv').config();
const dns = require('dns');

// Prefer Google DNS for Node's c-ares resolver (fixes querySrv ETIMEOUT in many environments)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');

// routes (ensure these paths exist in your project)
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const herbRoutes = require('./routes/herbs');

// seed util (optional — keep if you have it)
const seedAdmins = require('./utils/seedAdmins');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// rate limiter
const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/herbs', herbRoutes);
app.use('/api/chat', chatRoutes);

// Health-check
app.get('/api/health', (req, res) => res.json({ ok: true, now: new Date().toISOString() }));

// Start server + DB connection
async function start() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.LOCAL_MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI (or LOCAL_MONGO_URI) not set in .env');
    }

    // Fail fast if JWT secret missing — avoids runtime jwt.sign crashes later
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not set in environment. Please set JWT_SECRET in backend/.env before starting.');
    }

    console.log('Attempting MongoDB connection to:', process.env.MONGO_URI ? 'Atlas (SRV)' : 'local/non-SRV');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // 15s
      socketTimeoutMS: 45000,
      family: 4, // prefer IPv4 - sometimes helps connectivity
      autoIndex: true
    });

    console.log('MongoDB connected');

    // Seed admins if function available (idempotent)
    if (typeof seedAdmins === 'function') {
      try {
        await seedAdmins();
      } catch (seedErr) {
        console.warn('Warning: seedAdmins() failed (non-fatal):', seedErr && seedErr.message ? seedErr.message : seedErr);
      }
    }

    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  } catch (err) {
    console.error('Failed to start server. Error name:', err && err.name);
    console.error('Failed to start server. Error message:', err && err.message);

    if (err && err.message && err.message.includes('querySrv')) {
      console.error('\nSRV lookup failed. Troubleshooting hints:\n' +
        '- You have already whitelisted 0.0.0.0/0 in Atlas (good for dev).\n' +
        "- If you're on a company VPN / proxy, try disabling it or use another network.\n" +
        "- If issues persist, get the standard (non-SRV) connection string from Atlas and set it as MONGO_URI.\n");
    }

    process.exit(1);
  }
}

start();

module.exports = app;
