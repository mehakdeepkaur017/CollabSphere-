import { Router } from "express";
import { uploadFiles, getFiles, updateFile, deleteFile, getStorageStats } from "../controllers/file.controller";
import { authenticate } from "../middleware/auth";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const router = Router();

import { storage } from "../utils/cloudinary";

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.post("/", authenticate, upload.array("files"), uploadFiles);
router.get("/", authenticate, getFiles);
router.get("/stats/:workspaceId", authenticate, getStorageStats);
router.patch("/:id", authenticate, updateFile);
router.delete("/:id", authenticate, deleteFile);

export default router;
