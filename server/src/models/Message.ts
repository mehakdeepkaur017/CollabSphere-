import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  channelId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: "text" | "file" | "system";
  fileDetails?: {
    url: string;
    name: string;
    size: number;
    mimeType: string;
  };
  reactions: { emoji: string; users: mongoose.Types.ObjectId[] }[];
  mentions: mongoose.Types.ObjectId[];
  threadId?: mongoose.Types.ObjectId; // If it's a reply to another message
  isPinned: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    type: { type: String, enum: ["text", "file", "system"], default: "text" },
    fileDetails: {
      url: String,
      name: String,
      size: Number,
      mimeType: String,
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    threadId: { type: Schema.Types.ObjectId, ref: "Message" },
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ channelId: 1, createdAt: -1 });
MessageSchema.index({ threadId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
