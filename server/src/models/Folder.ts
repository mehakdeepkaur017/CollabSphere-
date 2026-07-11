import mongoose, { Document, Schema } from "mongoose";

export interface IFolder extends Document {
  name: string;
  workspaceId?: mongoose.Types.ObjectId;
  parentFolderId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  color?: string;
  isPinned: boolean;
  isStarred: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    parentFolderId: { type: Schema.Types.ObjectId, ref: "Folder" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    color: { type: String, default: "indigo" },
    isPinned: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

folderSchema.index({ workspaceId: 1, parentFolderId: 1 });
folderSchema.index({ workspaceId: 1, name: 1 });

export const Folder = mongoose.model<IFolder>("Folder", folderSchema);
