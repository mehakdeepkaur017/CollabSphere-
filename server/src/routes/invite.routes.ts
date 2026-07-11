import { Router } from "express";
import { generateInvite, joinViaInvite } from "../controllers/invite.controller";
import { authenticate } from "../middleware/auth";

const router = Router({ mergeParams: true });

// Mounted under /api/workspaces/:workspaceId/invites
router.post("/generate", authenticate, generateInvite);

// Mounted under /api/workspaces/join
// Actually, joinViaInvite doesn't need workspaceId in the URL if it's a global token.
// Let's create a global route for joining via invite link in workspace.routes.ts instead, or mount it here.

export default router;
