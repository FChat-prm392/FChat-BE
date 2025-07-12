const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       required:
 *         - type
 *         - url
 *       properties:
 *         type:
 *           type: string
 *           description: Type of media (image, video, audio, etc.)
 *         url:
 *           type: string
 *           description: URL of the media file
 *         fileName:
 *           type: string
 *           description: Original filename of the media
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Message ID
 *         senderID:
 *           type: string
 *           description: ID of the message sender
 *         chatID:
 *           type: string
 *           description: ID of the chat this message belongs to
 *         text:
 *           type: string
 *           description: Text content of the message
 *         messageStatus:
 *           type: string
 *           enum: [Draft, Send, Seen]
 *           description: Status of the message
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Media'
 *           description: Array of media attachments
 *         createAt:
 *           type: string
 *           format: date-time
 *           description: Message creation timestamp
 *     CreateMessage:
 *       type: object
 *       required:
 *         - senderID
 *         - chatID
 *       properties:
 *         senderID:
 *           type: string
 *           description: ID of the message sender
 *         chatID:
 *           type: string
 *           description: ID of the chat this message belongs to
 *         text:
 *           type: string
 *           description: Text content of the message
 *         messageStatus:
 *           type: string
 *           enum: [Draft, Send, Seen]
 *           default: Send
 *           description: Status of the message
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Media'
 *           description: Array of media attachments
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessage'
 *           examples:
 *             textMessage:
 *               summary: Text message
 *               value:
 *                 senderID: "60d5ecb54b24b13a4c8f1234"
 *                 chatID: "60d5ecb54b24b13a4c8f5678"
 *                 text: "Hello, how are you?"
 *             mediaMessage:
 *               summary: Message with media
 *               value:
 *                 senderID: "60d5ecb54b24b13a4c8f1234"
 *                 chatID: "60d5ecb54b24b13a4c8f5678"
 *                 text: "Check out this image!"
 *                 media:
 *                   - type: "image"
 *                     url: "https://example.com/image.jpg"
 *                     fileName: "photo.jpg"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Failed to send message
 */
router.post('/', messageController.sendMessage);

/**
 * @swagger
 * /api/messages/{chatId}:
 *   get:
 *     summary: Get messages for a chat
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of messages to return
 *     responses:
 *       200:
 *         description: List of messages in the chat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Failed to fetch messages
 */
router.get('/:chatId', messageController.getChatMessages);

module.exports = router;
