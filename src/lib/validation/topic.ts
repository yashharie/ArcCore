// ArcCore — Topic validation schemas

import { z } from "zod";

export const topicSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  description: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1, "Content is required"),
});

export const updateTopicSchema = topicSchema.partial().extend({
  published: z.boolean().optional(),
});

export type TopicInput = z.infer<typeof topicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
