const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');

router.post('/', friendshipController.sendFriendRequest);
router.put('/:id', friendshipController.updateFriendRequest);
router.get('/requests/:userId', friendshipController.getFriendRequests);
router.get('/friends/:userId', friendshipController.getFriends);
router.delete('/:id', friendshipController.deleteFriendship);

module.exports = router;
