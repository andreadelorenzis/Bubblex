const express = require("express");
const router = express.Router();
import { messageController } from "../../controllers/messageController";

router.get('/:id', messageController.getMessageById);

router.get('/chat/:id', messageController.fetchAllChatMessages);

router.get('/chat/files/:id', messageController.fetchAllFilesByChatId);

router.get('/group/files/:id', messageController.fetchAllFilesByGroupId);

router.get('/room/:roomname', messageController.fetchAllMessagesByRoom);

router.delete('/room/:roomname', messageController.deleteAllMessagesByRoom);

router.get('/', messageController.getAllMessages);

router.post('/', messageController.createNewMessage);

router.put('/:id', messageController.updateMessageById);

module.exports = router;

export { };