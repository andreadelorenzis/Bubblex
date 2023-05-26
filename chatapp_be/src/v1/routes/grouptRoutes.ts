const express = require('express');
const router = express.Router();
import { groupController } from "../../controllers/groupController";

router.get("/:id", groupController.getGroupById);

router.get('/members/:id', groupController.getAllGroupMembers);

router.get("/", groupController.getAllGroups);

router.post('/', groupController.createGroup);

router.put('/:id', groupController.updateGroupById);

module.exports = router;

export { };