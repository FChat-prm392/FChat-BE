const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// POST /api/messages
router.post('/', messageController.sendMessage);

// GET /api/messages/:chatId?limit=50
router.get('/:chatId', messageController.getChatMessages);

module.exports = router;
