import { Router } from "express";
import { createFolder, getFolders, updateFolder, deleteFolder } from "../controllers/folder.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, createFolder);
router.get("/", authenticate, getFolders);
router.patch("/:id", authenticate, updateFolder);
router.delete("/:id", authenticate, deleteFolder);

export default router;
