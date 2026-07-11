import { Request, Response } from "express";
import { Whiteboard } from "../models/Whiteboard";

export const getWhiteboard = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    let whiteboard = await Whiteboard.findOne({ workspaceId });
    
    if (!whiteboard) {
      whiteboard = await Whiteboard.create({ workspaceId, objects: [] });
    }
    
    res.json(whiteboard);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching whiteboard" });
  }
};

export const saveWhiteboard = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { objects } = req.body;
    
    const whiteboard = await Whiteboard.findOneAndUpdate(
      { workspaceId },
      { objects },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, whiteboard });
  } catch (error) {
    res.status(500).json({ error: "Server error saving whiteboard" });
  }
};
