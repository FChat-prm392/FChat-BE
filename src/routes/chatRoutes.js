const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Chat ID
 *         isGroup:
 *           type: boolean
 *           description: Whether this is a group chat
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of participant user IDs
 *         groupName:
 *           type: string
 *           description: Name of the group (for group chats)
 *         groupAvatar:
 *           type: string
 *           description: Group avatar URL (for group chats)
 *         createBy:
 *           type: string
 *           description: ID of the user who created the chat
 *         lastMessageID:
 *           type: string
 *           description: ID of the last message in the chat
 *         createAt:
 *           type: string
 *           format: date-time
 *         updateAt:
 *           type: string
 *           format: date-time
 *     CreateChat:
 *       type: object
 *       required:
 *         - participants
 *         - createBy
 *       properties:
 *         isGroup:
 *           type: boolean
 *           default: false
 *           description: Whether this is a group chat
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of participant user IDs
 *           minItems: 1
 *         groupName:
 *           type: string
 *           description: Name of the group (required if isGroup is true)
 *         groupAvatar:
 *           type: string
 *           description: Group avatar URL
 *         createBy:
 *           type: string
 *           description: ID of the user who created the chat
 *     UpdateGroup:
 *       type: object
 *       properties:
 *         groupName:
 *           type: string
 *           description: New group name
 *         groupAvatar:
 *           type: string
 *           description: New group avatar URL
 *     AddParticipant:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user to add to the chat
 */

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChat'
 *     responses:
 *       201:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 */
router.post('/', chatController.create);

/**
 * @swagger
 * /api/chats/user/{userId}:
 *   get:
 *     summary: Get all chats for a user
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       500:
 *         description: Internal server error
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
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.get('/:chatId', chatController.getChat);

/**
 * @swagger
 * /api/chats/{chatId}/add:
 *   put:
 *     summary: Add a participant to a chat
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddParticipant'
 *     responses:
 *       200:
 *         description: Participant added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 */
router.put('/:chatId/add', chatController.addParticipant);

/**
 * @swagger
 * /api/chats/{chatId}/update:
 *   put:
 *     summary: Update group information
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGroup'
 *     responses:
 *       200:
 *         description: Group information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 */
router.put('/:chatId/update', chatController.updateGroup);

module.exports = router;
