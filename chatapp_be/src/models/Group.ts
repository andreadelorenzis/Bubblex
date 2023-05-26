import { Schema, Model, model, connect } from 'mongoose';
import { ServerError } from '../errors/ServerError';

export interface IGroup extends Document {
    name: string;
    description?: string;
    members?: any;
}

const groupSchema = new Schema<IGroup>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
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
    }
});

export const fetchAll = async function () {
    try {
        const groups = await Group.find().exec();
        return groups;
    } catch (error) {
        throw new Error('Failed to retrieve groups');
    }
};

export const fetchById = async function (groupId: any) {
    try {
        const group = await Group.findById(groupId).exec();
        if (!group) {
            throw new Error('Group not found');
        }
        return group;
    } catch (error) {
        throw new Error('Failed to retrieve the group');
    }
};

export const create = async function (data: any) {
    if (!data.name) {
        throw new Error("Name of the group is missing");
    }
    if (!data.members || data.members.length <= 0) {
        throw new Error("The group should have at least one member");
    }

    try {
        const newGroup = await Group.create(data);
        return newGroup;
    } catch (error) {
        throw new Error('Failed to create the group');
    }
}

export const updateById = async function (groupId: any, updatedGroupData: any) {
    try {
        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            updatedGroupData,
            { new: true }
        );

        if (!updatedGroup) {
            throw new Error('Group not found');
        }

        return updatedGroup;
    } catch (error) {
        throw new Error('Failed to update the group');
    }
}

export const Group: Model<IGroup> = model<IGroup>('Group', groupSchema);