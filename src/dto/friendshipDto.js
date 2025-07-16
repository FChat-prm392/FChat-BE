class CreateFriendshipDto {
  constructor({ requester, recipient, requestStatus }) {
    this.requester = requester;
    this.recipient = recipient;
    this.requestStatus = requestStatus || 'pending';
  }

   validate() {
    const errors = [];

    const requesterStr = String(this.requester || '').trim();
    const recipientStr = String(this.recipient || '').trim();
    const validStatuses = ['pending', 'accepted', 'blocked', 'rejected'];

    if (!requesterStr) errors.push('Requester ID is required');
    if (!recipientStr) errors.push('Recipient ID is required');
    if (requesterStr === recipientStr) errors.push('Cannot send request to yourself');
    if (!validStatuses.includes(this.requestStatus)) errors.push('Invalid requestStatus');

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

class FriendListResponseDto {
  constructor(user) {
    this.id = user._id || user.id;
    this.fullname = user.fullname;
    this.username = user.username;
    this.email = user.email;
    this.imageURL = user.imageURL;
    this.currentStatus = user.currentStatus;
    this.lastOnline = user.lastOnline;
  }
}

module.exports = {
  CreateFriendshipDto,
  UpdateFriendshipDto,
  FriendshipResponseDto,
  FriendListResponseDto
};
