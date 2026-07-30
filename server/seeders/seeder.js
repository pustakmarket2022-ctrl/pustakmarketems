const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const initAdminUser = async () => {
  try {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('[Init]: Connected to MongoDB Atlas...');
    } catch (atlasErr) {
      console.warn(`[Init Warning]: MongoDB Atlas connection error (${atlasErr.message}). Falling back to local MongoDB...`);
      await mongoose.connect('mongodb://127.0.0.1:27017/pustak_market_ems');
      console.log('[Init]: Connected to local MongoDB...');
    }

    console.log('[Init]: Ensuring initial Admin accounts exist (No data will be deleted)...');

    // 1. Check & Create Super Admin if not existing
    let superAdmin = await User.findOne({ email: 'superadmin@pustakmarket.com' });
    if (!superAdmin) {
      superAdmin = await User.create({
        employeeId: 'EMP-2026-0001',
        fullName: 'Vikramaditya Sharma',
        email: 'superadmin@pustakmarket.com',
        password: 'password123',
        phone: '+91 98765 00001',
        role: 'Admin',
        department: 'HR',
        designation: 'Managing Director',
        salaryType: 'Monthly',
        fixedSalary: 150000,
        status: 'Active',
      });
      console.log('[Init]: Created default Super Admin account (superadmin@pustakmarket.com).');
    } else {
      console.log('[Init]: Super Admin account already exists. Preserved existing account.');
    }

    // 2. Check & Create Admin Milind Kasbe if not existing
    let adminMK = await User.findOne({ email: 'mk@pustakmarket.com' });
    if (!adminMK) {
      adminMK = await User.create({
        employeeId: 'EMP-2026-0002',
        fullName: 'Milind Kasbe',
        email: 'mk@pustakmarket.com',
        password: 'password123',
        phone: '+91 98765 00002',
        role: 'Admin',
        department: 'Editorial',
        designation: 'Chief Editor & Publishing Head',
        salaryType: 'Monthly',
        fixedSalary: 120000,
        status: 'Active',
      });
      console.log('[Init]: Created default Admin account (mk@pustakmarket.com).');
    } else {
      console.log('[Init]: Admin Milind Kasbe account already exists. Preserved existing account.');
    }

    console.log('\n==========================================');
    console.log(' DATABASE INITIALIZATION COMPLETED SUCCESSFULLY');
    console.log(' ALL STORED DATA PRESERVED - NO DUMMY DATA ADDED');
    console.log('==========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Init Error]:', err);
    process.exit(1);
  }
};

initAdminUser();
