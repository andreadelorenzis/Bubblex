import { Chat, IChat, chatDAL } from "../models/Chat";
import { Server, Socket } from 'socket.io';

let io: Server;

const createChat = async (chatData: any) => {
    try {
        const newChat = await chatDAL.createNewChat(chatData);
        return newChat;
    } catch (error) {
        throw error;
    }
};

const getAllChats = async () => {
    try {
        const chats = await chatDAL.fetchAllChats();
        return chats;
    } catch (error) {
        throw error;
    }
};

const getChatById = async (chatId: any) => {
    try {
        const chat = await chatDAL.fetchChatById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }
        return chat;
    } catch (error) {
        throw error;
    }
};

const updateChatById = async (chatId: any, updatedChatData: any) => {
    try {
        const updatedChat = await chatDAL.updateChatById(chatId, updatedChatData);
        if (!updatedChat) {
            throw new Error('Chat not found');
        }
        return updatedChat;
    } catch (error) {
        throw error;
    }
};

const getAllChatByIdGroup = async (groupId: any) => {
    try {
        const chats = await Chat.aggregate([
            {
                $lookup: {
                    from: 'Group',
                    localField: 'groupId',
                    foreignField: '_id',
                    as: 'groupChats'
                }
            },
            {
                $match: {
                    "referencedDocument": {
                        $ne: []
                    }
                }
            }
        ]);
        return chats;
    } catch (error) {
        throw error;
    }
};

/* const initSocketConnection = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
        }
    });
}; */

module.exports = {
    createChat,
    getAllChats,
    getChatById,
    updateChatById,
    getAllChatByIdGroup
};