import { Request, Response, NextFunction } from "express";

const personService = require('../services/personService');

const getAllPeople = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allPersons = await personService.getAllPeople();
        res.json(allPersons);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const createPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const personData = req.body;
        const newPerson = await personService.createNewPerson(personData);
        res.status(201).json(newPerson);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getPersonById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const personId = req.params.id;
        const person = await personService.getPersonById(personId);
        res.json(person);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updatePersonById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const personId = req.params.id;
        const updatedPersonData = req.body;
        const person = await personService.updatePersonById(personId, updatedPersonData);
        res.json(person);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

module.exports = {
    getAllPeople,
    createPerson,
    getPersonById,
    updatePersonById
};

export { };