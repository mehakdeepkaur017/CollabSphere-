import { Request, Response } from "express";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Construct the URL. Since this is local, we serve it statically from /uploads
    const url = `/uploads/${req.file.filename}`;

    res.status(201).json({
      url,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Server error during upload" });
  }
};
