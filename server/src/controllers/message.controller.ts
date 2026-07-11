import { Request, Response } from "express";
import { Message } from "../models/Message";
import { getIO } from "../sockets/socketManager";
import { NotificationService } from "../services/notification.service";
import { NotificationModule, NotificationPriority } from "../models/Notification";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50, threadId } = req.query;

    const query: any = { channelId };
    if (threadId) {
      query.threadId = threadId;
    } else {
      query.threadId = { $exists: false }; // Only fetch top-level messages by default
    }

    const messages = await Message.find(query)
      .populate("sender", "name email avatar")
      .populate("mentions", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Message.countDocuments(query);
    const hasMore = (Number(page) * Number(limit)) < total;

    res.json({
      messages: messages.reverse(),
      nextPage: hasMore ? Number(page) + 1 : null,
      hasMore,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { channelId } = req.params;
    const { content, type, fileDetails, mentions, threadId } = req.body;

    const message = await Message.create({
      channelId,
      sender: userId,
      content,
      type: type || "text",
      fileDetails,
      mentions: mentions || [],
      threadId,
    });

    await message.populate("sender", "name email avatar");

    getIO().to(`channel:${channelId}`).emit("message:new", message);

    const { Channel } = await import("../models/Channel");
    const channel = await Channel.findById(channelId);
    if (channel) {
      const { User } = await import("../models/User");
      const { Activity } = await import("../models/Activity");
      const currentUser = await User.findById(userId);
      const activity = await Activity.create({
        workspaceId: channel.workspaceId,
        user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
        action: "message_sent",
        resourceId: message._id,
        resourceType: "Message",
        message: `sent a message in ${channel.name}`
      });
      getIO().to(`workspace:${channel.workspaceId}`).emit("activity:new", activity);

      // Notify mentions
      if (mentions && mentions.length > 0) {
        const mentionsToNotify = mentions.filter((m: string) => m !== userId);
        if (mentionsToNotify.length > 0) {
          await NotificationService.notifyUsers(mentionsToNotify, {
            actorId: userId,
            workspaceId: channel.workspaceId.toString(),
            module: NotificationModule.CHAT,
            type: 'mention',
            title: 'New Mention',
            message: `mentioned you in ${channel.name}`,
            entityId: message._id.toString(),
            entityType: 'Message',
            priority: NotificationPriority.HIGH
          });
        }
      }

      // Notify thread creator if it's a reply
      if (threadId) {
        const parentMessage = await Message.findById(threadId);
        if (parentMessage && parentMessage.sender.toString() !== userId) {
          // Avoid double notifying if they were mentioned
          if (!mentions || !mentions.includes(parentMessage.sender.toString())) {
            await NotificationService.notifyUser({
              recipientId: parentMessage.sender.toString(),
              actorId: userId,
              workspaceId: channel.workspaceId.toString(),
              module: NotificationModule.CHAT,
              type: 'reply',
              title: 'New Reply',
              message: `replied to your message in ${channel.name}`,
              entityId: message._id.toString(),
              entityType: 'Message',
              priority: NotificationPriority.NORMAL
            });
          }
        }
      }
    }

    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content, isPinned } = req.body;

    const updateData: any = {};
    if (content !== undefined) {
      updateData.content = content;
      updateData.isEdited = true;
    }
    if (isPinned !== undefined) {
      updateData.isPinned = isPinned;
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      { $set: updateData },
      { new: true }
    ).populate("sender", "name email avatar");

    if (message) {
      getIO().to(`channel:${message.channelId}`).emit("message:updated", message);

      const userId = req.user?.userId;
      const { Channel } = await import("../models/Channel");
      const channel = await Channel.findById(message.channelId);
      if (channel) {
        const { User } = await import("../models/User");
        const { Activity } = await import("../models/Activity");
        const currentUser = await User.findById(userId);

        if (isPinned !== undefined) {
          const activity = await Activity.create({
            workspaceId: channel.workspaceId,
            user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
            action: isPinned ? "pinned_message" : "unpinned_message",
            resourceId: message._id,
            resourceType: "Message",
            message: `${isPinned ? 'pinned' : 'unpinned'} a message in ${channel.name}`
          });
          getIO().to(`workspace:${channel.workspaceId}`).emit("activity:new", activity);
        } else if (content !== undefined) {
          const activity = await Activity.create({
            workspaceId: channel.workspaceId,
            user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
            action: "edited_message",
            resourceId: message._id,
            resourceType: "Message",
            message: `edited a message in ${channel.name}`
          });
          getIO().to(`workspace:${channel.workspaceId}`).emit("activity:new", activity);
        }
      }
    }

    res.json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndDelete(messageId);
    
    if (message) {
      // Also delete all replies if it was a parent message
      await Message.deleteMany({ threadId: messageId });
      getIO().to(`channel:${message.channelId}`).emit("message:deleted", messageId);

      const userId = req.user?.userId;
      const { Channel } = await import("../models/Channel");
      const channel = await Channel.findById(message.channelId);
      if (channel) {
        const { User } = await import("../models/User");
        const { Activity } = await import("../models/Activity");
        const currentUser = await User.findById(userId);
        const activity = await Activity.create({
          workspaceId: channel.workspaceId,
          user: { _id: userId as any, name: currentUser?.name || "A member", avatar: currentUser?.avatar },
          action: "deleted_message",
          resourceId: message._id,
          resourceType: "Message",
          message: `deleted a message in ${channel.name}`
        });
        getIO().to(`workspace:${channel.workspaceId}`).emit("activity:new", activity);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const toggleReaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);

    if (reactionIndex > -1) {
      // Emoji exists
      const userIndex = message.reactions[reactionIndex].users.indexOf(userId as any);
      if (userIndex > -1) {
        // User already reacted, remove them
        message.reactions[reactionIndex].users.splice(userIndex, 1);
        if (message.reactions[reactionIndex].users.length === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        // Add user
        message.reactions[reactionIndex].users.push(userId as any);
      }
    } else {
      // New emoji
      message.reactions.push({ emoji, users: [userId as any] });
    }

    await message.save();
    await message.populate("sender", "name email avatar");

    getIO().to(`channel:${message.channelId}`).emit("message:updated", message);

    res.json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
