class CreateEmailAccountDto {
  constructor({ fullname, username, email, password, gender, phoneNumber, imageURL, currentStatus, fcmToken }) {
    this.fullname = fullname;
    this.username = username;
    this.email = email;
    this.password = password;
    this.gender = gender;
    this.phoneNumber = phoneNumber;
    this.imageURL = imageURL;
    this.currentStatus = currentStatus;
    this.fcmToken = fcmToken;
  }

  validate() {
    const errors = [];
    if (!this.fullname || this.fullname.trim() === '') errors.push('Fullname is required');
    if (!this.username || this.username.trim() === '') errors.push('Username is required');
    if (!this.email || !/\S+@\S+\.\S+/.test(this.email)) errors.push('Email is invalid');
    if (!this.password || this.password.length < 6) errors.push('Password must be at least 6 characters');
    return errors;
  }
}

class CreateGoogleAccountDto {
  constructor({ email, fullname, imageURL, fcmToken }) {
    this.email = email;
    this.fullname = fullname;
    this.imageURL = imageURL;
    this.fcmToken = fcmToken;
  }

  validate() {
    const errors = [];
    if (!this.email || !/\S+@\S+\.\S+/.test(this.email)) errors.push('Email is invalid');
    if (!this.fullname || this.fullname.trim() === '') errors.push('Fullname is required');
    return errors;
  }
}



class UpdateAccountDto {
  constructor({ fullname, username, email, gender, phoneNumber, imageURL, currentStatus, status, lastOnline }) {
    this.fullname = fullname;
    this.username = username;
    this.email = email;
    this.gender = gender;
    this.phoneNumber = phoneNumber;
    this.imageURL = imageURL;
    this.currentStatus = currentStatus;
    this.status = status;
    this.lastOnline = lastOnline;
  }

  validate() {
    const errors = [];
    
    if (this.email && !/\S+@\S+\.\S+/.test(this.email)) {
      errors.push('Email format is invalid');
    }
    
    return errors;
  }
}

class UpdateFcmTokenDto {
  constructor({ userId, fcmToken }) {
    this.userId = userId;
    this.fcmToken = fcmToken;
  }

  validate() {
    const errors = [];
    
    if (!this.userId || this.userId.trim() === '') {
      errors.push('UserId is required');
    }
    
    if (!this.fcmToken || this.fcmToken.trim() === '') {
      errors.push('FCM token is required');
    }
    
    return errors;
  }
}

class AccountResponseDto {
  constructor(account) {
    this.id = account._id || account.id;
    this.fullname = account.fullname;
    this.username = account.username;
    this.email = account.email;
    this.gender = account.gender;
    this.phoneNumber = account.phoneNumber;
    this.imageURL = account.imageURL;
    this.currentStatus = account.currentStatus;
    this.status = account.status;
    this.lastOnline = account.lastOnline;
    this.createdAt = account.createdAt;
    this.updatedAt = account.updatedAt;
    this.friendshipStatus = account.friendshipStatus || 'NONE';
  }
}

module.exports = {
  UpdateAccountDto,
  UpdateFcmTokenDto,
  AccountResponseDto,
  CreateEmailAccountDto,
  CreateGoogleAccountDto,
};
