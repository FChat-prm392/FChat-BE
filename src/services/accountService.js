const Account = require('../models/Account');

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

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  updateFcmToken,
  getAccountByEmail 
};
