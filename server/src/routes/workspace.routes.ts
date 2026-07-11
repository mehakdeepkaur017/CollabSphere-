import { Router } from "express";
import { 
  createWorkspace, 
  getWorkspaces, 
  getWorkspaceById, 
  joinWorkspace, 
  updateWorkspace,
  updateMemberRole,
  removeMember,
  regenerateInviteCode,
  deleteWorkspace,
  archiveWorkspace,
  transferOwnership,
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from "../controllers/workspace.controller";
import { getWorkspaceAnalytics } from "../controllers/analytics.controller";
import { joinViaInvite } from "../controllers/invite.controller";
import { getActivities, getWorkspaceInsights } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth";
import projectRoutes from "./project.routes";
import channelRoutes from "./channel.routes";
import inviteRoutes from "./invite.routes";

const router = Router();

// Protect all workspace routes
router.use(authenticate);

router.post("/join-via-link", joinViaInvite);
router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.post("/join", joinWorkspace);
router.get("/:id", getWorkspaceById);
router.patch("/:id", updateWorkspace);

// Member management
router.put("/:id/members/:memberId", updateMemberRole);
router.delete("/:id/members/:memberId", removeMember);
router.post("/:id/invite-code/regenerate", regenerateInviteCode);

// Analytics
router.get("/:workspaceId/analytics", getWorkspaceAnalytics);

// Roles management
router.get("/:workspaceId/roles", getRoles);
router.post("/:workspaceId/roles", createRole);
router.put("/:workspaceId/roles/:roleId", updateRole);
router.delete("/:workspaceId/roles/:roleId", deleteRole);

// Danger Zone
router.delete("/:id", deleteWorkspace);
router.post("/:id/archive", archiveWorkspace);
router.post("/:id/transfer-ownership", transferOwnership);

// Activity routes
router.get("/:workspaceId/activities", getActivities);
router.get("/:workspaceId/activities/insights", getWorkspaceInsights);

// Mount project routes as a sub-router
router.use("/:workspaceId/projects", projectRoutes);

// Mount channel routes as a sub-router
router.use("/:workspaceId/channels", channelRoutes);

// Mount invite routes as a sub-router
router.use("/:workspaceId/invites", inviteRoutes);

export default router;

