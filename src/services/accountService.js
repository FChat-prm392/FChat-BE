const Account = require('../models/Account');
const onlineUsersManager = require('../utils/onlineUsers');

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

async function searchAccounts(searchQuery) {
  return await Account.find({
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
  getAllAccountsWithSearch
};