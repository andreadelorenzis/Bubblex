import { Request, Response, NextFunction } from "express";

const chatService = require('../services/chatService');

const getAllChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allChats = await chatService.getAllChats();
        res.json(allChats);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const createChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chatData = req.body;
        const newChat = await chatService.createChat(chatData);
        res.status(201).json(newChat);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getChatById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chatId = req.params.id;
        const chat = await chatService.getChatById(chatId);
        res.json(chat);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updateChatById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chatId = req.params.id;
        const updatedChatData = req.body;
        const chat = await chatService.updateChatById(chatId, updatedChatData);
        res.json(chat);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getAllChatByIdGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const groupId = req.params.id;
        const chats = await chatService.getAllChatByIdGroup(groupId);
        res.json(chats);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getChatDirectByPersonId = async (req: any, res: Response, next: NextFunction) => {
    try {
        const personId = req.params.id;
        const chat = await chatService.getChatDirectByPersonId(req.myId, personId);
        res.json(chat);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getAllMyDirectChats = async (req: any, res: Response, next: NextFunction) => {
    try {
        const chats = await chatService.getAllMyDirectChats(req.myId);
        res.json(chats);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllChats,
    createChat,
    getChatById,
    updateChatById,
    getAllChatByIdGroup,
    getChatDirectByPersonId,
    getAllMyDirectChats
};

export { };