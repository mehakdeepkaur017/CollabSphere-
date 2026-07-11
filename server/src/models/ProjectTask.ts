import mongoose, { Schema, Document } from "mongoose";

export interface IProjectTask extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  labels: mongoose.Types.ObjectId[]; // refs to Project.labels
  dueDate?: Date;
  order: number; // for drag and drop
  estimatedTime?: number;
  timeSpent?: number;
  progress?: number;
  subtasks: { _id?: mongoose.Types.ObjectId; title: string; isCompleted: boolean; order: number }[];
  checklists: {
    _id?: mongoose.Types.ObjectId;
    title: string;
    items: { _id?: mongoose.Types.ObjectId; content: string; isCompleted: boolean }[];
  }[];
  attachments: mongoose.Types.ObjectId[]; // refs to File
  dependencies: mongoose.Types.ObjectId[]; // refs to other ProjectTask
  milestone?: mongoose.Types.ObjectId; // ref to Project.milestones
  createdAt: Date;
  updatedAt: Date;
}

const ProjectTaskSchema = new Schema<IProjectTask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "completed", "blocked"],
      default: "todo",
    },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    labels: [{ type: Schema.Types.ObjectId }],
    dueDate: { type: Date },
    order: { type: Number, default: 0 },
    estimatedTime: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    subtasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
      },
    ],
    checklists: [
      {
        title: { type: String, required: true },
        items: [
          {
            content: { type: String, required: true },
            isCompleted: { type: Boolean, default: false },
          },
        ],
      },
    ],
    attachments: [{ type: Schema.Types.ObjectId, ref: "File" }],
    dependencies: [{ type: Schema.Types.ObjectId, ref: "ProjectTask" }],
    milestone: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

ProjectTaskSchema.index({ projectId: 1, status: 1 });
ProjectTaskSchema.index({ assignee: 1 });

export const ProjectTask = mongoose.model<IProjectTask>("ProjectTask", ProjectTaskSchema);
