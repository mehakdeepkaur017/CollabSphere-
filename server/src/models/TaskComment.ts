import mongoose, { Schema, Document } from "mongoose";

export interface ITaskComment extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  mentions: mongoose.Types.ObjectId[];
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskCommentSchema = new Schema<ITaskComment>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "ProjectTask", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TaskCommentSchema.index({ taskId: 1, createdAt: 1 });

export const TaskComment = mongoose.model<ITaskComment>("TaskComment", TaskCommentSchema);
