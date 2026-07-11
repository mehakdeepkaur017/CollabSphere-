import { Request, Response } from "express";
import mongoose from "mongoose";
import { File } from "../models/File";
import { Folder } from "../models/Folder";
import { Activity } from "../models/Activity";
import { NotificationService } from "../services/notification.service";
import { NotificationModule, NotificationPriority } from "../models/Notification";

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { workspaceId, folderId, projectId } = req.body;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const filesToCreate = (req.files as Express.Multer.File[]).map((file) => ({
      name: file.originalname,
      originalName: file.originalname,
      extension: file.originalname.split(".").pop() || "",
      mimeType: file.mimetype,
      size: file.size,
      url: file.path, // Cloudinary URL
      workspaceId: workspaceId || undefined,
      folderId: folderId || undefined,
      projectId: projectId || undefined,
      uploadedBy: userId,
      versions: [
        {
          url: file.path,
          size: file.size,
          uploadedBy: userId,
        },
      ],
    }));

    const files = await File.insertMany(filesToCreate);

    const { User } = await import("../models/User");
    const currentUser = await User.findById(userId);
    const { getIO } = await import("../sockets/socketManager");

    // Record activity (just for the first file to avoid spam)
    if (workspaceId) {
      const activity = await Activity.create({
        workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "uploaded_file",
        resourceId: files[0]._id,
        resourceType: "File",
        message: `uploaded ${files.length} file(s)`
      });
      getIO().to(`workspace:${workspaceId}`).emit("activity:new", activity);
    }

    // Notify workspace members about file upload
    if (workspaceId) {
      const { Workspace } = await import("../models/Workspace");
      const workspace = await Workspace.findById(workspaceId);
      if (workspace) {
        const membersToNotify = workspace.members
          .filter(m => m.user.toString() !== userId)
          .map(m => m.user.toString());
        
        if (membersToNotify.length > 0) {
          await NotificationService.notifyUsers(membersToNotify, {
            actorId: userId,
            workspaceId: workspaceId as string,
            module: NotificationModule.FILE,
            type: 'uploaded',
            title: 'New File Upload',
            message: `uploaded ${files.length} file(s)`,
            entityId: files[0]._id.toString(),
            entityType: 'File',
            priority: NotificationPriority.NORMAL
          });
        }
      }
    }

    res.status(201).json(files);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const { workspaceId, folderId, isStarred, search, isDeleted } = req.query;

    const query: any = {};
    if (isDeleted === "true") {
      query.deletedAt = { $exists: true };
    } else {
      query.deletedAt = { $exists: false };
    }

    const orConditions: any[] = [];

    if (workspaceId) {
      query.workspaceId = workspaceId;
    } else {
      // If no workspace is selected, only show personal files uploaded by this user 
      // that aren't attached to any workspace.
      const userId = req.user?.userId;
      query.uploadedBy = userId;
      orConditions.push({ $or: [{ workspaceId: { $exists: false } }, { workspaceId: null }] });
    }

    if (folderId) {
      if (folderId === "root") {
        orConditions.push({ $or: [{ folderId: { $exists: false } }, { folderId: null }] });
      } else {
        query.folderId = folderId;
      }
    }
    
    if (orConditions.length > 0) {
      query.$and = orConditions;
    }
    
    if (isStarred === "true") query.isStarred = true;

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const files = await File.find(query)
      .populate("uploadedBy", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updates = req.body;

    const file = await File.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("uploadedBy", "name email avatar");

    if (!file) return res.status(404).json({ error: "File not found" });

    // Only log if something interesting like name changed
    if (updates.name && file.workspaceId) {
      const { User } = await import("../models/User");
      const currentUser = await User.findById(userId);
      const { getIO } = await import("../sockets/socketManager");

      const activity = await Activity.create({
        workspaceId: file.workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "renamed_file",
        resourceId: file._id,
        resourceType: "File",
        message: `renamed a file to ${file.name}`
      });
      getIO().to(`workspace:${file.workspaceId}`).emit("activity:new", activity);
    }

    res.json(file);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    
    // Soft delete
    const file = await File.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true });
    
    if (!file) return res.status(404).json({ error: "File not found" });

    const { User } = await import("../models/User");
    const currentUser = await User.findById(userId);
    const { getIO } = await import("../sockets/socketManager");

    if (file.workspaceId) {
      const activity = await Activity.create({
        workspaceId: file.workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "deleted_file",
        resourceId: file._id,
        resourceType: "File",
        message: `deleted file ${file.name}`
      });
      getIO().to(`workspace:${file.workspaceId}`).emit("activity:new", activity);
    }

    res.json({ message: "File deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStorageStats = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;

    const result = await File.aggregate([
      { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId), deletedAt: { $exists: false } } },
      { $group: { _id: null, totalSize: { $sum: "$size" }, totalFiles: { $sum: 1 } } }
    ]);

    const stats = result[0] || { totalSize: 0, totalFiles: 0 };
    // Assuming 100GB limit for premium workspace
    const limit = 100 * 1024 * 1024 * 1024; 

    // Largest files
    const largestFiles = await File.find({ workspaceId, deletedAt: { $exists: false } })
      .sort({ size: -1 })
      .limit(5)
      .populate("uploadedBy", "name avatar");

    // Most active uploader
    const uploadersResult = await File.aggregate([
      { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId), deletedAt: { $exists: false } } },
      { $group: { _id: "$uploadedBy", count: { $sum: 1 }, size: { $sum: "$size" } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    let mostActiveUploader = null;
    if (uploadersResult.length > 0) {
      const { User } = await import("../models/User");
      const user = await User.findById(uploadersResult[0]._id).select("name avatar");
      if (user) {
        mostActiveUploader = {
          user,
          count: uploadersResult[0].count,
          size: uploadersResult[0].size
        };
      }
    }

    res.json({
      used: stats.totalSize,
      limit,
      percentage: Math.min((stats.totalSize / limit) * 100, 100),
      totalFiles: stats.totalFiles,
      largestFiles,
      mostActiveUploader
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
