const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  groupName: String,
  groupAvatar: String,
  createBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  lastMessageID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } });

module.exports = mongoose.model('Chat', chatSchema);
