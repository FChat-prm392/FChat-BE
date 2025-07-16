const Friendship = require('../models/Friendship');

exports.createFriendship = async (data) => {
  const friendship = new Friendship(data);
  return await friendship.save();
};

exports.checkExistingFriendship = async (requester, recipient) => {
  return await Friendship.findOne({
    $or: [
      { requester, recipient },
      { requester: recipient, recipient: requester }
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
  }).populate('requester', 'fullname username email imageURL currentStatus');
};

exports.getFriendsByUserId = async (userId) => {
  return await Friendship.find({
    requestStatus: 'accepted',
    $or: [{ requester: userId }, { recipient: userId }]
  }).populate('requester recipient', 'fullname username email imageURL currentStatus');
};

exports.getFriendListByUserId = async (userId) => {
  const friendships = await Friendship.find({
    requestStatus: 'accepted',
    $or: [{ requester: userId }, { recipient: userId }]
  }).populate('requester recipient', 'fullname username email imageURL currentStatus lastOnline');

  return friendships.map(f =>
    f.requester._id.toString() === userId ? f.recipient : f.requester
  );
};

exports.deleteFriendship = async (id) => {
  return await Friendship.findByIdAndDelete(id);
};
