import { ErrorType } from "../errors/ErrorType.enum";
import { ServerError } from '../errors/ServerError'
import { IUser, User } from "../models/User";

const mongoose = require('mongoose');

async function getAllUsersPromise(): Promise<IUser[]> {
    try {
        const users: IUser[] = await User.find({});
        return users;
    } catch (error) {
        throw error;
    }
};

async function createUserPromise(data: any) {
    // Validazione
    if (!data.name || !data.email || !data.password) {
        throw new ServerError("Alcuni campi non sono stati inseriti");
    }

    // Controllo se l'utente esiste già
    let isAlreadyAdded: any;
    try {
        isAlreadyAdded = await User.findOne({ email: data.email });
    } catch (err: any) {
        throw err;
    }

    if (!!isAlreadyAdded) {
        throw new ServerError("L\'utente esiste già", 409);
    }

    // Aggiungo il nuovo utente
    const newUser = new User({
        name: data.name,
        email: data.email,
        password: data.password
    });
    try {
        const savedUser = await newUser.save();
        return savedUser;
    } catch (error) {
        throw new ServerError("Errore durante la creazione dell'utente");
    }

}

module.exports = { getAllUsersPromise, createUserPromise };