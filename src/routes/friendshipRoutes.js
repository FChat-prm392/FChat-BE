const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');

/**
 * @swagger
 * /api/friendships:
 *   post:
 *     summary: Send friend request
 *     tags: [Friendships]
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *       400:
 *         description: Friend request already exists
 */
router.post('/', friendshipController.sendFriendRequest);

/**
 * @swagger
 * /api/friendships/{id}:
 *   put:
 *     summary: Update friend request status
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request updated successfully
 *       404:
 *         description: Friend request not found
 */
router.put('/:id', friendshipController.updateFriendRequest);

/**
 * @swagger
 * /api/friendships/requests/{userId}:
 *   get:
 *     summary: Get pending friend requests for a user
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend requests retrieved successfully
 */
router.get('/requests/:userId', friendshipController.getFriendRequests);

/**
 * @swagger
 * /api/friendships/friends/{userId}:
 *   get:
 *     summary: Get all friendships for a user
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friendships retrieved successfully
 */
router.get('/friends/:userId', friendshipController.getFriends);

/**
 * @swagger
 * /api/friendships/list/{userId}:
 *   get:
 *     summary: Get friend list (just the friend users) for a user
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend list retrieved successfully
 */
router.get('/list/:userId', friendshipController.getFriendList);

/**
 * @swagger
 * /api/friendships/{id}:
 *   delete:
 *     summary: Delete friendship
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friendship deleted successfully
 *       404:
 *         description: Friendship not found
 */
router.delete('/:id', friendshipController.deleteFriendship);

module.exports = router;

module.exports = router;
