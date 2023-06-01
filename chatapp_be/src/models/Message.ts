import { Schema, Model, model, connect, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMessage extends Document {
    sender: any;
    chat?: any;
    contentType: string;
    timestamp: Date;
    textContent: string;
    userGenerated?: boolean;
    _id: string;
    fileUrl?: string;
    fileMetadata: any;
    code?: string;
    position?: any;
    poll?: any;
    videocall?: any;
}

const messageSchema: Schema = new Schema<IMessage>({
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    sender: {
        name: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
    },
    contentType: {
        type: String,
        enum: ['file', 'text', 'code', 'poll'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    textContent: {
        type: String,
    },
    userGenerated: {
        type: Boolean,
        default: false,
    },
    fileUrl: {
        type: String
    },
    fileMetadata: {
        name: {
            type: String,
        },
        size: {
            type: String,
        },
        type: {
            type: String
        }
    },
    code: {
        snippet: {
            type: String
        },
        language: {
            type: String
        }
    },
    position: {
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
        options: {
            type: [{
                id: {
                    type: String
                },
                text: {
                    type: String
                },
                voters: {
                    type: [{
                        name: {
                            type: String,
                            required: true
                        },
                        id: {
                            type: String,
                            required: true
                        }
                    }],
                    default: []
                },
            }],
            default: []
        },
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
        try {
            const newMessage = await Message.create(data);
            return newMessage;
        } catch (error) {
            console.error(error)
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