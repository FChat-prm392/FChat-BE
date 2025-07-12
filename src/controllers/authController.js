const admin = require('../config/firebase');
const accountService = require('../services/accountService');
const { AccountResponseDto, CreateGoogleAccountDto } = require('../dto/accountDto');
const { handleValidationError, validateDto } = require('../dto/validationHelper');

exports.googleLogin = async (req, res) => {
  const { idToken, fcmToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Missing Firebase ID token' });
  }

  try {
   const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let account = await accountService.getAccountByEmail(email);

    if (!account) {
      const dto = new CreateGoogleAccountDto({
        email,
        fullname: name,
        imageURL: picture,
        fcmToken
      });

      validateDto(dto); 

      account = await accountService.createAccount(dto);
    }

    if (fcmToken && account.fcmToken !== fcmToken) {
      await accountService.updateFcmToken(account._id, fcmToken);
    }

    const responseDto = new AccountResponseDto(account);
    res.json(responseDto);

  } catch (err) {
    console.error(' Google login failed:', err);
    handleValidationError(err, res);
  }
};
