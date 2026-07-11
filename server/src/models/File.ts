import mongoose, { Document, Schema } from "mongoose";

export interface IFile extends Document {
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  url: string;
  workspaceId?: mongoose.Types.ObjectId;
  folderId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  isPinned: boolean;
  isStarred: boolean;
  deletedAt?: Date;
  versions: {
    url: string;
    size: number;
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    extension: { type: String },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: false },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    taskId: { type: Schema.Types.ObjectId, ref: "ProjectTask" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPinned: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    deletedAt: { type: Date },
    versions: [
      {
        url: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

fileSchema.index({ workspaceId: 1, folderId: 1 });
fileSchema.index({ workspaceId: 1, isStarred: 1 });
fileSchema.index({ projectId: 1 });
fileSchema.index({ name: "text" });

export const File = mongoose.model<IFile>("File", fileSchema);
