const { CreateAccountDto, UpdateAccountDto, UpdateFcmTokenDto, AccountResponseDto } = require('./accountDto');
const { CreateChatDto, UpdateGroupDto, AddParticipantDto, ChatResponseDto } = require('./chatDto');
const { MediaDto, CreateMessageDto, UpdateMessageDto, MessageResponseDto } = require('./messageDto');
const { CreateFriendshipDto, UpdateFriendshipDto, FriendshipResponseDto } = require('./friendshipDto');
const { ValidationError, validateDto, handleValidationError } = require('./validationHelper');

module.exports = {
  // Account DTOs
  CreateAccountDto,
  UpdateAccountDto,
  UpdateFcmTokenDto,
  AccountResponseDto,
  
  // Chat DTOs
  CreateChatDto,
  UpdateGroupDto,
  AddParticipantDto,
  ChatResponseDto,
  
  // Message DTOs
  MediaDto,
  CreateMessageDto,
  UpdateMessageDto,
  MessageResponseDto,
  
  // Friendship DTOs
  CreateFriendshipDto,
  UpdateFriendshipDto,
  FriendshipResponseDto,
  
  // Validation helpers
  ValidationError,
  validateDto,
  handleValidationError
};
