const {
  CreateFriendshipDto,
  UpdateFriendshipDto,
  FriendshipResponseDto,
  FriendListResponseDto
} = require('../dto/friendshipDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');
const friendshipService = require('../services/friendshipService');

exports.sendFriendRequest = async (req, res) => {
  try {
    const dto = new CreateFriendshipDto(req.body);
    validateDto(dto);

    const exists = await friendshipService.checkExistingFriendship(dto.requester, dto.recipient);
    if (exists) {
      return res.status(400).json({ success: false, message: 'Friend request already exists' });
    }

    const created = await friendshipService.createFriendship(dto);
    res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data: new FriendshipResponseDto(created)
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.updateFriendRequest = async (req, res) => {
  try {
    const dto = new UpdateFriendshipDto(req.body);
    validateDto(dto);

    const updated = await friendshipService.updateFriendship(req.params.id, dto);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Friend request not found' });
    }

    res.json({
      success: true,
      message: 'Friend request updated',
      data: new FriendshipResponseDto(updated)
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const result = await friendshipService.getFriendRequestsByUserId(req.params.userId);
    res.json({
      success: true,
      data: result.map(r => new FriendshipResponseDto(r))
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getFriends = async (req, res) => {
  try {
    const result = await friendshipService.getFriendsByUserId(req.params.userId);
    res.json({
      success: true,
      data: result.map(f => new FriendshipResponseDto(f))
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getFriendList = async (req, res) => {
  try {
    const list = await friendshipService.getFriendListByUserId(req.params.userId);
    res.json({
      success: true,
      data: list.map(u => new FriendListResponseDto(u))
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.deleteFriendship = async (req, res) => {
  try {
    const deleted = await friendshipService.deleteFriendship(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Friendship not found' });
    }

    res.json({ success: true, message: 'Friendship deleted' });
  } catch (err) {
    handleValidationError(err, res);
  }
};
