import { z } from "zod";

export const topicStatusSchema = z.enum([
  "not-started",
  "in-progress",
  "completed",
  "review-later",
]);

export const createTopicSchema = z.object({
  pathId: z.string().min(1, "Learning path is required."),
  parentId: z.string().optional(),
  title: z.string().trim().min(1, "Title is required.").max(120, "Title is too long."),
  description: z.string().trim().max(500, "Description is too long.").optional(),
  estimatedMinutes: z.coerce
    .number()
    .int("Estimated time must be a whole number.")
    .min(1, "Estimated time must be at least 1 minute.")
    .max(600, "Estimated time is too long.")
    .optional(),
  nextStep: z.string().trim().max(500, "Next step is too long.").optional(),
});

export const updateTopicStatusSchema = z.object({
  topicId: z.string().min(1, "Topic is required."),
  status: topicStatusSchema,
});

export const completeTopicSchema = z.object({
  topicId: z.string().min(1, "Topic is required."),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicStatusInput = z.infer<typeof updateTopicStatusSchema>;
export type CompleteTopicInput = z.infer<typeof completeTopicSchema>;
