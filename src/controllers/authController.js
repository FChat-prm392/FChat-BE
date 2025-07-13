const { admin } = require('../config/firebase');
const accountService = require('../services/accountService');
const { CreateEmailAccountDto, AccountResponseDto } = require('../dto/accountDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');

exports.googleLogin = async (req, res) => {
  try {
    console.log('🔍 Starting Google login process...');
    
    const { idToken, fcmToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    console.log('🔑 Verifying ID token...');

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    console.log('✅ Token verified successfully for:', email);

    let account = await accountService.getAccountByEmail(email);

    if (!account) {
      console.log('👤 Creating new user account for:', email);
      
      const accountData = {
        fullname: name || email.split('@')[0],
        username: email.split('@')[0] + '_' + Date.now(),
        email: email,
        password: uid,
        imageURL: picture || '',
        fcmToken: fcmToken || '',
        gender: '',
        phoneNumber: '',
        currentStatus: 'online'
      };

      const createAccountDto = new CreateEmailAccountDto(accountData);
      validateDto(createAccountDto);
      
      account = await accountService.createAccount(createAccountDto);
      console.log('✅ New account created successfully');
    } else {
      console.log('👤 User already exists');
      
      if (fcmToken && fcmToken !== account.fcmToken) {
        await accountService.updateFcmToken(account._id, fcmToken);
        account = await accountService.getAccountById(account._id);
        console.log('✅ FCM token updated');
      }
    }

    const responseDto = new AccountResponseDto(account);

    res.json({
      success: true,
      message: 'Authentication successful',
      user: responseDto,
      token: idToken
    });

  } catch (error) {
    console.error('❌ Google login failed:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'ID token has expired'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'ID token has been revoked'
      });
    }

    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid ID token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed: ' + error.message
    });
  }
};