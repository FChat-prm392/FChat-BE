const Message = require('../models/Message');
const Chat = require('../models/Chat');

async function createMessage(data) {
  const message = await Message.create(data);
  await Chat.findByIdAndUpdate(message.chatID, {
    lastMessageID: message._id,
  });
  return message;
}

async function getMessagesByChat(chatId, limit = 50) {
  return await Message.find({ chatID: chatId })
    .populate('senderID', 'fullname username imageURL')
    .sort({ createAt: -1 })
    .limit(limit)
    .lean();
}

module.exports = {
  createMessage,
  getMessagesByChat,
};
