const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const upload = require('../middleware/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [image, video, file]
 *         url:
 *           type: string
 *         fileName:
 *           type: string
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         senderID:
 *           type: string
 *         chatID:
 *           type: string
 *         text:
 *           type: string
 *         messageStatus:
 *           type: string
 *           enum: [Draft, Send, Seen]
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Media'
 *         createAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send message with optional media
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               senderID:
 *                 type: string
 *               chatID:
 *                 type: string
 *               text:
 *                 type: string
 *               messageStatus:
 *                 type: string
 *                 enum: [Draft, Send, Seen]
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post('/', upload.array('media', 5), messageController.sendMessage);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get('/:chatId', messageController.getChatMessages);

module.exports = router;
