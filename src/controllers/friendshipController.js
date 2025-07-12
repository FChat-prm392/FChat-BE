const { CreateFriendshipDto, UpdateFriendshipDto, FriendshipResponseDto } = require('../dto/friendshipDto');
const { validateDto, handleValidationError } = require('../dto/validationHelper');
const Friendship = require('../models/Friendship');

exports.sendFriendRequest = async (req, res) => {
  try {
    const createFriendshipDto = new CreateFriendshipDto(req.body);
    validateDto(createFriendshipDto);
    
    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: createFriendshipDto.requester, recipient: createFriendshipDto.recipient },
        { requester: createFriendshipDto.recipient, recipient: createFriendshipDto.requester }
      ]
    });
    
    if (existingFriendship) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }
    
    const friendship = new Friendship(createFriendshipDto);
    await friendship.save();
    
    const responseDto = new FriendshipResponseDto(friendship);
    res.status(201).json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.updateFriendRequest = async (req, res) => {
  try {
    const updateFriendshipDto = new UpdateFriendshipDto(req.body);
    validateDto(updateFriendshipDto);
    
    const friendship = await Friendship.findByIdAndUpdate(
      req.params.id,
      updateFriendshipDto,
      { new: true }
    );
    
    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    const responseDto = new FriendshipResponseDto(friendship);
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    const friendships = await Friendship.find({
      recipient: userId,
      requestStatus: 'pending'
    }).populate('requester', 'fullname username imageURL');
    
    const responseDto = friendships.map(friendship => new FriendshipResponseDto(friendship));
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.getFriends = async (req, res) => {
  try {
    const userId = req.params.userId;
    const friendships = await Friendship.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ],
      requestStatus: 'accepted'
    }).populate('requester recipient', 'fullname username imageURL');
    
    const responseDto = friendships.map(friendship => new FriendshipResponseDto(friendship));
    res.json(responseDto);
  } catch (err) {
    handleValidationError(err, res);
  }
};

exports.deleteFriendship = async (req, res) => {
  try {
    const friendship = await Friendship.findByIdAndDelete(req.params.id);
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }
    
    res.json({ message: 'Friendship deleted successfully' });
  } catch (err) {
    handleValidationError(err, res);
  }
};
