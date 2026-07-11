import { Router } from "express";
import { uploadFile } from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const router = Router();

import { storage } from "../utils/cloudinary";

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

router.post("/", authenticate, upload.single("file"), uploadFile);

export default router;
