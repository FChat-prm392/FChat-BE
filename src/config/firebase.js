const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');

// Check if Firebase is already initialized to prevent re-initialization
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../firebase-service-account.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.firebasestorage.app` // Changed from .firebasestorage.app
    });
    
    console.log('🔥 Firebase Admin SDK initialized successfully');
    console.log('📦 Storage bucket:', `${serviceAccount.project_id}.firebasestorage.app`);
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
} else {
  console.log('🔥 Firebase Admin SDK already initialized');
}

const bucket = getStorage().bucket();

module.exports = { admin, bucket };