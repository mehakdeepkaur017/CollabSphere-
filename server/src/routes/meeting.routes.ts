import { Router } from "express";
import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  changeMeetingStatus,
  updateMeetingNotes,
} from "../controllers/meetingController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getMeetings);
router.get("/:id", getMeetingById);
router.post("/", createMeeting);
router.put("/:id", updateMeeting);
router.delete("/:id", deleteMeeting);
router.patch("/:id/status", changeMeetingStatus);
router.patch("/:id/notes", updateMeetingNotes);

export default router;
