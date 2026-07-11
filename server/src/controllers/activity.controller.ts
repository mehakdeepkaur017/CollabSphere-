import { Request, Response } from "express";
import { Activity } from "../models/Activity";
import { Workspace } from "../models/Workspace";
import { startOfDay, startOfWeek, endOfDay } from "date-fns";

export const getActivities = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workspaceId } = req.params;
    const { 
      page = 1, 
      limit = 50, 
      type, 
      user, 
      dateRange, // 'today', 'yesterday', 'this_week', 'earlier'
      search,
      mentionsOnly
    } = req.query;

    // Verify user is member of workspace
    const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": userId });
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or unauthorized" });
    }

    const query: any = { workspaceId };

    // Filters
    if (type && type !== 'all') {
      query.resourceType = type;
    }
    
    if (user) {
      query["user._id"] = user;
    }

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } }
      ];
    }

    if (mentionsOnly === 'true') {
      // Find activities where this user was the target (e.g., assigned, mentioned, invited)
      // We will store targetUserId in metadata for these cases.
      query["metadata.targetUserId"] = userId;
    }

    if (dateRange) {
      const now = new Date();
      if (dateRange === 'today') {
        query.createdAt = { $gte: startOfDay(now) };
      } else if (dateRange === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        query.createdAt = { $gte: startOfDay(yesterday), $lte: endOfDay(yesterday) };
      } else if (dateRange === 'this_week') {
        query.createdAt = { $gte: startOfWeek(now) };
      } else if (dateRange === 'earlier') {
        query.createdAt = { $lt: startOfWeek(now) };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getWorkspaceInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": userId });
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or unauthorized" });
    }

    const todayStart = startOfDay(new Date());
    const weekStart = startOfWeek(new Date());

    // Today's stats
    const todayActivities = await Activity.find({ workspaceId, createdAt: { $gte: todayStart } });
    
    const stats = {
      filesUploaded: todayActivities.filter(a => a.action === 'file_uploaded').length,
      tasksCompleted: todayActivities.filter(a => a.action === 'task_completed').length,
      messagesSent: todayActivities.filter(a => a.action === 'message_sent').length,
      projectsUpdated: todayActivities.filter(a => a.action.startsWith('project_')).length,
    };

    // Most active member (This week)
    const weekActivities = await Activity.find({ workspaceId, createdAt: { $gte: weekStart } });
    
    const memberCounts: Record<string, { count: number, name: string, avatar: string }> = {};
    weekActivities.forEach(a => {
      const uid = a.user._id.toString();
      if (!memberCounts[uid]) {
        memberCounts[uid] = { count: 0, name: a.user.name, avatar: a.user.avatar || '' };
      }
      memberCounts[uid].count++;
    });

    let mostActiveMember = null;
    let maxCount = 0;
    Object.values(memberCounts).forEach(m => {
      if (m.count > maxCount) {
        maxCount = m.count;
        mostActiveMember = m;
      }
    });

    // Weekly Graph (Last 7 days)
    const weeklyGraph = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = startOfDay(d);
      const end = endOfDay(d);
      
      const count = await Activity.countDocuments({ workspaceId, createdAt: { $gte: start, $lte: end } });
      weeklyGraph.push({
        date: d.toISOString(),
        count
      });
    }

    res.json({
      stats,
      mostActiveMember,
      weeklyGraph
    });
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
  }
};
