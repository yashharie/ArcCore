// Member 4 — Server-side scoring logic
// All scoring is calculated on the server, never trusting client-submitted scores.

export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "DROPDOWN"
  | "FILL_BLANK"
  | "MATCHING";

/**
 * Evaluates a single submitted answer against the correct answer.
 * Returns { isCorrect, marksAwarded }.
 */
export function evaluateAnswer(
  questionType: QuestionType,
  correctAnswer: unknown,
  submittedAnswer: unknown,
  marks: number
): { isCorrect: boolean; marksAwarded: number } {
  let isCorrect = false;

  switch (questionType) {
    case "MCQ":
    case "TRUE_FALSE":
    case "DROPDOWN": {
      // correctAnswer: { optionId } or { value: boolean }
      // submittedAnswer: same shape
      const ca = correctAnswer as Record<string, unknown>;
      const sa = submittedAnswer as Record<string, unknown>;
      if (ca?.optionId !== undefined) {
        isCorrect =
          String(ca.optionId).trim().toLowerCase() ===
          String(sa?.optionId ?? "").trim().toLowerCase();
      } else if (ca?.value !== undefined) {
        isCorrect = Boolean(ca.value) === Boolean(sa?.value);
      }
      break;
    }

    case "FILL_BLANK": {
      // correctAnswer: { blanks: string[][] } — each blank has a list of accepted answers
      // submittedAnswer: { blanks: string[] } — one answer per blank
      const ca = correctAnswer as { blanks: string[][] };
      const sa = submittedAnswer as { blanks: string[] };
      if (!ca?.blanks || !sa?.blanks) {
        isCorrect = false;
        break;
      }
      isCorrect =
        ca.blanks.length === sa.blanks.length &&
        ca.blanks.every((accepted, i) =>
          accepted.some(
            (a) =>
              a.trim().toLowerCase() ===
              String(sa.blanks[i] ?? "").trim().toLowerCase()
          )
        );
      break;
    }

    case "MATCHING": {
      // correctAnswer: { pairs: { left: string; right: string }[] }
      // submittedAnswer: same shape
      const ca = correctAnswer as { pairs: { left: string; right: string }[] };
      const sa = submittedAnswer as { pairs: { left: string; right: string }[] };
      if (!ca?.pairs || !sa?.pairs) {
        isCorrect = false;
        break;
      }
      const correctMap = new Map(ca.pairs.map((p) => [p.left, p.right]));
      const submittedMap = new Map(sa.pairs.map((p) => [p.left, p.right]));
      isCorrect =
        correctMap.size === submittedMap.size &&
        [...correctMap.entries()].every(
          ([left, right]) =>
            String(submittedMap.get(left) ?? "").trim().toLowerCase() ===
            String(right).trim().toLowerCase()
        );
      break;
    }

    default:
      isCorrect = false;
  }

  return {
    isCorrect,
    marksAwarded: isCorrect ? marks : 0,
  };
}

/**
 * Calculates the total score from an array of evaluated answers.
 */
export function calculateTotalScore(
  answers: { marksAwarded: number }[]
): number {
  return answers.reduce((sum, a) => sum + a.marksAwarded, 0);
}
