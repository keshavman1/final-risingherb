
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const DEFAULT_ADMINS = [
  { email: 'admin1@risingherb.com', password: 'AdminPass1!', phone: '919900000001', name: 'Admin One' },
  { email: 'admin2@risingherb.com', password: 'AdminPass2!', phone: '919900000002', name: 'Admin Two' }
];

async function seedAdmins() {
  try {
    // Read from env; fall back to defaults
    let admins = DEFAULT_ADMINS;
    if (process.env.ADMIN_USERS) {
      try {
        const parsed = JSON.parse(process.env.ADMIN_USERS);
        if (Array.isArray(parsed) && parsed.length) admins = parsed;
      } catch (e) {
        console.warn('ADMIN_USERS is not valid JSON — using default admins.');
      }
    }

    for (const a of admins) {
      if (!a.email || !a.password) {
        console.warn('Skipping invalid admin entry (needs email and password):', a);
        continue;
      }
      const email = a.email.toLowerCase().trim();
      let user = await User.findOne({ email });

      if (user) {
        // If user exists but not admin, promote and optionally update phone/name
        let changed = false;
        if (user.role !== 'admin') { user.role = 'admin'; changed = true; }
        if (a.phone && user.phone !== a.phone) { user.phone = a.phone; changed = true; }
        if (a.name && user.name !== a.name) { user.name = a.name; changed = true; }
        if (changed) {
          await user.save();
          console.log(`Updated/promoted existing user to admin: ${email}`);
        } else {
          console.log(`Admin already exists: ${email}`);
        }
      } else {
        // Create new admin (hash password)
        const passwordHash = await bcrypt.hash(a.password, 10);
        user = new User({
          name: a.name || '',
          email,
          phone: a.phone || '',
          passwordHash,
          role: 'admin'
        });
        await user.save();
        console.log(`Created admin: ${email}`);
      }
    }
  } catch (err) {
    console.error('seedAdmins error:', err);
  }
}

module.exports = seedAdmins;
