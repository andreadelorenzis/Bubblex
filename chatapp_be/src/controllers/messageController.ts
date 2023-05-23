import { Request, Response, NextFunction } from "express";

const messageService = require('../services/messageService');

const getAllMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allMessages = await messageService.getAllMessages();
        res.json(allMessages);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const createNewMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messageData = req.body;
        const newMessage = await messageService.createNewMessage(req, messageData);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getMessageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messageId = req.params.id;
        const message = await messageService.getMessageById(messageId);
        res.json(message);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updateMessageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messageId = req.params.id;
        const updatedMessageData = req.body;
        const message = await messageService.updateMessage(messageId, updatedMessageData);
        res.json(message);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const fetchAllChatMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chatId = req.params.id;
        const updatedMessageData = req.body;
        const messageList = await messageService.fetchAllChatMessages(chatId);
        res.json(messageList);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

module.exports = {
    getAllMessages,
    createNewMessage,
    getMessageById,
    updateMessageById,
    fetchAllChatMessages
};

export { };