import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  description: z.string().max(200).optional(),
  academicYear: z.string().optional(),
  semester: z.string().optional(),
  department: z.string().optional(),
  privacy: z.enum(["public", "private"]).default("private"),
  theme: z.string().default("indigo"),
  icon: z.string().default("folder"),
});

export const joinWorkspaceSchema = z.object({
  inviteCode: z.string().min(6, "Invalid invite code"),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();
