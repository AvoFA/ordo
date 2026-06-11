import { z } from "zod";

export const createLearningPathSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120, "Title is too long."),
  description: z.string().trim().max(500, "Description is too long.").optional(),
});

export type CreateLearningPathInput = z.infer<typeof createLearningPathSchema>;
