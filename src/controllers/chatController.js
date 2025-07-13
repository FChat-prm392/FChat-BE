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

exports.getChatParticipants = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await chatService.getChatParticipants(chatId);
    
    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat not found' 
      });
    }
    
    res.json({
      success: true,
      data: {
        chatId: chat._id,
        participants: chat.participants.map(p => ({
          _id: p._id,
          fullname: p.fullname,
          username: p.username,
          email: p.email,
          imageURL: p.imageURL,
          currentStatus: p.currentStatus
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching chat participants:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch chat participants' 
    });
  }
};
