import { Request, Response } from "express";
import { Channel } from "../models/Channel";
import { getIO } from "../sockets/socketManager";

export const getChannels = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const channels = await Channel.find({ workspaceId, isArchived: false })
      .populate("members", "name email avatar")
      .sort({ createdAt: 1 });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createChannel = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workspaceId } = req.params;
    const { name, description, type, members } = req.body;

    // Make sure creator is in the members list
    const channelMembers = members || [];
    if (!channelMembers.includes(userId)) {
      channelMembers.push(userId);
    }

    const channel = await Channel.create({
      workspaceId,
      name,
      description,
      type: type || "public",
      members: channelMembers,
      createdBy: userId,
    });

    await channel.populate("members", "name email avatar");

    getIO().to(`workspace:${workspaceId}`).emit("channel:new", channel);

    const { User } = await import("../models/User");
    const { Activity } = await import("../models/Activity");
    const currentUser = await User.findById(userId);

    const activity = await Activity.create({
      workspaceId,
      user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
      action: "created_channel",
      resourceId: channel._id,
      resourceType: "Channel",
      message: `created a space: ${channel.name}`
    });
    getIO().to(`workspace:${workspaceId}`).emit("activity:new", activity);

    res.status(201).json(channel);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const { name, description, isArchived } = req.body;

    const channel = await Channel.findByIdAndUpdate(
      channelId,
      { $set: { name, description, isArchived } },
      { new: true }
    ).populate("members", "name email avatar");

    if (channel) {
      getIO().to(`workspace:${channel.workspaceId}`).emit("channel:updated", channel);
    }

    res.json(channel);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findByIdAndDelete(channelId);
    
    if (channel) {
      getIO().to(`workspace:${channel.workspaceId}`).emit("channel:deleted", channelId);

      const userId = req.user?.userId;
      const { User } = await import("../models/User");
      const { Activity } = await import("../models/Activity");
      const currentUser = await User.findById(userId);

      const activity = await Activity.create({
        workspaceId: channel.workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "deleted_channel",
        resourceId: channel._id,
        resourceType: "Channel",
        message: `deleted space: ${channel.name}`
      });
      getIO().to(`workspace:${channel.workspaceId}`).emit("activity:new", activity);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
