import { z } from "zod";

export const createPracticeTaskSchema = z.object({
  topicId: z.string().min(1, "Choose a topic."),
  title: z.string().trim().min(1, "Title is required.").max(120, "Title is too long."),
  description: z
    .string()
    .trim()
    .max(800, "Description must stay under 800 characters.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  difficulty: z.enum(["Foundation", "Intermediate", "Applied"]),
  estimatedMinutes: z.coerce
    .number()
    .int()
    .min(1, "Estimated time must be at least 1 minute.")
    .max(600, "Estimated time must stay under 600 minutes.")
    .optional(),
});

export const updatePracticeTaskStatusSchema = z.object({
  taskId: z.string().min(1, "Practice task is required."),
  status: z.enum(["not-started", "in-progress", "completed"]),
});

export const recordPracticeAttemptSchema = z.object({
  taskId: z.string().min(1, "Practice task is required."),
  result: z.enum(["success", "partial", "failed"]),
  reflection: z
    .string()
    .trim()
    .max(600, "Reflection must stay under 600 characters.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export type CreatePracticeTaskInput = z.infer<typeof createPracticeTaskSchema>;
export type UpdatePracticeTaskStatusInput = z.infer<typeof updatePracticeTaskStatusSchema>;
export type RecordPracticeAttemptInput = z.infer<typeof recordPracticeAttemptSchema>;
