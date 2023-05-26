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

const getChatDirectByPersonId = async (myId: any, personId: any) => {
    try {
        let chat = await chatDAL.fetchChatDirectByPersonId(personId);
        if (chat === null) {
            // Creo una nuova chat diretta con questa persona
            const newChat: any = {
                chatType: 'direct',
                members: [myId, personId]
            };
            chat = await chatDAL.createNewChat(newChat);
        }
        return chat;
    } catch (error) {
        throw error;
    }
}

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
        const chats = await Chat.find({
            groupId
        }).exec();
        return chats;
    } catch (error) {
        throw error;
    }
};

const getAllMyDirectChats = async (myId: string) => {
    try {
        const chats = await Chat.find({
            chatType: 'direct',
            members: { $in: [myId] }
        }).exec();
        return chats;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* const initSocketConnection = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
        }
    });
}; */

export const chatService = {
    createChat,
    getAllChats,
    getChatById,
    updateChatById,
    getAllChatByIdGroup,
    getChatDirectByPersonId,
    getAllMyDirectChats
};