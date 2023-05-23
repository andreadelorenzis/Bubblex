import { Group, IGroup, fetchAll, fetchById, create, updateById } from "../models/Group";

async function createGroup(groupData: any) {
    try {
        const newGroup = await create(groupData);
        return newGroup;
    } catch (error) {
        throw error;
    }
}

async function getAllGroups() {
    try {
        const groups = await fetchAll();
        return groups;
    } catch (error) {
        throw error;
    }
}

async function getGroupById(groupId: any) {
    try {
        const group = await fetchById(groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        return group;
    } catch (error) {
        throw error;
    }
}

async function updateGroupById(groupId: any, updatedGroupData: any) {
    try {
        const updatedGroup = await updateById(groupId, updatedGroupData);
        return updatedGroup;
    } catch (error) {
        throw error;
    }
}

async function getAllGroupChats(groupId: any) {
    try {
        const result = await Group.findById(groupId).populate('chats');
        return result?.get('chats') || [];
    } catch (error) {
        throw new Error("Unable to fetch the chats of object Group")
    }
}

async function getAllGroupMembers(groupId: any) {
    try {
        const result = await Group.findById(groupId).populate('members');
        return result?.get('members') || [];
    } catch (error) {
        throw new Error("Unable to fetch the members of object Group")
    }
}

module.exports = { createGroup, getAllGroups, getGroupById, updateGroupById, getAllGroupChats, getAllGroupMembers };