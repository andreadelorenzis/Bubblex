import { Request, Response, NextFunction } from "express"

const userService = require('../services/userService');

const getAllUsers = async (req: any, res: any, next: any) => {
    try {
        const allUsers = await userService.getAllUsersPromise();
        res.json(allUsers);
    } catch (error) {
        next(error);
    }
};

const createNewUser = async (req: Request, res: Response, next: any) => {
    try {
        const createdUser = await userService.createUserPromise(req.body);
        res.json(createdUser);
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllUsers, createNewUser };