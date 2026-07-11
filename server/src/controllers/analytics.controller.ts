import { Request, Response } from "express";
import { Workspace } from "../models/Workspace";
import { Project } from "../models/Project";
import { Message } from "../models/Message";
import { File } from "../models/File";
import { ProjectTask } from "../models/ProjectTask";
import { Activity } from "../models/Activity";

export const getWorkspaceAnalytics = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user?.userId;

    const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": userId });
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });

    // Overview Stats
    const totalMembers = workspace.members.length;
    const totalProjects = await Project.countDocuments({ workspaceId });
    const totalFiles = await File.countDocuments({ workspaceId, deletedAt: { $exists: false } });
    
    // To count messages, we need to find channels in this workspace
    const { Channel } = await import("../models/Channel");
    const channels = await Channel.find({ workspaceId }).select("_id");
    const channelIds = channels.map(c => c._id);
    const totalMessages = await Message.countDocuments({ channelId: { $in: channelIds } });

    // Find all projects to count tasks
    const projects = await Project.find({ workspaceId }).select("_id");
    const projectIds = projects.map(p => p._id);
    const totalTasks = await ProjectTask.countDocuments({ projectId: { $in: projectIds } });

    // Activity Trends (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await Activity.find({
      workspaceId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const activityByDay = activities.reduce((acc: any, act) => {
      const date = act.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const trends = Object.keys(activityByDay)
      .sort()
      .map(date => ({
        date,
        count: activityByDay[date]
      }));

    // Most active member (based on activities)
    const memberActivity = activities.reduce((acc: any, act) => {
      const uId = act.user._id.toString();
      if (!acc[uId]) {
        acc[uId] = { user: act.user, count: 0 };
      }
      acc[uId].count++;
      return acc;
    }, {});

    const mostActiveMember = Object.values(memberActivity)
      .sort((a: any, b: any) => b.count - a.count)[0] || null;

    res.json({
      overview: {
        members: totalMembers,
        projects: totalProjects,
        messages: totalMessages,
        files: totalFiles,
        tasks: totalTasks,
      },
      trends,
      mostActiveMember,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
