import { z } from "zod";
import { resourceSourceSchema, resourceTypeSchema } from "@/entities/resource/model/resource.schemas";

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

export const createInboxItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(140, "Title is too long."),
  source: resourceSourceSchema.default("URL"),
  type: resourceTypeSchema.default("WEBSITE"),
  url: z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  description: optionalText(800),
});

export const assignInboxItemSchema = z.object({
  itemId: z.string().min(1, "Inbox item is required."),
  topicId: z.string().min(1, "Topic is required."),
});

export const discardInboxItemSchema = z.object({
  itemId: z.string().min(1, "Inbox item is required."),
});

export type CreateInboxItemInput = z.infer<typeof createInboxItemSchema>;
export type AssignInboxItemInput = z.infer<typeof assignInboxItemSchema>;
export type DiscardInboxItemInput = z.infer<typeof discardInboxItemSchema>;
