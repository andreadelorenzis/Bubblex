const express = require("express");
const router = express.Router();

const personController = require('../../controllers/personController');

router.get('/', personController.getAllPeople);

router.get('/:id', personController.getPersonById);

router.post('/', personController.createPerson);

router.put('/:id', personController.updatePersonById);

module.exports = router;

export { };