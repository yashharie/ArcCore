// Member 4 — Types for Attempts, Results, Leaderboard

export interface AttemptWithDetails {
  id: string;
  userId: string;
  quizId: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT";
  score: number;
  totalMarks: number;
  startedAt: Date;
  submittedAt: Date | null;
  timeTaken: number | null;
  quiz: {
    id: string;
    title: string;
    description: string | null;
    timeLimitMinutes: number | null;
  };
  attemptAnswers: AttemptAnswerWithQuestion[];
}

export interface AttemptAnswerWithQuestion {
  id: string;
  attemptId: string;
  questionId: string;
  submittedAnswer: unknown;
  isCorrect: boolean;
  marksAwarded: number;
  question: {
    id: string;
    text: string;
    type: string;
    options: unknown;
    correctAnswer: unknown;
    marks: number;
    explanation: string | null;
    order: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalScore: number;
  quizzesTaken: number;
}

export interface ProgressStats {
  userId: string;
  totalAttempts: number;
  totalScore: number;
  averageScore: number; // percentage
  quizzesCompleted: number;
  topicsViewed: number;
  recentAttempts: AttemptSummary[];
}

export interface AttemptSummary {
  id: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: Date | null;
}

export interface SubmitAttemptPayload {
  answers: {
    questionId: string;
    submittedAnswer: unknown;
  }[];
}

export interface StartAttemptPayload {
  quizId: string;
}
