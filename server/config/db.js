const mongoose = require('mongoose');
const dns = require('dns');

// Set public DNS servers to resolve MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if fails
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Primary MongoDB Connection Failed]: ${error.message}`);
    console.log('[MongoDB]: Attempting fallback connection to local MongoDB database...');
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/pustak_market_ems');
      console.log(`[MongoDB Connected (Fallback Local)]: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`[MongoDB Fallback Error]: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
