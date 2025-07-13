const mongoose = require('mongoose');

const messageReactionSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  emoji: {
    type: String,
    required: true,
    trim: true
  }
}, { 
  timestamps: { createdAt: 'createAt', updatedAt: false },
  indexes: [
    { messageId: 1, userId: 1, emoji: 1 },
    { messageId: 1 },
    { userId: 1 }
  ]
});

messageReactionSchema.index({ messageId: 1, userId: 1, emoji: 1 }, { unique: true });

module.exports = mongoose.model('MessageReaction', messageReactionSchema);
