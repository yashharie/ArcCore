import { describe, it, expect } from "vitest";
import {
  questionSchema,
  quizSchema,
  publishCheckSchema,
} from "@/lib/validation/quiz";

const mcq = {
  type: "MCQ",
  text: "Capital of France?",
  marks: 2,
  order: 1,
  options: [
    { id: "a", text: "Paris" },
    { id: "b", text: "London" },
  ],
  correctAnswer: { optionId: "a" },
};

describe("quizSchema", () => {
  it("accepts a valid quiz", () => {
    expect(quizSchema.safeParse({ title: "Quiz 1" }).success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(quizSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("rejects a non-positive time limit", () => {
    expect(
      quizSchema.safeParse({ title: "Q", timeLimitMinutes: 0 }).success
    ).toBe(false);
  });
});

describe("MCQ", () => {
  it("accepts a valid MCQ", () => {
    expect(questionSchema.safeParse(mcq).success).toBe(true);
  });

  it("rejects fewer than 2 options", () => {
    const bad = { ...mcq, options: [{ id: "a", text: "Paris" }] };
    expect(questionSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a correct answer that is not an option", () => {
    const bad = { ...mcq, correctAnswer: { optionId: "z" } };
    expect(questionSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects marks of 0", () => {
    expect(questionSchema.safeParse({ ...mcq, marks: 0 }).success).toBe(false);
  });

  it("rejects empty question text", () => {
    expect(questionSchema.safeParse({ ...mcq, text: "  " }).success).toBe(
      false
    );
  });
});

describe("TRUE_FALSE", () => {
  const tf = {
    type: "TRUE_FALSE",
    text: "The sun is a star.",
    marks: 1,
    order: 1,
    correctAnswer: { value: true },
  };

  it("accepts a valid true/false question", () => {
    expect(questionSchema.safeParse(tf).success).toBe(true);
  });

  it("rejects a non-boolean answer", () => {
    const bad = { ...tf, correctAnswer: { value: "yes" } };
    expect(questionSchema.safeParse(bad).success).toBe(false);
  });
});

describe("FILL_BLANK", () => {
  const fb = {
    type: "FILL_BLANK",
    text: "The capital of France is ___.",
    marks: 1,
    order: 1,
    options: { caseSensitive: false },
    correctAnswer: { blanks: [["Paris", "paris"]] },
  };

  it("accepts a valid fill-in-the-blank", () => {
    expect(questionSchema.safeParse(fb).success).toBe(true);
  });

  it("rejects when blank count does not match answers", () => {
    const bad = { ...fb, text: "No blanks here." };
    expect(questionSchema.safeParse(bad).success).toBe(false);
  });
});

describe("MATCHING", () => {
  const matching = {
    type: "MATCHING",
    text: "Match the pairs",
    marks: 2,
    order: 1,
    options: {
      left: [
        { id: "l1", text: "HTML" },
        { id: "l2", text: "CSS" },
      ],
      right: [
        { id: "r1", text: "Styling" },
        { id: "r2", text: "Structure" },
      ],
    },
    correctAnswer: {
      pairs: [
        { left: "l1", right: "r2" },
        { left: "l2", right: "r1" },
      ],
    },
  };

  it("accepts valid matching", () => {
    expect(questionSchema.safeParse(matching).success).toBe(true);
  });

  it("rejects pairs with unknown ids", () => {
    const bad = {
      ...matching,
      correctAnswer: {
        pairs: [
          { left: "l1", right: "r9" },
          { left: "l2", right: "r1" },
        ],
      },
    };
    expect(questionSchema.safeParse(bad).success).toBe(false);
  });
});

describe("publishCheckSchema", () => {
  it("rejects a quiz with no questions", () => {
    expect(publishCheckSchema.safeParse({ questions: [] }).success).toBe(
      false
    );
  });

  it("accepts a quiz with one valid question", () => {
    expect(publishCheckSchema.safeParse({ questions: [mcq] }).success).toBe(
      true
    );
  });
});