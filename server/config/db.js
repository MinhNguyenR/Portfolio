const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ FATAL MongoDB Connection Error:');
    console.error(error);
    console.log('⚠️ Warning: MONGO_URI might be missing or incorrect in environment variables.');
  }
};

module.exports = connectDB;
