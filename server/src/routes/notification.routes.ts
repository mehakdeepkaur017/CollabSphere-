import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  getSettings,
  updateSettings
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);
router.patch("/mark-all-read", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.patch("/:id/archive", archiveNotification);
router.delete("/:id", deleteNotification);

router.get("/settings", getSettings);
router.patch("/settings", updateSettings);

export default router;
