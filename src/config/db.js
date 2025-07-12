const mongoose = require('mongoose');

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(' Connected to MongoDB via Mongoose');
  } catch (error) {
    console.error(' Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = { connectDb };
