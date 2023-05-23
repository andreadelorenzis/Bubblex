import { Schema, Model, model, connect } from 'mongoose';

export interface IChat extends Document {
    name: string;
    description: string;
    groupId: any;
    members: any;
}

const chatSchema = new Schema<IChat>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    groupId: {
        type: Schema.Types.ObjectId
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
});

export const chatDAL = {
    fetchAllChats: async function () {
        try {
            const chats = await Chat.find().exec();
            return chats;
        } catch (error) {
            throw new Error('Failed to retrieve chats');
        }
    },
    fetchChatById: async function (chatId: any) {
        try {
            const chat = await Chat.findById(chatId).exec();
            if (!chat) {
                throw new Error('Chat not found');
            }
            return chat;
        } catch (error) {
            throw new Error('Failed to retrieve the chat');
        }
    },
    createNewChat: async function (data: any) {
        if (!data.name) {
            throw new Error("Name of the chat is missing");
        }

        try {
            const newChat = await Chat.create(data);
            return newChat;
        } catch (error) {
            throw new Error('Failed to create the chat');
        }
    },
    updateChatById: async function (chatId: any, updatedChatData: any) {
        try {
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                updatedChatData,
                { new: true }
            );

            if (!updatedChat) {
                throw new Error('Chat not found');
            }

            return updatedChat;
        } catch (error) {
            throw new Error('Failed to update the chat');
        }
    }
}


export const Chat: Model<IChat> = model<IChat>('Chat', chatSchema);