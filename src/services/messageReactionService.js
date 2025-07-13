const MessageReaction = require('../models/MessageReaction');
const Message = require('../models/Message');

async function addReaction(messageId, userId, emoji) {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  const existingReaction = await MessageReaction.findOne({
    messageId,
    userId,
    emoji
  });

  if (existingReaction) {
    throw new Error('Reaction already exists');
  }

  const reaction = await MessageReaction.create({
    messageId,
    userId,
    emoji
  });

  return await MessageReaction.findById(reaction._id)
    .populate('userId', 'fullname username imageURL')
    .populate('messageId', '_id');
}

async function removeReaction(messageId, userId, emoji) {
  const reaction = await MessageReaction.findOneAndDelete({
    messageId,
    userId,
    emoji
  });

  if (!reaction) {
    throw new Error('Reaction not found');
  }

  return reaction;
}

async function getMessageReactions(messageId) {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  const reactions = await MessageReaction.find({ messageId })
    .populate('userId', 'fullname username imageURL')
    .sort({ createAt: 1 });

  return reactions;
}

async function getUserReactionForMessage(messageId, userId) {
  return await MessageReaction.find({ messageId, userId })
    .populate('userId', 'fullname username imageURL');
}

async function getReactionsByUser(userId) {
  return await MessageReaction.find({ userId })
    .populate('messageId', 'text senderID chatID')
    .populate('userId', 'fullname username imageURL')
    .sort({ createAt: -1 });
}

async function removeAllReactionsFromMessage(messageId) {
  return await MessageReaction.deleteMany({ messageId });
}

async function getReactionSummaryForMessage(messageId) {
  const reactions = await MessageReaction.find({ messageId })
    .populate('userId', 'fullname username imageURL');
  
  return reactions;
}

module.exports = {
  addReaction,
  removeReaction,
  getMessageReactions,
  getUserReactionForMessage,
  getReactionsByUser,
  removeAllReactionsFromMessage,
  getReactionSummaryForMessage
};
