import { Message, IMessage, messageDAL } from "../models/Message";
import { Request } from "express";
import { extractFileUrl } from '../utils/fileUtils';

async function createNewMessage(req: Request, data: any) {
    if (!data.textContent) {
        throw new Error("Content of the message is missing");
    }

    try {
        if (data?.contentType === 'file') {
            // Upload media file and get the file URL or code content
            const mediaUrl = extractFileUrl(req);

            // Set the file url in the document
            data.fileUrl = mediaUrl;
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
        throw new Error('Failed to retrieve messages');
    }
}

module.exports = { createNewMessage, getAllMessages, getMessageById, updateMessage, fetchAllChatMessages };
