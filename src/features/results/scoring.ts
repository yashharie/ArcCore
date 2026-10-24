// Member 4 — Server-side scoring logic
// All scoring is calculated on the server, never trusting client-submitted scores.

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "DROPDOWN"
  | "FILL_IN_THE_BLANK"
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
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE":
    case "DROPDOWN": {
      // correctAnswer and submittedAnswer are both strings (option id or value)
      isCorrect =
        String(correctAnswer).trim().toLowerCase() ===
        String(submittedAnswer).trim().toLowerCase();
      break;
    }

    case "FILL_IN_THE_BLANK": {
      // Case-insensitive, trimmed string comparison
      isCorrect =
        String(correctAnswer).trim().toLowerCase() ===
        String(submittedAnswer).trim().toLowerCase();
      break;
    }

    case "MATCHING": {
      // correctAnswer and submittedAnswer are both objects: { [leftItem]: rightItem }
      const correct = correctAnswer as Record<string, string>;
      const submitted = submittedAnswer as Record<string, string>;

      if (
        typeof correct !== "object" ||
        correct === null ||
        typeof submitted !== "object" ||
        submitted === null
      ) {
        isCorrect = false;
        break;
      }

      const correctKeys = Object.keys(correct);
      // All pairs must match
      isCorrect =
        correctKeys.length === Object.keys(submitted).length &&
        correctKeys.every(
          (key) =>
            submitted[key] !== undefined &&
            String(correct[key]).trim().toLowerCase() ===
              String(submitted[key]).trim().toLowerCase()
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
