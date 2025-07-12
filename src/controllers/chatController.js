const chatService = require('../services/chatService');
const { CreateChatDto, UpdateGroupDto, AddParticipantDto, ChatResponseDto } = require('../dto/chatDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');

exports.create = async (req, res) => {
  try {
    const createChatDto = new CreateChatDto(req.body);
    validateDto(createChatDto);
    
    const chat = await chatService.createChat(createChatDto);
    const responseDto = new ChatResponseDto(chat);
    res.status(201).json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const chats = await chatService.getAllChatsForUser(req.params.userId);
    const responseDto = chats.map(chat => new ChatResponseDto(chat));
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getChat = async (req, res) => {
  try {
    const chat = await chatService.getChatById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    
    const responseDto = new ChatResponseDto(chat);
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.addParticipant = async (req, res) => {
  try {
    const addParticipantDto = new AddParticipantDto(req.body);
    validateDto(addParticipantDto);
    
    const chat = await chatService.addUserToChat(req.params.chatId, addParticipantDto.userId);
    const responseDto = new ChatResponseDto(chat);
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const updateGroupDto = new UpdateGroupDto(req.body);
    validateDto(updateGroupDto);
    
    const chat = await chatService.updateGroupInfo(req.params.chatId, updateGroupDto);
    const responseDto = new ChatResponseDto(chat);
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};
