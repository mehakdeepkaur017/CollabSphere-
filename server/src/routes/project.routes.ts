import { Router } from "express";
import { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from "../controllers/project.controller";
import {
  getComments,
  addComment,
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getAttachments,
  addAttachment,
  deleteAttachment
} from "../controllers/project-extras.controller";
import { authenticate } from "../middleware/auth";

// Merge params to access workspaceId from parent router
const router = Router({ mergeParams: true });

// Protect all project routes
router.use(authenticate);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.patch("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

// Extras
router.get("/:projectId/comments", getComments);
router.post("/:projectId/comments", addComment);

router.get("/:projectId/tasks", getTasks);
router.post("/:projectId/tasks", addTask);
router.patch("/:projectId/tasks/:taskId", updateTask);
router.delete("/:projectId/tasks/:taskId", deleteTask);

router.get("/:projectId/attachments", getAttachments);
router.post("/:projectId/attachments", addAttachment);
router.delete("/:projectId/attachments/:attachmentId", deleteAttachment);

export default router;
