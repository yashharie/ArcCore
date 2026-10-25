// ArcCore — Quiz validation (Member 3)

import { z } from "zod";

// ---------- Shared pieces ----------
const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1, "Option text cannot be empty"),
});

const baseQuestion = {
  text: z.string().trim().min(1, "Question text is required"),
  marks: z.number().int().positive("Marks must be greater than 0").default(1),
  explanation: z.string().trim().optional(),
  order: z.number().int().positive(),
};

// ---------- 1. MCQ ----------
const mcqSchema = z
  .object({
    ...baseQuestion,
    type: z.literal("MCQ"),
    options: z.array(optionSchema).min(2, "At least 2 options required"),
    correctAnswer: z.object({ optionId: z.string().min(1) }),
  })
  .refine(
    (q) => q.options.some((o) => o.id === q.correctAnswer.optionId),
    { message: "Correct answer must be one of the options", path: ["correctAnswer"] }
  );

// ---------- 2. TRUE_FALSE ----------
const trueFalseSchema = z.object({
  ...baseQuestion,
  type: z.literal("TRUE_FALSE"),
  options: z.null().optional(),
  correctAnswer: z.object({ value: z.boolean() }),
});

// ---------- 3. DROPDOWN ----------
const dropdownSchema = z
  .object({
    ...baseQuestion,
    type: z.literal("DROPDOWN"),
    options: z.array(optionSchema).min(2, "At least 2 options required"),
    correctAnswer: z.object({ optionId: z.string().min(1) }),
  })
  .refine(
    (q) => q.options.some((o) => o.id === q.correctAnswer.optionId),
    { message: "Correct answer must be one of the options", path: ["correctAnswer"] }
  );

// ---------- 4. FILL_BLANK ----------
const fillBlankSchema = z
  .object({
    ...baseQuestion,
    type: z.literal("FILL_BLANK"),
    options: z.object({ caseSensitive: z.boolean().default(false) }),
    correctAnswer: z.object({
      blanks: z
        .array(z.array(z.string().trim().min(1)).min(1))
        .min(1, "At least 1 blank required"),
    }),
  })
  .refine(
    (q) => (q.text.match(/___/g) ?? []).length === q.correctAnswer.blanks.length,
    { message: "Number of ___ in text must match the number of blanks", path: ["text"] }
  );

// ---------- 5. MATCHING ----------
const matchingSchema = z
  .object({
    ...baseQuestion,
    type: z.literal("MATCHING"),
    options: z.object({
      left: z.array(optionSchema).min(2),
      right: z.array(optionSchema).min(2),
    }),
    correctAnswer: z.object({
      pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(2),
    }),
  })
  .refine(
    (q) => {
      const leftIds = new Set(q.options.left.map((o) => o.id));
      const rightIds = new Set(q.options.right.map((o) => o.id));
      return q.correctAnswer.pairs.every(
        (p) => leftIds.has(p.left) && rightIds.has(p.right)
      );
    },
    { message: "Every pair must use valid left/right ids", path: ["correctAnswer"] }
  );

// ---------- Any question ----------
export const questionSchema = z.discriminatedUnion("type", [
  mcqSchema,
  trueFalseSchema,
  dropdownSchema,
  fillBlankSchema,
  matchingSchema,
]);

// ---------- Quiz ----------
export const quizSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  description: z.string().trim().max(1000).optional(),
  topicId: z.string().optional(),
  timeLimitMinutes: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
});

// Used when publishing: quiz must have at least 1 valid question
export const publishCheckSchema = z.object({
  questions: z.array(questionSchema).min(1, "Add at least 1 question before publishing"),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
