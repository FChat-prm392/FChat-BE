const { CreateFriendshipDto, UpdateFriendshipDto, FriendshipResponseDto } = require('../dto/friendshipDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');
const friendshipService = require('../services/friendshipService');

exports.sendFriendRequest = async (req, res) => {
  try {
    const createFriendshipDto = new CreateFriendshipDto(req.body);
    validateDto(createFriendshipDto);
    
    const existingFriendship = await friendshipService.checkExistingFriendship(
      createFriendshipDto.requester, 
      createFriendshipDto.recipient
    );
    
    if (existingFriendship) {
      return res.status(400).json({ 
        success: false,
        message: 'Friend request already exists' 
      });
    }
    
    const friendship = await friendshipService.createFriendship(createFriendshipDto);
    const responseDto = new FriendshipResponseDto(friendship);
    
    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: responseDto
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.updateFriendRequest = async (req, res) => {
  try {
    const updateFriendshipDto = new UpdateFriendshipDto(req.body);
    validateDto(updateFriendshipDto);
    
    const friendship = await friendshipService.updateFriendship(
      req.params.id,
      updateFriendshipDto
    );
    
    if (!friendship) {
      return res.status(404).json({ 
        success: false,
        message: 'Friend request not found' 
      });
    }
    
    const responseDto = new FriendshipResponseDto(friendship);
    res.json({
      success: true,
      message: 'Friend request updated successfully',
      data: responseDto
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    const friendships = await friendshipService.getFriendRequestsByUserId(userId);
    
    const responseDto = friendships.map(friendship => new FriendshipResponseDto(friendship));
    res.json({
      success: true,
      message: 'Friend requests retrieved successfully',
      data: responseDto
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getFriends = async (req, res) => {
  try {
    const userId = req.params.userId;
    const friendships = await friendshipService.getFriendsByUserId(userId);
    
    const responseDto = friendships.map(friendship => new FriendshipResponseDto(friendship));
    res.json({
      success: true,
      message: 'Friends retrieved successfully',
      data: responseDto
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getFriendList = async (req, res) => {
  try {
    const userId = req.params.userId;
    const friends = await friendshipService.getFriendListByUserId(userId);
    
    res.json({
      success: true,
      message: 'Friend list retrieved successfully',
      data: friends
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.deleteFriendship = async (req, res) => {
  try {
    const friendship = await friendshipService.deleteFriendship(req.params.id);
    
    if (!friendship) {
      return res.status(404).json({ 
        success: false,
        message: 'Friendship not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Friendship deleted successfully' 
    });
  } catch (err) {
    handleValidationError(err, res);
  }
};
