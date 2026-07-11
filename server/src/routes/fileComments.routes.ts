import { Router } from "express";
import { getComments, createComment, updateComment, deleteComment } from "../controllers/fileComment.controller";
import { authenticate } from "../middleware/auth";

const router = Router({ mergeParams: true }); // Allows access to :fileId from parent router if needed

router.get("/:fileId/comments", authenticate, getComments);
router.post("/:fileId/comments", authenticate, createComment);
router.patch("/comments/:id", authenticate, updateComment);
router.delete("/comments/:id", authenticate, deleteComment);

export default router;
