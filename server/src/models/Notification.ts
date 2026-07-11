import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationModule {
  WORKSPACE = 'Workspace',
  PROJECT = 'Project',
  TASK = 'Task',
  FILE = 'File',
  CHAT = 'Chat',
  KNOWLEDGE = 'Knowledge',
  PLANNER = 'Planner',
  SYSTEM = 'System'
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  actor?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    avatar?: string;
  };
  workspace?: mongoose.Types.ObjectId;
  module: NotificationModule;
  type: string;
  title: string;
  message: string;
  entityId?: mongoose.Types.ObjectId;
  entityType?: string;
  priority: NotificationPriority;
  read: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor: {
      _id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      avatar: { type: String }
    },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', index: true },
    module: { type: String, enum: Object.values(NotificationModule), required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String },
    priority: { type: String, enum: Object.values(NotificationPriority), default: NotificationPriority.NORMAL },
    read: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Optimize query for fetching unread notifications or recent notifications
notificationSchema.index({ recipient: 1, archived: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
