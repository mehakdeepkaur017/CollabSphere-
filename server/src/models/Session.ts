import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  device: string;
  os: string;
  browser: string;
  ipAddress: string;
  lastActive: Date;
  expiresAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    device: { type: String, default: "Unknown Device" },
    os: { type: String, default: "Unknown OS" },
    browser: { type: String, default: "Unknown Browser" },
    ipAddress: { type: String, default: "Unknown IP" },
    lastActive: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ user: 1 });

export const Session = mongoose.model<ISession>("Session", SessionSchema);
