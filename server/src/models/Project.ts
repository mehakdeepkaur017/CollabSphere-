import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  progress: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "planning" | "active" | "review" | "completed" | "archived";
  dueDate?: Date;
  tags: string[];
  members: mongoose.Types.ObjectId[];
  labels: { _id: mongoose.Types.ObjectId; name: string; color: string }[];
  milestones: { _id: mongoose.Types.ObjectId; name: string; dueDate?: Date; isCompleted: boolean }[];
  isTemplate?: boolean;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["planning", "active", "review", "completed", "archived"], default: "planning" },
    dueDate: { type: Date },
    tags: [{ type: String, trim: true }],
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    labels: [
      {
        name: { type: String, required: true },
        color: { type: String, default: "#6366f1" },
      }
    ],
    milestones: [
      {
        name: { type: String, required: true },
        dueDate: { type: Date },
        isCompleted: { type: Boolean, default: false }
      }
    ],
    isTemplate: { type: Boolean, default: false },
    coverImage: { type: String },
  },
  { timestamps: true }
);

// Indexes
ProjectSchema.index({ workspaceId: 1 });
ProjectSchema.index({ status: 1 });

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
