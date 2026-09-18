const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedback_portal';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failure: ${error.message}`);
    console.warn('⚠️ Server will continue running, but MongoDB operations will fail until valid database credentials are configured.');
  }
};

module.exports = connectDB;