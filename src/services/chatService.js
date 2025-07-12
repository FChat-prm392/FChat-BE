const Chat = require('../models/Chat');

async function createChat(data) {
  return await Chat.create(data);
}

async function getAllChatsForUser(userId) {
  return await Chat.find({ participants: userId })
    .populate('participants', 'fullname username imageURL')
    .populate('lastMessageID')
    .sort({ updateAt: -1 });
}

async function getChatById(chatId) {
  return await Chat.findById(chatId)
    .populate('participants', 'fullname username imageURL')
    .populate('lastMessageID');
}

async function addUserToChat(chatId, userId) {
  return await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { participants: userId } },
    { new: true }
  );
}

async function updateGroupInfo(chatId, data) {
  return await Chat.findByIdAndUpdate(chatId, data, { new: true });
}

module.exports = {
  createChat,
  getAllChatsForUser,
  getChatById,
  addUserToChat,
  updateGroupInfo,
};
