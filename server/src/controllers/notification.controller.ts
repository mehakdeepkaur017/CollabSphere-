import { Request, Response } from "express";
import { Notification } from "../models/Notification";
import { User } from "../models/User";

// Get user's notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 20, unreadOnly = false, filter = 'all' } = req.query;

    const query: any = { recipient: userId, archived: false };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }

    if (filter !== 'all') {
      query.module = filter;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false, archived: false });

    res.json({
      notifications,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark single notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

// Mark all as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

// Archive notification
export const archiveNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { archived: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to archive notification" });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notification = await Notification.findOneAndDelete({ _id: id, recipient: userId });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

// Get settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.notificationPreferences || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// Update settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.notificationPreferences);
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
};
