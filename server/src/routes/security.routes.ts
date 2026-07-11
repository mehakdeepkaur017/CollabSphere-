import { Router } from "express";
import { getSessions, revokeSession, revokeAllOtherSessions } from "../controllers/security.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/sessions", getSessions);
router.delete("/sessions/:sessionId", revokeSession);
router.delete("/sessions", revokeAllOtherSessions);

export default router;
