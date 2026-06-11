import { z } from "zod";

export const resourceTypeSchema = z.enum([
  "ARTICLE",
  "VIDEO",
  "BOOK",
  "WEBSITE",
  "PDF",
  "DOCX",
  "PPTX",
  "IMAGE",
]);
export const resourceSourceSchema = z.enum(["URL", "MANUAL", "FILE"]);

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

const resourcePayloadSchema = z.object({
    topicId: z.string().min(1, "Topic is required."),
    title: z.string().trim().min(1, "Title is required.").max(140, "Title is too long."),
    source: resourceSourceSchema.default("URL"),
    type: resourceTypeSchema.default("WEBSITE"),
    url: z
      .string()
      .trim()
      .url("Enter a valid resource URL.")
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
    content: optionalText(2000),
    description: optionalText(500),
  });

function validateResourceSource(
  value: { source: "URL" | "MANUAL" | "FILE"; url?: string; content?: string },
  context: z.RefinementCtx,
) {
    if (value.source === "URL" && !value.url) {
      context.addIssue({
        code: "custom",
        path: ["url"],
        message: "URL is required for link resources.",
      });
    }

    if (value.source === "MANUAL" && !value.content) {
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: "Content is required for manual resources.",
      });
    }
}

export const createResourceSchema = resourcePayloadSchema.superRefine(validateResourceSource);

export const updateResourceSchema = resourcePayloadSchema
  .omit({
    topicId: true,
  })
  .extend({
    resourceId: z.string().min(1, "Resource is required."),
  })
  .superRefine(validateResourceSource);

export const deleteResourceSchema = z.object({
  resourceId: z.string().min(1, "Resource is required."),
});

export const createFileResourceSchema = z.object({
  topicId: z.string().min(1, "Topic is required."),
  title: z.string().trim().min(1, "Title is required.").max(140, "Title is too long."),
  description: optionalText(500),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type DeleteResourceInput = z.infer<typeof deleteResourceSchema>;
export type CreateFileResourceInput = z.infer<typeof createFileResourceSchema>;
