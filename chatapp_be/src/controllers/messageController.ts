import { Request, Response, NextFunction } from "express";
import { messageService } from "../services/messageService";

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

const fetchAllFilesByChatId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chatId = req.params.id;
        const fileURLs = await messageService.fetchAllFilesByChatId(chatId);
        console.log(fileURLs)
        res.json(fileURLs);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

const fetchAllFilesByGroupId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const groupId = req.params.id;
        const fileURLs = await messageService.fetchAllFilesByGroupId(groupId);
        res.json(fileURLs);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

const fetchAllMessagesByRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roomName = req.params.roomname;
        const messages = await messageService.fetchAllMessagesByRoom(roomName);
        res.json(messages);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

const deleteAllMessagesByRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roomName = req.params.roomname;
        const result = await messageService.deleteAllMessagesByRoom(roomName);
        res.json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

export const messageController = {
    getAllMessages,
    createNewMessage,
    getMessageById,
    updateMessageById,
    fetchAllChatMessages,
    fetchAllFilesByChatId,
    fetchAllFilesByGroupId,
    fetchAllMessagesByRoom,
    deleteAllMessagesByRoom
};

export { };