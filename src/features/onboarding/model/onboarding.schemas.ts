import { z } from "zod";

export const onboardingSchema = z.object({
  pathTitle: z
    .string()
    .trim()
    .min(1, "Learning path title is required.")
    .max(120, "Learning path title is too long."),
  pathDescription: z.string().trim().max(500, "Learning path description is too long.").optional(),
  topicTitle: z
    .string()
    .trim()
    .min(1, "First topic is required.")
    .max(120, "First topic title is too long."),
  topicNextStep: z.string().trim().max(500, "Next step is too long.").optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
