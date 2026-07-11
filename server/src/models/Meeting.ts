import mongoose, { Schema, Document } from "mongoose";

export interface IMeeting extends Document {
  title: string;
  description?: string;
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  timezone: string;
  recurring: "none" | "daily" | "weekly" | "monthly";
  color: string;
  participants: mongoose.Types.ObjectId[];
  agenda?: string;
  notes?: string;
  waitingRoom: boolean;
  password?: string;
  jitsiRoomName: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  chatChannelId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timezone: { type: String, required: true, default: "UTC" },
    recurring: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
    color: { type: String, default: "#6366f1" },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    agenda: { type: String },
    notes: { type: String },
    waitingRoom: { type: Boolean, default: false },
    password: { type: String },
    jitsiRoomName: { type: String, required: true, unique: true },
    status: { type: String, enum: ["scheduled", "live", "completed", "cancelled"], default: "scheduled" },
    chatChannelId: { type: Schema.Types.ObjectId, ref: "Channel" },
  },
  { timestamps: true }
);

MeetingSchema.index({ workspaceId: 1, date: -1 });
MeetingSchema.index({ projectId: 1 });
MeetingSchema.index({ participants: 1 });
MeetingSchema.index({ status: 1 });

export const Meeting = mongoose.model<IMeeting>("Meeting", MeetingSchema);
