const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  requestStatus: {
    type: String,
    enum: ['pending', 'accepted', 'blocked', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Friendship', friendshipSchema);
