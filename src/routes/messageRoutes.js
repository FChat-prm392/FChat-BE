const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send message
 *     tags: [Messages]
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/', messageController.sendMessage);

/**
 * @swagger
 * /api/messages/{chatId}:
 *   get:
 *     summary: Get chat messages
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Messages retrieved
 */
router.get('/:chatId', messageController.getChatMessages);

module.exports = router;

module.exports = router;
