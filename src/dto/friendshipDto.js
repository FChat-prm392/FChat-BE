class CreateFriendshipDto {
  constructor({ requester, recipient }) {
    this.requester = requester;
    this.recipient = recipient;
  }

  validate() {
    const errors = [];
    
    if (!this.requester || this.requester.trim() === '') {
      errors.push('Requester ID is required');
    }
    
    if (!this.recipient || this.recipient.trim() === '') {
      errors.push('Recipient ID is required');
    }
    
    if (this.requester === this.recipient) {
      errors.push('Cannot send friend request to yourself');
    }
    
    return errors;
  }
}

class UpdateFriendshipDto {
  constructor({ requestStatus }) {
    this.requestStatus = requestStatus;
  }

  validate() {
    const errors = [];
    
    const validStatuses = ['pending', 'accepted', 'blocked', 'rejected'];
    if (!this.requestStatus || !validStatuses.includes(this.requestStatus)) {
      errors.push('Invalid request status. Must be one of: pending, accepted, blocked, rejected');
    }
    
    return errors;
  }
}

class FriendshipResponseDto {
  constructor(friendship) {
    this.id = friendship._id || friendship.id;
    this.requester = friendship.requester;
    this.recipient = friendship.recipient;
    this.requestStatus = friendship.requestStatus;
    this.createdAt = friendship.createdAt;
    this.updatedAt = friendship.updatedAt;
  }
}

module.exports = {
  CreateFriendshipDto,
  UpdateFriendshipDto,
  FriendshipResponseDto
};
