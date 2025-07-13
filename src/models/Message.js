const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: String,
  url: String,
  fileName: String
}, { _id: false });

const messageSchema = new mongoose.Schema({
  senderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  chatID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  text: String,
  messageStatus: {
    type: String,
    enum: ['Draft', 'Send', 'Seen'],
    default: 'Send'
  },
  media: [mediaSchema],
deliveredTo: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    timestamp: { type: Date, default: Date.now }
  }],
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: { createdAt: 'createAt', updatedAt: false } });

module.exports = mongoose.model('Message', messageSchema);
