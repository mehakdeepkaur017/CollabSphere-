import { Router } from "express";
import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} from "../controllers/channel.controller";
import {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  toggleReaction,
} from "../controllers/message.controller";
import { authenticate } from "../middleware/auth";

const router = Router({ mergeParams: true });

router.use(authenticate);

// Channel CRUD
router.get("/", getChannels);
router.post("/", createChannel);
router.patch("/:channelId", updateChannel);
router.delete("/:channelId", deleteChannel);

// Messages under a channel
router.get("/:channelId/messages", getMessages);
router.post("/:channelId/messages", sendMessage);
router.patch("/:channelId/messages/:messageId", updateMessage);
router.delete("/:channelId/messages/:messageId", deleteMessage);
router.post("/:channelId/messages/:messageId/reactions", toggleReaction);

export default router;
