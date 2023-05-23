
const express = require("express");
const router = express.Router();
const chatController = require('../../controllers/chatController');

router.get('/', chatController.getAllChats);

router.get('/:id', chatController.getChatById);

router.post('/', chatController.createChat);

router.put('/:id', chatController.updateChatById);

router.get('/group/:groupId', chatController.getAllChatByIdGroup);

module.exports = router;

export { };