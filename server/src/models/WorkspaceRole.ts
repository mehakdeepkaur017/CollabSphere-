import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceRole extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  isSystem: boolean; // built-in roles like owner, admin cannot be deleted
  permissions: {
    canCreateProjects: boolean;
    canDeleteProjects: boolean;
    canManageFiles: boolean;
    canInviteMembers: boolean;
    canRemoveMembers: boolean;
    canCreateWhiteboards: boolean;
    canManageRoles: boolean;
    canManageWorkspaceSettings: boolean;
  };
}

const WorkspaceRoleSchema = new Schema<IWorkspaceRole>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    isSystem: { type: Boolean, default: false },
    permissions: {
      canCreateProjects: { type: Boolean, default: false },
      canDeleteProjects: { type: Boolean, default: false },
      canManageFiles: { type: Boolean, default: false },
      canInviteMembers: { type: Boolean, default: false },
      canRemoveMembers: { type: Boolean, default: false },
      canCreateWhiteboards: { type: Boolean, default: false },
      canManageRoles: { type: Boolean, default: false },
      canManageWorkspaceSettings: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

WorkspaceRoleSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

export const WorkspaceRole = mongoose.model<IWorkspaceRole>("WorkspaceRole", WorkspaceRoleSchema);
