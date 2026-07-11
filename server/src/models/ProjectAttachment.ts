import mongoose, { Schema, Document } from "mongoose";

export interface IProjectAttachment extends Document {
  projectId: mongoose.Types.ObjectId;
  uploader: mongoose.Types.ObjectId;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectAttachmentSchema = new Schema<IProjectAttachment>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

ProjectAttachmentSchema.index({ projectId: 1 });

export const ProjectAttachment = mongoose.model<IProjectAttachment>("ProjectAttachment", ProjectAttachmentSchema);
