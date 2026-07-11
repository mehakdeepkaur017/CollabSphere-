import { Request, Response } from "express";
import { Folder } from "../models/Folder";
import { File } from "../models/File";
import { Activity } from "../models/Activity";

export const createFolder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, workspaceId, parentFolderId, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const folder = await Folder.create({
      name,
      workspaceId: workspaceId || undefined,
      parentFolderId: parentFolderId || undefined,
      createdBy: userId,
      color
    });

    const { User } = await import("../models/User");
    const currentUser = await User.findById(userId);
    const { getIO } = await import("../sockets/socketManager");

    if (workspaceId) {
      const activity = await Activity.create({
        workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "created_folder",
        resourceId: folder._id,
        resourceType: "Folder",
        message: `created folder ${folder.name}`
      });
      getIO().to(`workspace:${workspaceId}`).emit("activity:new", activity);
    }

    res.status(201).json(folder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFolders = async (req: Request, res: Response) => {
  try {
    const { workspaceId, parentFolderId, isDeleted } = req.query;

    const orConditions: any[] = [];
    const query: any = {};
    
    if (workspaceId) {
      query.workspaceId = workspaceId;
    } else {
      const userId = req.user?.userId;
      query.createdBy = userId;
      orConditions.push({ $or: [{ workspaceId: { $exists: false } }, { workspaceId: null }] });
    }

    if (isDeleted === "true") {
      query.deletedAt = { $exists: true };
    } else {
      query.deletedAt = { $exists: false };
    }
    
    if (parentFolderId) {
      if (parentFolderId === "root") {
        orConditions.push({ $or: [{ parentFolderId: { $exists: false } }, { parentFolderId: null }] });
      } else {
        query.parentFolderId = parentFolderId;
      }
    }

    if (orConditions.length > 0) {
      query.$and = orConditions;
    }

    const folders = await Folder.find(query).sort({ name: 1 });
    
    // Attach file count to each folder
    const folderStats = await Promise.all(folders.map(async (f) => {
      const count = await File.countDocuments({ folderId: f._id, deletedAt: { $exists: false } });
      return { ...f.toObject(), fileCount: count };
    }));

    res.json(folderStats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updates = req.body;

    const folder = await Folder.findByIdAndUpdate(id, { $set: updates }, { new: true });
    
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    if (updates.name && folder.workspaceId) {
      const { User } = await import("../models/User");
      const currentUser = await User.findById(userId);
      const { getIO } = await import("../sockets/socketManager");

      const activity = await Activity.create({
        workspaceId: folder.workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "renamed_folder",
        resourceId: folder._id,
        resourceType: "Folder",
        message: `renamed folder to ${folder.name}`
      });
      getIO().to(`workspace:${folder.workspaceId}`).emit("activity:new", activity);
    }

    res.json(folder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    
    // Soft delete
    const folder = await Folder.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true });
    
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    const { User } = await import("../models/User");
    const currentUser = await User.findById(userId);
    const { getIO } = await import("../sockets/socketManager");

    if (folder.workspaceId) {
      const activity = await Activity.create({
        workspaceId: folder.workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "deleted_folder",
        resourceId: folder._id,
        resourceType: "Folder",
        message: `deleted folder ${folder.name}`
      });
      getIO().to(`workspace:${folder.workspaceId}`).emit("activity:new", activity);
    }

    res.json({ message: "Folder deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
