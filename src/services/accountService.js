const Account = require('../models/Account');
const Friendship = require('../models/Friendship');
const onlineUsersManager = require('../utils/onlineUsers');
const mongoose = require('mongoose');

async function createAccount(data) {
  return await Account.create(data);
}

async function getAllAccounts() {
  return await Account.find();
}

async function getAccountById(id) {
  return await Account.findById(id);
}

async function getAccountByEmail(email) {
  return await Account.findOne({ email });
}

async function updateAccount(id, data) {
  return await Account.findByIdAndUpdate(id, data, { new: true });
}

async function deleteAccount(id) {
  return await Account.findByIdAndDelete(id);
}

async function updateFcmToken(userId, fcmToken) {
  return await Account.findByIdAndUpdate(userId, { fcmToken }, { new: true });
}

async function login(email, password) {
  const account = await Account.findOne({ email });
  if (!account || account.password !== password) {
    throw new Error('Invalid email or password');
  }

  return { account };
}

async function getUserStatus(userId) {
  const isOnline = onlineUsersManager.has(userId);
  const account = await Account.findById(userId, 'lastOnline');
  return { 
    userId, 
    isOnline, 
    lastOnline: account ? account.lastOnline : null 
  };
}

async function searchAccounts(searchQuery, currentUserId) {
  const accounts = await Account.find({
    $or: [
      { fullname: { $regex: searchQuery, $options: 'i' } },
      { username: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } }
    ],
    status: true
  })
  .select('-password -fcmToken')
  .limit(20)
  .sort({ fullname: 1 });

  // Fetch friendships for the current user
  const friendships = await Friendship.find({
    $or: [
      { requester: currentUserId },
      { recipient: currentUserId },
    ],
  });

  // Map accounts with their friendship status
  return accounts.map(account => {
    const friendship = friendships.find(f =>
      (f.requester.toString() === currentUserId && f.recipient.toString() === account._id.toString()) ||
      (f.recipient.toString() === currentUserId && f.requester.toString() === account._id.toString())
    );
    return {
      ...account.toObject(),
      friendshipStatus: friendship ? friendship.requestStatus : 'NONE',
    };
  });
}

async function getAllAccountsWithSearch(searchQuery = null) {
  let query = { status: true };
  
  if (searchQuery && searchQuery.trim().length >= 2) {
    const trimmedQuery = searchQuery.trim();
    query.$or = [
      { fullname: { $regex: trimmedQuery, $options: 'i' } },
      { username: { $regex: trimmedQuery, $options: 'i' } },
      { email: { $regex: trimmedQuery, $options: 'i' } }
    ];
  }

  return await Account.find(query)
    .select('-password -fcmToken')
    .limit(searchQuery ? 20 : 100)
    .sort({ fullname: 1 });
}

async function getNonFriends(userId) {
  console.log('getNonFriends called with userId:', userId);
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error('Invalid userId:', userId);
    throw new Error('Invalid userId');
  }

  const accounts = await Account.find({ 
    _id: { $ne: userId },
    status: true
  })
  .select('-password -fcmToken')
  .limit(20)
  .sort({ fullname: 1 });
  console.log('Accounts found:', accounts.length);

  const friendships = await Friendship.find({
    $or: [
      { requester: userId },
      { recipient: userId },
    ],
  });
  console.log('Friendships found:', friendships.length);

  const excludedIds = friendships.map(friendship =>
    friendship.requester.toString() === userId
      ? friendship.recipient.toString()
      : friendship.requester.toString()
  );
  console.log('Excluded IDs:', excludedIds);

  const nonFriends = accounts.filter(account => 
    !excludedIds.includes(account._id.toString())
  );
  console.log('Non-friends filtered:', nonFriends.length);

  return nonFriends.map(account => ({
    ...account.toObject(),
    friendshipStatus: 'NONE',
  }));
}

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  updateFcmToken,
  getAccountByEmail,
  login,
  getUserStatus,
  searchAccounts,
  getAllAccountsWithSearch,
  getNonFriends
};