import { Schema, Model, model, connect } from 'mongoose';

export interface IChat extends Document {
    name: string;
    description: string;
    chatType: any;
    groupId: any;
    members: any;
}

const chatSchema = new Schema<IChat>({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    chatType: {
        type: String,
        enum: ['direct', 'group'],
        required: true
    },
    groupId: {
        type: Schema.Types.ObjectId
    },
    members: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Person'
        }],
        default: [],
        validate: {
            validator: function (members: any[]) {
                return members.length > 0;
            },
            message: 'At least one member is required.'
        }
    },
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
    fetchChatDirectByPersonId: async function (personId: any) {
        try {
            const chat = await Chat.findOne({
                chatType: 'direct',
                members: { $in: [personId] }
            }).exec();
            return chat;
        } catch (error) {
            throw new Error('Failed to retrieve the chat');
        }
    },
    createNewChat: async function (data: any) {
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