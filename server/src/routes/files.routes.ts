import { Router } from "express";
import { uploadFiles, getFiles, updateFile, deleteFile, getStorageStats } from "../controllers/file.controller";
import { authenticate } from "../middleware/auth";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const router = Router();

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = crypto.randomBytes(8).toString("hex") + "-" + Date.now();
    cb(null, uniqueSuffix + ext);
  },
});

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
