const Friendship = require('../models/Friendship');

exports.createFriendship = async (friendshipData) => {
  const friendship = new Friendship(friendshipData);
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

exports.updateFriendship = async (friendshipId, updateData) => {
  return await Friendship.findByIdAndUpdate(
    friendshipId,
    updateData,
    { new: true }
  );
};

exports.getFriendRequestsByUserId = async (userId) => {
  return await Friendship.find({
    recipient: userId,
    requestStatus: 'pending'
  }).populate('requester', 'fullname username imageURL email currentStatus');
};

exports.getFriendsByUserId = async (userId) => {
  return await Friendship.find({
    $or: [
      { requester: userId },
      { recipient: userId }
    ],
    requestStatus: 'accepted'
  }).populate('requester recipient', 'fullname username imageURL email currentStatus');
};

exports.getFriendListByUserId = async (userId) => {
  const friendships = await Friendship.find({
    $or: [
      { requester: userId },
      { recipient: userId }
    ],
    requestStatus: 'accepted'
  }).populate('requester recipient', 'fullname username imageURL email currentStatus lastOnline');
  
  // Return the friend (not the current user) from each friendship
  return friendships.map(friendship => {
    if (friendship.requester._id.toString() === userId) {
      return friendship.recipient;
    } else {
      return friendship.requester;
    }
  });
};

exports.deleteFriendship = async (friendshipId) => {
  return await Friendship.findByIdAndDelete(friendshipId);
};

exports.getFriendshipById = async (friendshipId) => {
  return await Friendship.findById(friendshipId);
};
