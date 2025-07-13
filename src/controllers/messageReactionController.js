const messageReactionService = require('../services/messageReactionService');
const { CreateMessageReactionDto, MessageReactionResponseDto, MessageReactionSummaryDto } = require('../dto/messageReactionDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');

exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } = req.query;

    const createReactionDto = new CreateMessageReactionDto({
      messageId,
      userId,
      emoji
    });
    validateDto(createReactionDto);

    const reaction = await messageReactionService.addReaction(messageId, userId, emoji);
    const responseDto = new MessageReactionResponseDto(reaction);
    
    return res.status(201).json({
      success: true,
      message: "Reaction added successfully",
      data: responseDto
    });
  } catch (error) {
    if (error.message === 'Message not found') {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    if (error.message === 'Reaction already exists') {
      return res.status(400).json({
        success: false,
        message: "Reaction already exists"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } = req.query;

    const createReactionDto = new CreateMessageReactionDto({
      messageId,
      userId,
      emoji
    });
    validateDto(createReactionDto);

    await messageReactionService.removeReaction(messageId, userId, emoji);
    
    return res.status(200).json({
      success: true,
      message: "Reaction removed successfully"
    });
  } catch (error) {
    if (error.message === 'Reaction not found') {
      return res.status(404).json({
        success: false,
        message: "Reaction not found"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.getMessageReactions = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId || messageId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Message ID is required"
      });
    }

    const reactions = await messageReactionService.getMessageReactions(messageId);
    const summaryDto = new MessageReactionSummaryDto(messageId, reactions);
    
    return res.status(200).json({
      success: true,
      message: "Message reactions retrieved successfully",
      data: summaryDto
    });
  } catch (error) {
    if (error.message === 'Message not found') {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.getUserReactions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const reactions = await messageReactionService.getReactionsByUser(userId);
    const responseDto = reactions.map(reaction => new MessageReactionResponseDto(reaction));
    
    return res.status(200).json({
      success: true,
      message: "User reactions retrieved successfully",
      data: responseDto
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
