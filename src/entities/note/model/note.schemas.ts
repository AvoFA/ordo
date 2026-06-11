import { z } from "zod";

export const createNoteSchema = z.object({
  topicId: z.string().min(1, "Choose a topic."),
  title: z
    .string()
    .trim()
    .max(120, "Title must stay under 120 characters.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  content: z
    .string()
    .trim()
    .min(1, "Note content is required.")
    .max(4000, "Note content must stay under 4000 characters."),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
