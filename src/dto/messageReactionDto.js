class CreateMessageReactionDto {
  constructor({ messageId, userId, emoji }) {
    this.messageId = messageId;
    this.userId = userId;
    this.emoji = emoji;
  }

  validate() {
    const errors = [];
    
    if (!this.messageId || this.messageId.trim() === '') {
      errors.push('Message ID is required');
    }
    
    if (!this.userId || this.userId.trim() === '') {
      errors.push('User ID is required');
    }
    
    if (!this.emoji || this.emoji.trim() === '') {
      errors.push('Emoji is required');
    }
    
    if (this.emoji && this.emoji.length > 10) {
      errors.push('Emoji must be a valid emoji character');
    }
    
    return errors;
  }
}

class MessageReactionResponseDto {
  constructor(messageReaction) {
    this._id = messageReaction._id;
    this.messageId = messageReaction.messageId;
    this.userId = messageReaction.userId;
    this.emoji = messageReaction.emoji;
    this.createAt = messageReaction.createAt;
    
    if (messageReaction.userId && typeof messageReaction.userId === 'object') {
      this.user = {
        _id: messageReaction.userId._id,
        fullname: messageReaction.userId.fullname,
        username: messageReaction.userId.username,
        imageURL: messageReaction.userId.imageURL
      };
    }
  }
}

class MessageReactionSummaryDto {
  constructor(messageId, reactions) {
    this.messageId = messageId;
    this.reactions = this.groupReactionsByEmoji(reactions);
    this.totalCount = reactions.length;
  }

  groupReactionsByEmoji(reactions) {
    const grouped = {};
    
    reactions.forEach(reaction => {
      const emoji = reaction.emoji;
      if (!grouped[emoji]) {
        grouped[emoji] = {
          emoji: emoji,
          count: 0,
          users: []
        };
      }
      
      grouped[emoji].count++;
      grouped[emoji].users.push({
        _id: reaction.userId._id || reaction.userId,
        fullname: reaction.userId.fullname,
        username: reaction.userId.username,
        imageURL: reaction.userId.imageURL
      });
    });
    
    return Object.values(grouped);
  }
}

module.exports = {
  CreateMessageReactionDto,
  MessageReactionResponseDto,
  MessageReactionSummaryDto
};
