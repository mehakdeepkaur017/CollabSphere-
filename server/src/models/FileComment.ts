import mongoose, { Document, Schema } from "mongoose";

export interface IFileComment extends Document {
  fileId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  mentions: mongoose.Types.ObjectId[];
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fileCommentSchema = new Schema<IFileComment>(
  {
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

fileCommentSchema.index({ fileId: 1, createdAt: 1 });

export const FileComment = mongoose.model<IFileComment>("FileComment", fileCommentSchema);
