const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    // Don't crash the server if MongoDB is not available
    console.log('⚠️  Server will continue without database. Analytics will not be saved.');
  }
};

module.exports = connectDB;
