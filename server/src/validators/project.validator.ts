import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  description: z.string().max(500).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["planning", "active", "review", "completed", "archived"]).default("planning"),
  dueDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  tags: z.array(z.string()).default([]),
  members: z.array(z.string()).default([]), // array of user ObjectIds
  labels: z.array(z.object({
    name: z.string(),
    color: z.string().default("#6366f1")
  })).default([]),
  milestones: z.array(z.object({
    name: z.string(),
    dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    isCompleted: z.boolean().default(false)
  })).default([]),
  isTemplate: z.boolean().default(false),
  coverImage: z.string().optional()
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  progress: z.number().min(0).max(100).optional(),
});
