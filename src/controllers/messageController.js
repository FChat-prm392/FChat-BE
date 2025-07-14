const messageService = require('../services/messageService');
const { CreateMessageDto, MessageResponseDto } = require('../dto/messageDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');
const { bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

exports.sendMessage = async (req, res) => {
  try {
    const files = req.files || [];
    const body = req.body;

    // Prepare media array with uploaded URLs
    const media = await Promise.all(
      files.map(async (file) => {
        const ext = path.extname(file.originalname);
        const fileName = `messages/${Date.now()}_${uuidv4()}${ext}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(file.buffer, {
          metadata: {
            contentType: file.mimetype
          }
        });

        // Make public if needed, or generate signed URL
        const [url] = await fileUpload.getSignedUrl({
          action: 'read',
          expires: '03-01-2030'
        });

        return {
          url,
          type: file.mimetype.startsWith('image') ? 'image'
               : file.mimetype.startsWith('video') ? 'video'
               : 'file',
          fileName: file.originalname
        };
      })
    );

    const createMessageDto = new CreateMessageDto({
      ...body,
      media
    });

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
