class MediaDto {
  constructor({ type, url, fileName }) {
    this.type = type;
    this.url = url;
    this.fileName = fileName;
  }

  validate() {
    const errors = [];
    
    if (!this.type || this.type.trim() === '') {
      errors.push('Media type is required');
    }
    
    if (!this.url || this.url.trim() === '') {
      errors.push('Media URL is required');
    }
    
    return errors;
  }
}

class CreateMessageDto {
  constructor({ senderID, chatID, text, messageStatus, media }) {
    this.senderID = senderID;
    this.chatID = chatID;
    this.text = text;
    this.messageStatus = messageStatus || 'Send';
    this.media = media ? media.map(m => new MediaDto(m)) : [];
  }

  validate() {
    const errors = [];
    
    if (!this.senderID || this.senderID.trim() === '') {
      errors.push('Sender ID is required');
    }
    
    if (!this.chatID || this.chatID.trim() === '') {
      errors.push('Chat ID is required');
    }
    
    if (!this.text && (!this.media || this.media.length === 0)) {
      errors.push('Either text or media is required');
    }
    
    const validStatuses = ['Draft', 'Send', 'Seen'];
    if (this.messageStatus && !validStatuses.includes(this.messageStatus)) {
      errors.push('Invalid message status');
    }
    
    // Validate media
    if (this.media && this.media.length > 0) {
      this.media.forEach((mediaItem, index) => {
        const mediaErrors = mediaItem.validate();
        mediaErrors.forEach(error => {
          errors.push(`Media item ${index + 1}: ${error}`);
        });
      });
    }
    
    return errors;
  }
}

class UpdateMessageDto {
  constructor({ text, messageStatus, media }) {
    this.text = text;
    this.messageStatus = messageStatus;
    this.media = media ? media.map(m => new MediaDto(m)) : undefined;
  }

  validate() {
    const errors = [];
    
    const validStatuses = ['Draft', 'Send', 'Seen'];
    if (this.messageStatus && !validStatuses.includes(this.messageStatus)) {
      errors.push('Invalid message status');
    }
    
    // Validate media if provided
    if (this.media && this.media.length > 0) {
      this.media.forEach((mediaItem, index) => {
        const mediaErrors = mediaItem.validate();
        mediaErrors.forEach(error => {
          errors.push(`Media item ${index + 1}: ${error}`);
        });
      });
    }
    
    return errors;
  }
}

class MessageResponseDto {
  constructor(message) {
    this.id = message._id || message.id;
    this.senderID = message.senderID;
    this.chatID = message.chatID;
    this.text = message.text;
    this.messageStatus = message.messageStatus;
    this.media = message.media;
    this.createAt = message.createAt;
  }
}

module.exports = {
  MediaDto,
  CreateMessageDto,
  UpdateMessageDto,
  MessageResponseDto
};
