// ArcCore — Exam validation schemas

import { z } from "zod";

export const examSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  description: z.string().trim().max(1000).optional(),
  scheduledAt: z.coerce.date({ error: "scheduledAt is required" }),
  duration: z
    .number()
    .int()
    .positive("Duration must be a positive number of minutes"),
});

export const updateExamSchema = examSchema.partial().extend({
  status: z
    .enum(["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"])
    .optional(),
});

export type ExamInput = z.infer<typeof examSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
