import { z } from "zod";

export const startSessionSchema = z.object({
  topicId: z.string().min(1, "Topic is required."),
});

export const finishSessionSchema = z.object({
  sessionId: z.string().min(1, "Session is required."),
  durationMinutes: z.coerce.number().optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type FinishSessionInput = z.infer<typeof finishSessionSchema>;
