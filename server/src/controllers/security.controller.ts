import { Request, Response } from "express";
import { Session } from "../models/Session";

export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const sessions = await Session.find({ user: userId }).sort({ lastActive: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

export const revokeSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    const session = await Session.findOneAndDelete({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to revoke session" });
  }
};

export const revokeAllOtherSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    // We get the current token from req headers
    let currentToken = req.cookies.accessToken;
    if (!currentToken && req.headers.authorization?.startsWith("Bearer ")) {
      currentToken = req.headers.authorization.split(" ")[1];
    }

    await Session.deleteMany({ user: userId, token: { $ne: currentToken } });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to revoke sessions" });
  }
};
