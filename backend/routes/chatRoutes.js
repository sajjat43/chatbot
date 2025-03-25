const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/chat', chatController.createChat);
router.get('/history', chatController.getChatHistory);

module.exports = router; 