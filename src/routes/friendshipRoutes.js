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
 *         description: Friend request sent
 */
router.post('/', friendshipController.sendFriendRequest);

/**
 * @swagger
 * /api/friendships/{id}:
 *   put:
 *     summary: Update friend request
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request updated
 */
router.put('/:id', friendshipController.updateFriendRequest);

/**
 * @swagger
 * /api/friendships/requests/{userId}:
 *   get:
 *     summary: Get friend requests
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend requests retrieved
 */
router.get('/requests/:userId', friendshipController.getFriendRequests);

/**
 * @swagger
 * /api/friendships/friends/{userId}:
 *   get:
 *     summary: Get friends
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friends retrieved
 */
router.get('/friends/:userId', friendshipController.getFriends);

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
 *         description: Friendship deleted
 */
router.delete('/:id', friendshipController.deleteFriendship);

module.exports = router;

module.exports = router;
