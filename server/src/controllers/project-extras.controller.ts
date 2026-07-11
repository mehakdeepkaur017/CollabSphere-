import { Request, Response } from "express";
import { ProjectComment } from "../models/ProjectComment";
import { ProjectTask } from "../models/ProjectTask";
import { ProjectAttachment } from "../models/ProjectAttachment";
import { getIO } from "../sockets/socketManager";
import { User } from "../models/User";
import { Activity } from "../models/Activity";
import { Project } from "../models/Project";

// ================= COMMENTS =================

export const getComments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const comments = await ProjectComment.find({ projectId })
      .populate("author", "name avatar")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.params;
    const { content } = req.body;

    const comment = await ProjectComment.create({
      projectId,
      author: userId,
      content,
      reactions: [],
      mentions: [],
    });

    await comment.populate("author", "name avatar");

    getIO().to(`project:${projectId}`).emit("project:comment_added", comment);

    // Record activity
    const currentUser = await User.findById(userId);
    const project = await Project.findById(projectId);
    if (project) {
      const activity = await Activity.create({
        workspaceId: project.workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "added_comment",
        resourceId: projectId as any,
        resourceType: "Project",
        message: `commented on project ${project.name}`
      });
      getIO().to(`workspace:${project.workspaceId}`).emit("activity:new", activity);
    }

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// ================= TASKS (CHECKLIST) =================

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const tasks = await ProjectTask.find({ projectId }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const addTask = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;

    const task = await ProjectTask.create({
      projectId,
      content,
      isCompleted: false,
    });

    getIO().to(`project:${projectId}`).emit("project:task_added", task);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { isCompleted, content } = req.body;

    const task = await ProjectTask.findByIdAndUpdate(
      taskId,
      { $set: { isCompleted, content } },
      { new: true }
    );

    if (task) {
      getIO().to(`project:${task.projectId}`).emit("project:task_updated", task);
    }
    
    res.json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = await ProjectTask.findByIdAndDelete(taskId);
    if (task) {
      getIO().to(`project:${task.projectId}`).emit("project:task_deleted", taskId);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// ================= ATTACHMENTS =================

export const getAttachments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const attachments = await ProjectAttachment.find({ projectId })
      .populate("uploader", "name avatar")
      .sort({ createdAt: -1 });
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const addAttachment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.params;
    const { name, url, size, type } = req.body;

    const attachment = await ProjectAttachment.create({
      projectId,
      uploader: userId,
      name,
      url,
      size,
      type,
    });

    await attachment.populate("uploader", "name avatar");

    getIO().to(`project:${projectId}`).emit("project:attachment_added", attachment);

    // Record activity
    const currentUser = await User.findById(userId);
    const project = await Project.findById(projectId);
    if (project) {
      const activity = await Activity.create({
        workspaceId: project.workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "added_attachment",
        resourceId: projectId as any,
        resourceType: "Project",
        message: `uploaded a file to ${project.name}`
      });
      getIO().to(`workspace:${project.workspaceId}`).emit("activity:new", activity);
    }

    res.status(201).json(attachment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    const attachment = await ProjectAttachment.findByIdAndDelete(attachmentId);
    if (attachment) {
      getIO().to(`project:${attachment.projectId}`).emit("project:attachment_deleted", attachmentId);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
