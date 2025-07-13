const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');

if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../firebase-service-account.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.firebasestorage.app` 
    });
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

const bucket = getStorage().bucket();

module.exports = { admin, bucket };