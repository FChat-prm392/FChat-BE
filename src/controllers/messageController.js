const messageService = require('../services/messageService');
const { CreateMessageDto, MessageResponseDto } = require('../dto/messageDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');

exports.sendMessage = async (req, res) => {
  try {
    const createMessageDto = new CreateMessageDto(req.body);
    validateDto(createMessageDto);
    
    const message = await messageService.createMessage(createMessageDto);
    const responseDto = new MessageResponseDto(message);
    res.status(201).json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await messageService.getMessagesByChat(chatId, limit);
    const responseDto = messages.map(message => new MessageResponseDto(message));
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};
