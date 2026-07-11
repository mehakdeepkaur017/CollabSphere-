import { Request, Response } from "express";
import crypto from "crypto";
import { Workspace } from "../models/Workspace";
import { createWorkspaceSchema, joinWorkspaceSchema, updateWorkspaceSchema } from "../validators/workspace.validator";
import { getIO } from "../sockets/socketManager";
import { Activity } from "../models/Activity";
import { User } from "../models/User";
import { NotificationService } from "../services/notification.service";
import { NotificationModule, NotificationPriority } from "../models/Notification";

export const createWorkspace = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const data = createWorkspaceSchema.parse(req.body);
    
    // Generate a unique 8-character invite code
    const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const workspace = await Workspace.create({
      ...data,
      inviteCode,
      owner: userId,
      members: [{ user: userId, role: "owner" }],
    });

    await workspace.populate("owner", "name email");
    await workspace.populate("members.user", "name email");

    // Auto-create a "General" communication space
    const { Channel } = await import("../models/Channel");
    await Channel.create({
      workspaceId: workspace._id,
      name: "General",
      description: "General discussion for everyone in the workspace.",
      type: "public",
      members: [userId],
      createdBy: userId,
      icon: "hash"
    });

    const currentUser = await User.findById(userId);
    const userName = currentUser ? currentUser.name : "A member";

    const activity = await Activity.create({
      workspaceId: workspace._id,
      user: {
        _id: userId,
        name: userName
      },
      action: "created_workspace",
      resourceId: workspace._id,
      resourceType: "Workspace",
      message: `created the workspace`
    });

    res.status(201).json(workspace);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};

export const getWorkspaces = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const workspaces = await Workspace.find({ "members.user": userId })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    res.json(workspaces);
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getWorkspaceById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const workspace = await Workspace.findOne({ _id: id, "members.user": userId })
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!workspace) return res.status(404).json({ error: "Workspace not found" });

    res.json(workspace);
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
  }
};

export const joinWorkspace = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { inviteCode } = joinWorkspaceSchema.parse(req.body);

    const workspace = await Workspace.findOne({ inviteCode });
    if (!workspace) return res.status(404).json({ error: "Invalid invite code" });

    // Check if already a member
    const isMember = workspace.members.some((m) => m.user.toString() === userId.toString());
    if (isMember) {
      return res.status(400).json({ error: "You are already a member of this workspace" });
    }

    // Add user to workspace
    workspace.members.push({ user: userId as any, role: "member", joinedAt: new Date() });
    await workspace.save();

    await workspace.populate("owner", "name email");
    await workspace.populate("members.user", "name email");

    getIO().to(`workspace:${workspace._id}`).emit("workspace:updated", workspace);

    const currentUser = await User.findById(userId);
    const userName = currentUser ? currentUser.name : "A member";

    const activity = await Activity.create({
      workspaceId: workspace._id,
      user: {
        _id: userId,
        name: userName
      },
      action: "joined_workspace",
      resourceId: workspace._id,
      resourceType: "Workspace",
      message: `joined the workspace`
    });

    getIO().to(`workspace:${workspace._id}`).emit("activity:new", activity);

    // Notify workspace owner
    if (workspace.owner.toString() !== userId) {
      await NotificationService.notifyUser({
        recipientId: workspace.owner.toString(),
        actorId: userId,
        workspaceId: workspace._id.toString(),
        module: NotificationModule.WORKSPACE,
        type: 'joined',
        title: 'New Member',
        message: `joined the workspace`,
        entityId: workspace._id.toString(),
        entityType: 'Workspace',
        priority: NotificationPriority.NORMAL
      });
    }

    res.json(workspace);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};

export const updateWorkspace = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const data = updateWorkspaceSchema.parse(req.body);

    const workspace = await Workspace.findOneAndUpdate(
      { _id: id, "members.user": userId, "members.role": { $in: ["owner", "leader"] } },
      { $set: data },
      { new: true }
    )
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!workspace) {
      return res.status(403).json({ error: "Not authorized to edit this workspace" });
    }

    getIO().to(`workspace:${id}`).emit("workspace:updated", workspace);

    const currentUser = await User.findById(userId);
    const userName = currentUser ? currentUser.name : "A member";

    const activity = await Activity.create({
      workspaceId: workspace._id,
      user: {
        _id: userId,
        name: userName
      },
      action: "updated_workspace",
      resourceId: workspace._id,
      resourceType: "Workspace",
      message: `updated workspace settings`
    });

    getIO().to(`workspace:${id}`).emit("activity:new", activity);

    res.json(workspace);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id, memberId } = req.params;
    const { role } = req.body;

    const workspace = await Workspace.findOne({
      _id: id,
      "members.user": userId,
      "members.role": { $in: ["owner", "leader"] }
    });

    if (!workspace) return res.status(403).json({ error: "Not authorized to modify members" });

    const memberToUpdate = workspace.members.find(m => m.user.toString() === memberId);
    if (!memberToUpdate) return res.status(404).json({ error: "Member not found" });

    // Ensure we don't demote the owner unless it's a transfer
    if (memberToUpdate.role === "owner" && role !== "owner") {
      return res.status(400).json({ error: "Cannot demote the workspace owner" });
    }
    
    // Logic for transferring ownership
    if (role === "owner") {
      const currentOwner = workspace.members.find(m => m.user.toString() === userId);
      if (currentOwner) currentOwner.role = "leader"; // demote current owner
    }

    memberToUpdate.role = role;
    await workspace.save();

    await workspace.populate("owner", "name email");
    await workspace.populate("members.user", "name email");

    getIO().to(`workspace:${id}`).emit("workspace:updated", workspace);

    const currentUser = await User.findById(userId);
    const targetUser = await User.findById(memberId);
    
    if (currentUser && targetUser) {
      const activity = await Activity.create({
        workspaceId: workspace._id,
        user: { _id: userId, name: currentUser.name, avatar: currentUser.avatar },
        action: role === "owner" ? "owner_changed" : "member_updated",
        resourceId: targetUser._id,
        resourceType: "User",
        message: role === "owner" ? `transferred ownership to ${targetUser.name}` : `changed ${targetUser.name}'s role to ${role}`,
        metadata: { targetUserId: targetUser._id, newRole: role }
      });
      getIO().to(`workspace:${id}`).emit("activity:new", activity);
    }

    res.json(workspace);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id, memberId } = req.params;

    const workspace = await Workspace.findOne({
      _id: id,
      "members.user": userId,
      "members.role": { $in: ["owner", "leader"] }
    });

    if (!workspace) return res.status(403).json({ error: "Not authorized to remove members" });

    const memberToRemove = workspace.members.find(m => m.user.toString() === memberId);
    if (!memberToRemove) return res.status(404).json({ error: "Member not found" });

    if (memberToRemove.role === "owner") {
      return res.status(400).json({ error: "Cannot remove the workspace owner" });
    }

    workspace.members = workspace.members.filter(m => m.user.toString() !== memberId);
    await workspace.save();

    await workspace.populate("owner", "name email");
    await workspace.populate("members.user", "name email");

    getIO().to(`workspace:${id}`).emit("workspace:updated", workspace);
    getIO().to(`user:${memberId}`).emit("workspace:removed", id);

    const currentUser = await User.findById(userId);
    const targetUser = await User.findById(memberId);
    
    if (currentUser && targetUser) {
      const isSelf = userId === memberId;
      const activity = await Activity.create({
        workspaceId: workspace._id,
        user: { _id: userId, name: currentUser.name, avatar: currentUser.avatar },
        action: isSelf ? "left_workspace" : "member_removed",
        resourceId: targetUser._id,
        resourceType: "User",
        message: isSelf ? `left the workspace` : `removed ${targetUser.name} from the workspace`,
        metadata: { targetUserId: targetUser._id }
      });
      getIO().to(`workspace:${id}`).emit("activity:new", activity);
    }

    res.json(workspace);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const regenerateInviteCode = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const workspace = await Workspace.findOne({
      _id: id,
      "members.user": userId,
      "members.role": { $in: ["owner", "leader"] }
    });

    if (!workspace) return res.status(403).json({ error: "Not authorized to modify workspace" });

    const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    workspace.inviteCode = inviteCode;
    await workspace.save();

    await workspace.populate("owner", "name email");
    await workspace.populate("members.user", "name email");

    getIO().to(`workspace:${id}`).emit("workspace:updated", workspace);

    res.json(workspace);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// --- DANGER ZONE ---
export const deleteWorkspace = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const workspace = await Workspace.findOne({ _id: id, owner: userId });
    if (!workspace) return res.status(403).json({ error: "Only the workspace owner can delete the workspace" });

    // In a real app, you would delete all associated projects, tasks, files, messages, etc.
    // For this implementation, we just delete the workspace document.
    await Workspace.findByIdAndDelete(id);

    // Notify members that workspace was deleted
    const { NotificationService } = await import("../services/notification.service");
    const { NotificationModule, NotificationPriority } = await import("../models/Notification");
    const membersToNotify = workspace.members.map(m => m.user.toString()).filter(uid => uid !== userId);
    
    if (membersToNotify.length > 0) {
      await NotificationService.notifyUsers(membersToNotify, {
        module: NotificationModule.WORKSPACE,
        type: 'deleted',
        title: 'Workspace Deleted',
        message: `The workspace "${workspace.name}" has been deleted.`,
        priority: NotificationPriority.HIGH
      });
    }

    res.json({ success: true, message: "Workspace deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const archiveWorkspace = async (req: Request, res: Response) => {
  res.json({ message: "Workspace archived (Not fully implemented yet)" });
};

export const transferOwnership = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { newOwnerId } = req.body;

    const workspace = await Workspace.findOne({ _id: id, owner: userId });
    if (!workspace) return res.status(403).json({ error: "Only the owner can transfer ownership" });

    // Ensure new owner is a member
    const newOwnerMember = workspace.members.find(m => m.user.toString() === newOwnerId);
    if (!newOwnerMember) return res.status(400).json({ error: "New owner must be a member of the workspace" });

    // Update old owner to admin, new owner to owner
    const oldOwnerMember = workspace.members.find(m => m.user.toString() === userId);
    if (oldOwnerMember) oldOwnerMember.role = "admin";
    newOwnerMember.role = "owner";
    workspace.owner = newOwnerId as any;

    await workspace.save();

    res.json({ success: true, message: "Ownership transferred successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- ROLES MANAGEMENT ---
export const getRoles = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { WorkspaceRole } = await import("../models/WorkspaceRole");
    
    const roles = await WorkspaceRole.find({ workspaceId }).sort({ createdAt: 1 });
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, permissions } = req.body;
    
    const { WorkspaceRole } = await import("../models/WorkspaceRole");

    const role = await WorkspaceRole.create({
      workspaceId,
      name,
      description,
      permissions
    });

    res.status(201).json(role);
  } catch (error: any) {
    if (error.code === 11000) return res.status(400).json({ error: "Role name already exists" });
    res.status(400).json({ error: error.message });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { permissions, description } = req.body;
    
    const { WorkspaceRole } = await import("../models/WorkspaceRole");
    
    const role = await WorkspaceRole.findById(roleId);
    if (!role) return res.status(404).json({ error: "Role not found" });

    if (permissions) role.permissions = permissions;
    if (description !== undefined) role.description = description;

    await role.save();

    res.json(role);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { WorkspaceRole } = await import("../models/WorkspaceRole");
    
    const role = await WorkspaceRole.findById(roleId);
    if (!role) return res.status(404).json({ error: "Role not found" });
    if (role.isSystem) return res.status(400).json({ error: "Cannot delete a system role" });

    await WorkspaceRole.findByIdAndDelete(roleId);

    // Ideally, assign members with this role to a default role like "member"
    // (Omitted for brevity in this MVP)

    res.json({ success: true, message: "Role deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
