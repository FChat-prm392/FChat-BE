class CreateChatDto {
  constructor({ isGroup, participants, groupName, groupAvatar, createBy }) {
    this.isGroup = isGroup || false;
    this.participants = participants || [];
    this.groupName = groupName;
    this.groupAvatar = groupAvatar;
    this.createBy = createBy;
  }

  validate() {
    const errors = [];
    
    if (!this.participants || this.participants.length === 0) {
      errors.push('At least one participant is required');
    }
    
    if (!this.createBy || this.createBy.trim() === '') {
      errors.push('Creator ID is required');
    }
    
    if (this.isGroup && (!this.groupName || this.groupName.trim() === '')) {
      errors.push('Group name is required for group chats');
    }
    
    return errors;
  }
}

class UpdateGroupDto {
  constructor({ groupName, groupAvatar }) {
    this.groupName = groupName;
    this.groupAvatar = groupAvatar;
  }

  validate() {
    const errors = [];
    
    if (this.groupName !== undefined && this.groupName.trim() === '') {
      errors.push('Group name cannot be empty');
    }
    
    return errors;
  }
}

class AddParticipantDto {
  constructor({ userId }) {
    this.userId = userId;
  }

  validate() {
    const errors = [];
    
    if (!this.userId || this.userId.trim() === '') {
      errors.push('User ID is required');
    }
    
    return errors;
  }
}

class ChatResponseDto {
  constructor(chat) {
    this.id = chat._id || chat.id;
    this.isGroup = chat.isGroup;
    this.participants = chat.participants;
    this.groupName = chat.groupName;
    this.groupAvatar = chat.groupAvatar;
    this.createBy = chat.createBy;
    this.lastMessageID = chat.lastMessageID;
    this.createAt = chat.createAt;
    this.updateAt = chat.updateAt;
  }
}

module.exports = {
  CreateChatDto,
  UpdateGroupDto,
  AddParticipantDto,
  ChatResponseDto
};
