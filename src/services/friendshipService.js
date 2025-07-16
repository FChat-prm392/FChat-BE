const Friendship = require('../models/Friendship');

exports.createFriendship = async (data) => {
  const friendship = new Friendship(data);
  return await friendship.save();
};

exports.checkExistingFriendship = async (requesterId, recipientId) => {
  return await Friendship.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId }
    ]
  });
};

exports.updateFriendship = async (id, data) => {
  return await Friendship.findByIdAndUpdate(id, data, { new: true });
};

exports.getFriendRequestsByUserId = async (userId) => {
  return await Friendship.find({
    recipient: userId,
    requestStatus: 'pending'
  }).populate('requester', 'fullname username imageURL email currentStatus');
};

exports.getFriendsByUserId = async (userId) => {
  return await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    requestStatus: 'accepted'
  }).populate('requester recipient', 'fullname username imageURL email currentStatus');
};

exports.getFriendListByUserId = async (userId) => {
  const friendships = await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    requestStatus: 'accepted'
  }).populate('requester recipient', 'fullname username imageURL email currentStatus lastOnline');

  return friendships.map(f => {
    return f.requester._id.toString() === userId ? f.recipient : f.requester;
  });
};

exports.deleteFriendship = async (id) => {
  return await Friendship.findByIdAndDelete(id);
};
