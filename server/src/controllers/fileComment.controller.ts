import { Request, Response } from "express";
import { FileComment } from "../models/FileComment";

export const getComments = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const comments = await FileComment.find({ fileId })
      .populate("userId", "name email avatar")
      .populate("mentions", "name")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { fileId } = req.params;
    const { content, mentions } = req.body;

    const comment = await FileComment.create({
      fileId,
      userId,
      content,
      mentions,
    });

    const populatedComment = await FileComment.findById(comment._id)
      .populate("userId", "name email avatar")
      .populate("mentions", "name");

    res.status(201).json(populatedComment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, resolved } = req.body;

    const comment = await FileComment.findByIdAndUpdate(
      id,
      { $set: { content, resolved } },
      { new: true }
    )
      .populate("userId", "name email avatar")
      .populate("mentions", "name");

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await FileComment.findByIdAndDelete(id);
    res.json({ message: "Comment deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
