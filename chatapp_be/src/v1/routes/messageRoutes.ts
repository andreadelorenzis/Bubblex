const express = require("express");
const router = express.Router();

const messageController = require('../../controllers/messageController');

router.get('/:id', messageController.getMessageById);

router.get('/chat/:id', messageController.fetchAllChatMessages);

router.get('/', messageController.getAllMessages);

router.post('/', messageController.createNewMessage);

router.put('/:id', messageController.updateMessageById);

module.exports = router;

export { };