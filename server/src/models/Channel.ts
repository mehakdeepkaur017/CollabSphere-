import mongoose, { Schema, Document } from "mongoose";

export interface IChannel extends Document {
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  icon?: string;
  type: "public" | "private" | "direct" | "project" | "meeting";
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema = new Schema<IChannel>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    type: { type: String, enum: ["public", "private", "direct", "project", "meeting"], default: "public" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }], // Used for private/direct/project, or just anyone who "joined"
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ChannelSchema.index({ workspaceId: 1, type: 1 });
ChannelSchema.index({ projectId: 1 });
ChannelSchema.index({ workspaceId: 1, name: 1 }, { unique: true, partialFilterExpression: { type: { $nin: ["direct", "project"] } } });

export const Channel = mongoose.model<IChannel>("Channel", ChannelSchema);
