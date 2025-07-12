const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Friendship:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Friendship ID
 *         requester:
 *           type: string
 *           description: ID of the user who sent the friend request
 *         recipient:
 *           type: string
 *           description: ID of the user who received the friend request
 *         requestStatus:
 *           type: string
 *           enum: [pending, accepted, blocked, rejected]
 *           description: Status of the friend request
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateFriendship:
 *       type: object
 *       required:
 *         - requester
 *         - recipient
 *       properties:
 *         requester:
 *           type: string
 *           description: ID of the user sending the friend request
 *         recipient:
 *           type: string
 *           description: ID of the user receiving the friend request
 *     UpdateFriendship:
 *       type: object
 *       required:
 *         - requestStatus
 *       properties:
 *         requestStatus:
 *           type: string
 *           enum: [pending, accepted, blocked, rejected]
 *           description: New status for the friend request
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
 *             $ref: '#/components/schemas/CreateFriendship'
 *           example:
 *             requester: "60d5ecb54b24b13a4c8f1234"
 *             recipient: "60d5ecb54b24b13a4c8f5678"
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Friendship'
 *       400:
 *         description: Validation error or friend request already exists
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationError'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Friend request already exists"
 *       500:
 *         description: Internal server error
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
 *         description: Friendship ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFriendship'
 *           examples:
 *             accept:
 *               summary: Accept friend request
 *               value:
 *                 requestStatus: "accepted"
 *             reject:
 *               summary: Reject friend request
 *               value:
 *                 requestStatus: "rejected"
 *             block:
 *               summary: Block user
 *               value:
 *                 requestStatus: "blocked"
 *     responses:
 *       200:
 *         description: Friend request status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Friendship'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Friend request not found
 *       500:
 *         description: Internal server error
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
 *         description: User ID to get friend requests for
 *     responses:
 *       200:
 *         description: List of pending friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Friendship'
 *       500:
 *         description: Internal server error
 */
router.get('/requests/:userId', friendshipController.getFriendRequests);

/**
 * @swagger
 * /api/friendships/friends/{userId}:
 *   get:
 *     summary: Get all friends for a user
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get friends for
 *     responses:
 *       200:
 *         description: List of accepted friendships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Friendship'
 *       500:
 *         description: Internal server error
 */
router.get('/friends/:userId', friendshipController.getFriends);

/**
 * @swagger
 * /api/friendships/{id}:
 *   delete:
 *     summary: Delete a friendship or friend request
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Friendship ID
 *     responses:
 *       200:
 *         description: Friendship deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Friendship deleted successfully"
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', friendshipController.deleteFriendship);

module.exports = router;
