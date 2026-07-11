import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createTask, getTasks, updateTask, deleteTask, reorderTasks, getTaskComments, addTaskComment, deleteTaskComment, getMyTasks } from "../controllers/task.controller";

const router = Router();

router.use(authenticate);

router.post("/reorder", reorderTasks);
router.get("/my-tasks", getMyTasks);
router.post("/", createTask);
router.get("/project/:projectId", getTasks);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

router.get("/:taskId/comments", getTaskComments);
router.post("/:taskId/comments", addTaskComment);
router.delete("/:taskId/comments/:commentId", deleteTaskComment);

export default router;
