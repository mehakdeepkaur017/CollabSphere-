import { Request, Response } from "express";
import { Meeting } from "../models/Meeting";
import { Channel } from "../models/Channel";
import { v4 as uuidv4 } from "uuid";
import { getIO } from "../sockets/socketManager";
import mongoose from "mongoose";

export const getMeetings = async (req: Request, res: Response) => {
  try {
    const { workspaceId, projectId, status } = req.query;
    
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId is required" });
    }

    const query: any = { workspaceId };
    
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;

    const meetings = await Meeting.find(query)
      .populate("createdBy", "name email avatar")
      .populate("participants", "name email avatar")
      .sort({ date: 1, startTime: 1 });

    res.json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
};

export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id)
      .populate("createdBy", "name email avatar")
      .populate("participants", "name email avatar");

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.json(meeting);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({ error: "Failed to fetch meeting" });
  }
};

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      workspaceId,
      projectId,
      taskId,
      date,
      startTime,
      endTime,
      timezone,
      recurring,
      color,
      participants,
      agenda,
      waitingRoom,
      password,
    } = req.body;

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jitsiRoomName = `collabsphere-meeting-${uuidv4()}`;

    // Create a dedicated meeting chat channel
    const chatChannel = await Channel.create({
      workspaceId,
      projectId,
      name: `Meeting Chat: ${title}`,
      type: "meeting",
      members: participants || [userId],
      createdBy: userId,
    });

    const meeting = await Meeting.create({
      title,
      description,
      workspaceId,
      projectId,
      taskId,
      createdBy: userId,
      date,
      startTime,
      endTime,
      timezone,
      recurring,
      color,
      participants,
      agenda,
      waitingRoom,
      password,
      jitsiRoomName,
      status: "scheduled",
      chatChannelId: chatChannel._id,
    });

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate("createdBy", "name email avatar")
      .populate("participants", "name email avatar");

    const io = getIO();
    io.to(workspaceId.toString()).emit("meeting:created", populatedMeeting);

    // Also notify Activity Center (if we had an activity service here)

    res.status(201).json(populatedMeeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
};

export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const meeting = await Meeting.findByIdAndUpdate(id, updates, { new: true })
      .populate("createdBy", "name email avatar")
      .populate("participants", "name email avatar");

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const io = getIO();
    io.to(meeting.workspaceId.toString()).emit("meeting:updated", meeting);

    res.json(meeting);
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({ error: "Failed to update meeting" });
  }
};

export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    await Channel.findByIdAndDelete(meeting.chatChannelId);
    await Meeting.findByIdAndDelete(id);

    const io = getIO();
    io.to(meeting.workspaceId.toString()).emit("meeting:deleted", id);

    res.json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ error: "Failed to delete meeting" });
  }
};

export const changeMeetingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["scheduled", "live", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const meeting = await Meeting.findByIdAndUpdate(id, { status }, { new: true })
      .populate("createdBy", "name email avatar")
      .populate("participants", "name email avatar");

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const io = getIO();
    io.to(meeting.workspaceId.toString()).emit("meeting:status_changed", meeting);

    res.json(meeting);
  } catch (error) {
    console.error("Error changing meeting status:", error);
    res.status(500).json({ error: "Failed to change meeting status" });
  }
};

export const updateMeetingNotes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const meeting = await Meeting.findByIdAndUpdate(id, { notes }, { new: true });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // We can emit this just to the specific meeting room if we have a room for it
    const io = getIO();
    io.to(`meeting_${id}`).emit("meeting:notes_updated", { meetingId: id, notes });

    res.json(meeting);
  } catch (error) {
    console.error("Error updating meeting notes:", error);
    res.status(500).json({ error: "Failed to update meeting notes" });
  }
};
