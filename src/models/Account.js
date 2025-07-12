const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  fullname: String,
  username: String,
  email: String,
  password: String,
  fcmToken: String,
  gender: String,
  phoneNumber: String,
  imageURL: String,
  currentStatus: String,
  status: {
    type: Boolean,
    default: true
  },
  lastOnline: Date,
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);