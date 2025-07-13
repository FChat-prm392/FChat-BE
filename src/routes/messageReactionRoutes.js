const express = require('express');
const router = express.Router();
const messageReactionController = require('../controllers/messageReactionController');

/**
 * @swagger
 * /api/messages/{messageId}/reactions:
 *   post:
 *     summary: Add reaction to a message
 *     tags: [Message Reactions]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to react to
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user adding the reaction
 *       - in: query
 *         name: emoji
 *         required: true
 *         schema:
 *           type: string
 *         description: The emoji reaction
 *     responses:
 *       201:
 *         description: Reaction added successfully
 *       400:
 *         description: Reaction already exists or validation error
 *       404:
 *         description: Message not found
 */
router.post('/messages/:messageId/reactions', messageReactionController.addReaction);

/**
 * @swagger
 * /api/messages/{messageId}/reactions:
 *   delete:
 *     summary: Remove reaction from a message
 *     tags: [Message Reactions]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user removing the reaction
 *       - in: query
 *         name: emoji
 *         required: true
 *         schema:
 *           type: string
 *         description: The emoji reaction to remove
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *       404:
 *         description: Reaction not found
 */
router.delete('/messages/:messageId/reactions', messageReactionController.removeReaction);

/**
 * @swagger
 * /api/messages/{messageId}/reactions:
 *   get:
 *     summary: Get all reactions for a message
 *     tags: [Message Reactions]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message
 *     responses:
 *       200:
 *         description: Message reactions retrieved successfully
 *       404:
 *         description: Message not found
 */
router.get('/messages/:messageId/reactions', messageReactionController.getMessageReactions);

/**
 * @swagger
 * /api/users/{userId}/reactions:
 *   get:
 *     summary: Get all reactions by a user
 *     tags: [Message Reactions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User reactions retrieved successfully
 */
router.get('/users/:userId/reactions', messageReactionController.getUserReactions);

module.exports = router;
