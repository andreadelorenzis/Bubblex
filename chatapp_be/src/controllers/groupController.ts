import { Request, Response, NextFunction } from "express";
import { groupService } from "../services/groupService";

const getAllGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allGroups = await groupService.getAllGroups();
        res.json(allGroups);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const createGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const groupData = req.body;
        const newGroup = await groupService.createGroup(groupData);
        res.status(201).json(newGroup);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getGroupById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const groupId = req.params.id;
        const group = await groupService.getGroupById(groupId);
        res.json(group);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updateGroupById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const groupId = req.params.id;
        const updatedGroupData = req.body;
        const group = await groupService.updateGroupById(groupId, updatedGroupData);
        res.json(group);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getAllGroupMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const groupId = req.params.id;
        const members = await groupService.getAllGroupMembers(groupId);
        res.json(members);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const groupController = {
    getAllGroups,
    createGroup,
    getGroupById,
    updateGroupById,
    getAllGroupMembers
};