const admin = require('../config/firebase');

async function sendPushNotification(token, title, body, data = {}) {
  const message = {
    token,
    notification: { title, body },
    data 
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('❌ FCM push failed:', error);
    throw error;
  }
}

module.exports = { sendPushNotification };
