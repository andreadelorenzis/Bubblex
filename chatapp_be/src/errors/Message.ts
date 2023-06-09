import { Schema, Model, model, connect } from 'mongoose';

export interface IMessage extends Document {
    chat: any;
    sender: any;
    timestamp: Date;
    content?: string;
    media?: any;
    position?: any;
    poll?: any;
    videocall?: any;
}

const messageSchema: Schema = new Schema<IMessage>({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'Person',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
    },
    media: {
        type: {
            type: String,
            enum: ['file', 'code', 'audio'],
        },
        fileUrl: {
            type: String
        },
        codeSnippet: {
            type: String
        },
        audioUrl: {
            type: String
        }
    },
    location: {
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        },
        address: {
            type: String
        }
    },
    poll: {
        question: {
            type: String
        },
        options: [{
            type: String
        }]
    },
    videocall: {
        url: {
            type: String
        },
        duration: {
            type: Number
        }
    }
});

export const messageDAL = {
    fetchAllMessages: async function () {
        try {
            const messages = await Message.find().exec();
            return messages;
        } catch (error) {
            throw new Error('Failed to retrieve messages');
        }
    },

    fetchMessageById: async function (messageId: any) {
        try {
            const message = await Message.findById(messageId).exec();
            if (!message) {
                throw new Error('Message not found');
            }
            return message;
        } catch (error) {
            throw new Error('Failed to retrieve the message');
        }
    },

    createNewMessage: async function (data: any) {
        if (!data.content) {
            throw new Error("Content of the message is missing");
        }

        try {
            const newMessage = await Message.create(data);
            return newMessage;
        } catch (error) {
            throw new Error('Failed to create the message');
        }
    },

    updateMessageById: async function (messageId: any, updatedMessageData: any) {
        try {
            const updatedMessage = await Message.findByIdAndUpdate(
                messageId,
                updatedMessageData,
                { new: true }
            );

            if (!updatedMessage) {
                throw new Error('Message not found');
            }

            return updatedMessage;
        } catch (error) {
            throw new Error('Failed to update the message');
        }
    }
};

export const Message: Model<IMessage> = model<IMessage>('Message', messageSchema);