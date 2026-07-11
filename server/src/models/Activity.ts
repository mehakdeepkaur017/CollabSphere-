import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  workspaceId: mongoose.Types.ObjectId;
  user: {
    _id: mongoose.Types.ObjectId;
    name: string;
    avatar?: string;
  };
  action: string;
  resourceId?: mongoose.Types.ObjectId;
  resourceType?: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      avatar: { type: String }
    },
    action: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    resourceType: { type: String },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Index for efficient fetching by workspace
activitySchema.index({ workspaceId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
