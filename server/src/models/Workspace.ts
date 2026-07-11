import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceMember {
  user: mongoose.Types.ObjectId;
  role: string;
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  academicYear?: string;
  semester?: string;
  department?: string;
  privacy: "public" | "private";
  theme: string;
  icon: string;
  banner?: string;
  accentColor?: string;
  timezone?: string;
  language?: string;
  inviteCode: string;
  inviteLinks?: {
    token: string;
    role: string;
    expiresAt: Date;
    createdBy: mongoose.Types.ObjectId;
  }[];
  owner: mongoose.Types.ObjectId;
  members: IWorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, default: "member" }, // Relaxed enum for custom roles
  joinedAt: { type: Date, default: Date.now },
});

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    semester: { type: String, trim: true },
    department: { type: String, trim: true },
    privacy: { type: String, enum: ["public", "private"], default: "private" },
    theme: { type: String, default: "indigo" },
    icon: { type: String, default: "folder" },
    banner: { type: String },
    accentColor: { type: String, default: "#6366f1" },
    timezone: { type: String, default: "UTC" },
    language: { type: String, default: "en" },
    inviteCode: { type: String, required: true, unique: true },
    inviteLinks: [
      {
        token: { type: String, required: true },
        role: { type: String, default: "member" },
        expiresAt: { type: Date, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [WorkspaceMemberSchema],
  },
  { timestamps: true }
);

// Indexes for faster lookups
WorkspaceSchema.index({ inviteCode: 1 });
WorkspaceSchema.index({ "members.user": 1 });

export const Workspace = mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);
