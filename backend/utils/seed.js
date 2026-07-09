/**
 * Run once to seed initial superadmin
 * Usage: node utils/seed.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin.model');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Admin.findOne({ email: process.env.ADMIN_SEED_EMAIL });
  if (existing) {
    console.log('Superadmin already exists');
    process.exit(0);
  }
  await Admin.create({
    name: 'Super Admin',
    email: process.env.ADMIN_SEED_EMAIL || 'admin@stockclass.com',
    password: process.env.ADMIN_SEED_PASSWORD || 'Admin@123456',
    role: 'superadmin',
  });
  console.log('✅ Superadmin seeded successfully');
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });