import { Message, IMessage, messageDAL } from "../models/Message";
const {
    ref,
    uploadBytes,
    listAll,
    deleteObject,
    getDownloadURL,
} = require("firebase/storage");
import { chatService } from './chatService';

async function createNewMessage(req: any, data: any) {
    if (!data.textContent && data.textContent !== "") {
        throw new Error("Content of the message is missing");
    }

    try {
        if (data?.contentType === 'file') {
            data.fileUrl = req.fileUrl;
            data.sender = {
                id: data.senderID,
                name: data.senderName
            }
            data.fileMetadata = {
                name: data.fileName,
                size: data.fileSize,
                type: data.fileType
            }
        }
        const newMessage = await messageDAL.createNewMessage(data);
        return newMessage;
    } catch (error) {
        throw error;
    }
}

async function getAllMessages() {
    try {
        const messages = await messageDAL.fetchAllMessages();
        return messages;
    } catch (error) {
        throw error;
    }
}

async function getMessageById(messageId: any) {
    try {
        const message = await messageDAL.fetchMessageById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }
        return message;
    } catch (error) {
        throw error;
    }
}

async function updateMessage(messageId: any, updatedMessageData: any) {
    try {
        const updatedMessage = await messageDAL.updateMessageById(messageId, updatedMessageData);
        return updatedMessage;
    } catch (error) {
        throw error;
    }
}

async function fetchAllChatMessages(chatId: any) {
    try {
        const messages = await Message.find({ chat: chatId }).populate('sender').exec();
        return messages;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to retrieve messages');
    }
}

async function fetchAllFilesByChatId(chatId: any) {
    try {
        const messages = await Message.find({
            chat: chatId,
            contentType: 'file'
        });
        const fileURLs = messages.map((message: any) => message.fileUrl);
        return fileURLs;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to retrieve files');
    }
}

async function fetchAllFilesByGroupId(groupId: any) {
    try {
        const chats: any[] = await chatService.getAllChatByIdGroup(groupId);
        if (!chats || chats.length === 0) {
            return [];
        }

        const chatIds = chats.map((chat) => chat._id);

        const fileURLs = await Message.aggregate([
            {
                $match: {
                    chat: { $in: chatIds },
                    contentType: 'file'
                }
            },
            {
                $group: {
                    _id: null,
                    fileURLs: { $push: '$fileUrl' }
                }
            }
        ]);

        // Extract the fileURLs array from the result
        const fileUrls = fileURLs.length > 0 ? fileURLs[0].fileURLs : [];
        return fileUrls;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to retrieve files');
    }
}

async function fetchAllMessagesByRoom(roomName: string) {
    const messages = await Message.find({ room: roomName }).exec();
    return messages;
}

async function deleteAllMessagesByRoom(roomName: string) {
    const result = await Message.deleteMany({ room: roomName }).exec();
    return result;
}

export const messageService = {
    createNewMessage,
    getAllMessages,
    getMessageById,
    updateMessage,
    fetchAllChatMessages,
    fetchAllFilesByChatId,
    fetchAllFilesByGroupId,
    fetchAllMessagesByRoom,
    deleteAllMessagesByRoom
};
