const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');

/**
 * @swagger
 * tags:
 *   - name: Friendships
 *     description: API for managing friendships
 */

/**
 * @swagger
 * /api/friendships:
 *   post:
 *     summary: Send a friend request
 *     tags: [Friendships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requester
 *               - recipient
 *               - requestStatus
 *             properties:
 *               requester:
 *                 type: string
 *               recipient:
 *                 type: string
 *               requestStatus:
 *                 type: string
 *                 enum: [pending, accepted, blocked, rejected]
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *       400:
 *         description: Validation error or already exists
 */
router.post('/', friendshipController.sendFriendRequest);

/**
 * @swagger
 * /api/friendships/{id}:
 *   put:
 *     summary: Update friendship details (e.g. status)
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Friendship ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requester
 *               - recipient
 *               - requestStatus
 *             properties:
 *               requester:
 *                 type: string
 *               recipient:
 *                 type: string
 *               requestStatus:
 *                 type: string
 *                 enum: [pending, accepted, blocked, rejected]
 *     responses:
 *       200:
 *         description: Friend request updated
 *       404:
 *         description: Friendship not found
 */
router.put('/:id', friendshipController.updateFriendRequest);

/**
 * @swagger
 * /api/friendships/requests/{userId}:
 *   get:
 *     summary: Get pending friend requests received by a user
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The recipient user ID
 *     responses:
 *       200:
 *         description: List of pending friend requests
 */
router.get('/requests/:userId', friendshipController.getFriendRequests);

/**
 * @swagger
 * /api/friendships/friends/{userId}:
 *   get:
 *     summary: Get all accepted friendships of a user
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of accepted friendships
 */
router.get('/friends/:userId', friendshipController.getFriends);

/**
 * @swagger
 * /api/friendships/list/{userId}:
 *   get:
 *     summary: Get direct list of friend users (excluding self)
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of friends (account details)
 */
router.get('/list/:userId', friendshipController.getFriendList);

/**
 * @swagger
 * /api/friendships/{id}:
 *   delete:
 *     summary: Delete a friendship by ID
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
 *       404:
 *         description: Friendship not found
 */
router.delete('/:id', friendshipController.deleteFriendship);

module.exports = router;
