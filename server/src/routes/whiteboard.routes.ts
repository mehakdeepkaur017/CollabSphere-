import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getWhiteboard, saveWhiteboard } from "../controllers/whiteboard.controller";

const router = Router();

router.use(authenticate);

router.get("/:workspaceId/whiteboard", getWhiteboard);
router.put("/:workspaceId/whiteboard", saveWhiteboard);

export default router;
