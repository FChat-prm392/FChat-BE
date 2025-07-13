const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create chat
 *     tags: [Chats]
 *     responses:
 *       201:
 *         description: Chat created
 */
router.post('/', chatController.create);

/**
 * @swagger
 * /api/chats/user/{userId}:
 *   get:
 *     summary: Get user chats
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User chats
 */
router.get('/user/:userId', chatController.getUserChats);

/**
 * @swagger
 * /api/chats/{chatId}:
 *   get:
 *     summary: Get chat by ID
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat found
 */
router.get('/:chatId', chatController.getChat);

/**
 * @swagger
 * /api/chats/{chatId}/add:
 *   put:
 *     summary: Add participant
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant added
 */
router.put('/:chatId/add', chatController.addParticipant);

/**
 * @swagger
 * /api/chats/{chatId}/update:
 *   put:
 *     summary: Update group info
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group updated
 */
router.put('/:chatId/update', chatController.updateGroup);

/**
 * @swagger
 * /api/chats/{chatId}/participants:
 *   get:
 *     summary: Get chat participants
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat participants retrieved successfully
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.get('/:chatId/participants', chatController.getChatParticipants);

module.exports = router;
