import mongoose, { Schema, Document } from "mongoose";

export interface IWhiteboard extends Document {
  workspaceId: mongoose.Types.ObjectId;
  objects: any[];
  updatedAt: Date;
  createdAt: Date;
}

const WhiteboardSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, unique: true },
    objects: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export const Whiteboard = mongoose.model<IWhiteboard>("Whiteboard", WhiteboardSchema);
