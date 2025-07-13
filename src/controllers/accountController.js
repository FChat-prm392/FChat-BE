const accountService = require('../services/accountService');
const { CreateEmailAccountDto , UpdateAccountDto, UpdateFcmTokenDto, AccountResponseDto } = require('../dto/accountDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');
const { bucket } = require('../config/firebase');

exports.create = async (req, res) => {
  try {
    const file = req.file;
    const dtoData = req.body;
    const createAccountDto = new CreateEmailAccountDto(dtoData);
    validateDto(createAccountDto);

    if (file) {
      const blob = bucket.file(`avatars/${Date.now()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: { contentType: file.mimetype }
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', reject);
        blobStream.on('finish', resolve);
        blobStream.end(file.buffer);
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      createAccountDto.imageURL = publicUrl;
    }

    const account = await accountService.createAccount(createAccountDto);
    const responseDto = new AccountResponseDto(account);
    res.status(201).json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getAll = async (req, res) => {
  try {
    const accounts = await accountService.getAllAccounts();
    const responseDto = accounts.map(account => new AccountResponseDto(account));
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getById = async (req, res) => {
  try {
    const account = await accountService.getAccountById(req.params.id);
    if (!account) return res.status(404).json({ message: "Not found" });
    
    const responseDto = new AccountResponseDto(account);
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.update = async (req, res) => {
  try {
    const updateAccountDto = new UpdateAccountDto(req.body);
    validateDto(updateAccountDto);
    
    const account = await accountService.updateAccount(req.params.id, updateAccountDto);
    if (!account) return res.status(404).json({ message: "Not found" });
    
    const responseDto = new AccountResponseDto(account);
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.remove = async (req, res) => {
  try {
    const account = await accountService.deleteAccount(req.params.id);
    if (!account) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.updateFcmToken = async (req, res) => {
  try {
    const updateFcmTokenDto = new UpdateFcmTokenDto(req.body);
    validateDto(updateFcmTokenDto);

    const updated = await accountService.updateFcmToken(updateFcmTokenDto.userId, updateFcmTokenDto.fcmToken);
    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'FCM token updated' });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const { account } = await accountService.login(email, password);
    const responseDto = new AccountResponseDto(account);
    res.json({ user: responseDto });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.getUserStatus = async (req,res) => {
  try
  {
   const {userId} = req.params;
   const status = await accountService.getUserStatus(userId);
   res.json(status);
  } catch (err)
  {
    res.status(500).json({ message: 'Internal server error' });
  }
}
