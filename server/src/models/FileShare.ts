import mongoose, { Document, Schema } from "mongoose";

export interface IFileShare extends Document {
  fileId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  token: string;
  role: "viewer" | "editor";
  expiresAt?: Date;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fileShareSchema = new Schema<IFileShare>(
  {
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
    expiresAt: { type: Date },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

fileShareSchema.index({ token: 1 });
fileShareSchema.index({ fileId: 1 });

export const FileShare = mongoose.model<IFileShare>("FileShare", fileShareSchema);
