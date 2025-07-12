const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chats
router.post('/', chatController.create);

// GET /api/chats/user/:userId
router.get('/user/:userId', chatController.getUserChats);

// GET /api/chats/:chatId
router.get('/:chatId', chatController.getChat);

// PUT /api/chats/:chatId/add
router.put('/:chatId/add', chatController.addParticipant);

// PUT /api/chats/:chatId/update
router.put('/:chatId/update', chatController.updateGroup);

module.exports = router;
