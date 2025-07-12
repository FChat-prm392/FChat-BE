const accountService = require('../services/accountService');
const { CreateEmailAccountDto , UpdateAccountDto, UpdateFcmTokenDto, AccountResponseDto } = require('../dto/accountDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');

exports.create = async (req, res) => {
  try {
    const createAccountDto = new CreateEmailAccountDto(req.body);
    validateDto(createAccountDto);
    
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
