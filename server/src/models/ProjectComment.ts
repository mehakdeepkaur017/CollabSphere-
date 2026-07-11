import mongoose, { Schema, Document } from "mongoose";

export interface IProjectComment extends Document {
  projectId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  reactions: { emoji: string; users: mongoose.Types.ObjectId[] }[];
  mentions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectCommentSchema = new Schema<IProjectComment>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    reactions: [
      {
        emoji: { type: String, required: true },
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

ProjectCommentSchema.index({ projectId: 1, createdAt: 1 });

export const ProjectComment = mongoose.model<IProjectComment>("ProjectComment", ProjectCommentSchema);
