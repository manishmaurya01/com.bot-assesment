require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    const dbConfig = require('./src/config/db');
    await dbConfig();

    const adminEmail = 'admin@com.bot';
    const adminPassword = 'adminpassword123';

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isVerified: true
    });

    console.log('Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
