const accountService = require('../services/accountService');
const { CreateEmailAccountDto, UpdateAccountDto, UpdateFcmTokenDto, AccountResponseDto } = require('../dto/accountDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');
const { bucket } = require('../config/firebase');

exports.create = async (req, res) => {
  try {
    const createAccountDto = new CreateEmailAccountDto(req.body);
    validateDto(createAccountDto);

    const file = req.file;
    if (file) {
      const fileName = `avatars/${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      stream.on('error', (err) => {
        console.error('Upload error:', err);
        return res.status(500).json({ message: 'Upload failed' });
      });

      stream.on('finish', async () => {
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        createAccountDto.imageURL = publicUrl;

        const account = await accountService.createAccount(createAccountDto);
        const responseDto = new AccountResponseDto(account);
        res.status(201).json(responseDto);
      });

      stream.end(file.buffer);
    } else {
      const account = await accountService.createAccount(createAccountDto);
      const responseDto = new AccountResponseDto(account);
      res.status(201).json(responseDto);
    }
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getAll = async (req, res) => {
  try {
    const { q } = req.query;
    const accounts = await accountService.getAllAccountsWithSearch(q);
    const responseDto = accounts.map(account => new AccountResponseDto(account));
    
    return res.status(200).json({
      success: true,
      message: q ? "Search completed successfully" : "Accounts retrieved successfully",
      data: responseDto
    });
  } catch (err) {
    console.error('Error getting accounts:', err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const account = await accountService.getAccountById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    
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

    const file = req.file;

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
      updateAccountDto.imageURL = publicUrl;
    }

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
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json({ message: "Account deleted successfully" });
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

    res.json({ message: 'FCM token updated successfully' });
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

exports.getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const status = await accountService.getUserStatus(userId);
    res.json(status);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long"
      });
    }

    const searchQuery = q.trim();
    const accounts = await accountService.searchAccounts(searchQuery);
    const responseDto = accounts.map(account => new AccountResponseDto(account));

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: responseDto
    });
  } catch (error) {
    console.error('Error searching accounts:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

