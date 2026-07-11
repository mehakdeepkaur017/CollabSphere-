import { Request, Response } from "express";
import { Workspace } from "../models/Workspace";
import crypto from "crypto";

export const generateInvite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workspaceId } = req.params;
    const { role = "member", expiresIn = 7 * 24 * 60 * 60 * 1000 } = req.body; // Default 7 days

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": userId,
      "members.role": { $in: ["owner", "leader", "admin"] } // Only admins can generate invites
    });

    if (!workspace) {
      return res.status(403).json({ error: "Unauthorized to create invites" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiresIn);

    workspace.inviteLinks = workspace.inviteLinks || [];
    workspace.inviteLinks.push({ token, role, expiresAt, createdBy: userId as any });
    await workspace.save();

    res.status(201).json({ token, role, expiresAt });
  } catch (error: any) {
    res.status(500).json({ error: "Server error generating invite" });
  }
};

export const joinViaInvite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { token } = req.body;

    const workspace = await Workspace.findOne({ "inviteLinks.token": token });
    if (!workspace) {
      return res.status(404).json({ error: "Invalid invite link" });
    }

    const invite = (workspace.inviteLinks || []).find((inv) => inv.token === token);
    if (!invite || invite.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invite link expired or invalid" });
    }

    const existingMember = workspace.members.find((m) => m.user.toString() === userId.toString());
    if (existingMember) {
      return res.status(400).json({ error: "You are already a member of this workspace" });
    }

    workspace.members.push({ user: userId as any, role: invite.role, joinedAt: new Date() });
    await workspace.save();

    const { getIO } = await import("../sockets/socketManager");
    const { Activity } = await import("../models/Activity");
    const { User } = await import("../models/User");

    await workspace.populate("owner", "name email");
    await workspace.populate("members.user", "name email");

    getIO().to(`workspace:${workspace._id}`).emit("workspace:updated", workspace);

    const currentUser = await User.findById(userId);
    const userName = currentUser ? currentUser.name : "A member";

    const activity = await Activity.create({
      workspaceId: workspace._id,
      user: {
        _id: userId,
        name: userName,
        avatar: currentUser?.avatar
      },
      action: "joined_workspace",
      resourceId: workspace._id,
      resourceType: "Workspace",
      message: `joined the workspace via invite link`
    });

    getIO().to(`workspace:${workspace._id}`).emit("activity:new", activity);

    res.status(200).json({ workspaceId: workspace._id, message: "Joined successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Server error joining workspace" });
  }
};
