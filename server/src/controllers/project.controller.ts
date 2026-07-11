import { Request, Response } from "express";
import { Project } from "../models/Project";
import { Workspace } from "../models/Workspace";
import { Channel } from "../models/Channel";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator";
import { getIO } from "../sockets/socketManager";
import { Activity } from "../models/Activity";
import { NotificationService } from "../services/notification.service";
import { NotificationModule, NotificationPriority } from "../models/Notification";

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workspaceId } = req.params;
    
    // Verify user is member of workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": userId });
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or unauthorized" });
    }

    const data = createProjectSchema.parse(req.body);

    const projectData = await Project.create({
      ...data,
      workspaceId,
      members: [userId, ...(data.members || [])],
    });

    const project = await Project.findById(projectData._id).populate("members", "name email avatar");

    if (!project) {
      return res.status(500).json({ error: "Failed to create project" });
    }

    const discussionChannel = await Channel.create({
      workspaceId,
      projectId: project._id,
      name: `${project.name} Discussion`,
      description: `Discussion space for ${project.name}`,
      icon: "📁",
      type: "project",
      members: project.members,
      createdBy: userId,
    });

    getIO().to(`workspace:${workspaceId}`).emit("project:created", project);
    getIO().to(`workspace:${workspaceId}`).emit("channel:new", discussionChannel);

    const { User } = await import("../models/User");
    const currentUser = await User.findById(userId);
    const userName = currentUser ? currentUser.name : "A member";

    const activity = await Activity.create({
      workspaceId,
      user: {
        _id: userId,
        name: userName,
        avatar: currentUser?.avatar
      },
      action: "created_project",
      resourceId: project._id,
      resourceType: "Project",
      message: `created project "${project.name}"`
    });

    getIO().to(`workspace:${workspaceId}`).emit("activity:new", activity);

    // Notify workspace members (except creator)
    const membersToNotify = workspace.members
      .filter(m => m.user.toString() !== userId)
      .map(m => m.user.toString());
    
    if (membersToNotify.length > 0) {
      await NotificationService.notifyUsers(membersToNotify, {
        actorId: userId,
        workspaceId,
        module: NotificationModule.PROJECT,
        type: 'created',
        title: 'New Project',
        message: `created project "${project.name}"`,
        entityId: project._id.toString(),
        entityType: 'Project',
        priority: NotificationPriority.NORMAL
      });
    }

    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workspaceId } = req.params;

    // Verify user is member of workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": userId });
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or unauthorized" });
    }

    const projects = await Project.find({ workspaceId })
      .populate("members", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workspaceId, projectId } = req.params;

    // Verify user is member of workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": userId });
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or unauthorized" });
    }

    const project = await Project.findOne({ _id: projectId, workspaceId })
      .populate("members", "name email avatar");

    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workspaceId, projectId } = req.params;

    // Verify user is member of workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": userId });
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or unauthorized" });
    }

    const data = updateProjectSchema.parse(req.body);

    const project = await Project.findOneAndUpdate(
      { _id: projectId, workspaceId },
      { $set: data },
      { new: true }
    ).populate("members", "name email avatar");

    if (!project) return res.status(404).json({ error: "Project not found" });

    getIO().to(`workspace:${workspaceId}`).emit("project:updated", project);

    const { User } = await import("../models/User");
    const currentUser = await User.findById(userId);
    const userName = currentUser ? currentUser.name : "A member";

    const activity = await Activity.create({
      workspaceId,
      user: {
        _id: userId,
        name: userName,
        avatar: currentUser?.avatar
      },
      action: "updated_project",
      resourceId: project._id,
      resourceType: "Project",
      message: `updated project "${project.name}"`
    });

    getIO().to(`workspace:${workspaceId}`).emit("activity:new", activity);

    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workspaceId, projectId } = req.params;

    // Verify user is owner/leader of workspace to delete projects
    const workspace = await Workspace.findOne({ 
      _id: workspaceId, 
      "members.user": userId,
      "members.role": { $in: ["owner", "leader"] }
    });
    
    if (!workspace) {
      return res.status(403).json({ error: "Not authorized to delete projects in this workspace" });
    }

    const project = await Project.findOneAndDelete({ _id: projectId, workspaceId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    getIO().to(`workspace:${workspaceId}`).emit("project:deleted", { projectId });

    const { User } = await import("../models/User");
    const currentUser = await User.findById(userId);
    const userName = currentUser ? currentUser.name : "A member";

    const activity = await Activity.create({
      workspaceId,
      user: {
        _id: userId,
        name: userName,
        avatar: currentUser?.avatar
      },
      action: "deleted_project",
      resourceId: projectId,
      resourceType: "Project",
      message: `deleted project "${project.name}"`
    });

    getIO().to(`workspace:${workspaceId}`).emit("activity:new", activity);

    res.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
  }
};
