import { Person, IPerson, personDAL } from "../models/Person";

async function createNewPerson(personData: any) {
    try {
        const newPerson = await personDAL.createPerson(personData);
        return newPerson;
    } catch (error) {
        throw error;
    }
}

async function getAllPeople() {
    try {
        const persons = await personDAL.fetchAllPeople();
        return persons;
    } catch (error) {
        throw error;
    }
}

async function getPersonById(personId: any) {
    try {
        const person = await personDAL.fetchPersonById(personId);
        if (!person) {
            throw new Error('Person not found');
        }
        return person;
    } catch (error) {
        throw error;
    }
}

async function updatePerson(personId: any, updatedPersonData: any) {
    try {
        const updatedPerson = await personDAL.updatePersonById(personId, updatedPersonData);
        return updatedPerson;
    } catch (error) {
        throw error;
    }
}

module.exports = { createNewPerson, getAllPeople, getPersonById, updatePerson };
