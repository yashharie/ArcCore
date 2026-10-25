# Quiz Module (Member 3)

Quiz creation, question management, publishing and quiz-taking.

## Features

- Create quizzes (title, description, time limit, deadline) as **DRAFT**
- Add / delete questions (UI: MCQ and True/False; API supports all 5 types)
- Publish a quiz (validated: at least 1 valid question)
- Quiz list with Edit / Take buttons
- Quiz-taking page with countdown timer and auto-submit
- Server-side permission checks (owner / ADMIN only)
- Correct answers are **never** sent to the browser while taking a quiz

## Database models (prisma/schema.prisma)

| Model | Purpose |
|---|---|
| `Quiz` | Title, status (DRAFT / PUBLISHED / ARCHIVED), time limit, deadline |
| `Question` | Type, text, options (JSON), correctAnswer (JSON), marks, order |
| `QuizAssignment` | Who can take a quiz (`assignedToAll` or specific `userId`) |

Question types: `MCQ`, `TRUE_FALSE`, `DROPDOWN`, `FILL_BLANK`, `MATCHING`.
Answer JSON formats are documented in `docs/quiz-answer-format.md`.

## Setup

1. `npm install`
2. Create `.env` from `.env.example`:
   - `DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/arccore"`
   - `SESSION_SECRET` (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`)
3. `npx prisma migrate dev` (creates tables)
4. `npx prisma generate`
5. `npm run dev` and open http://localhost:3000

## API

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/quizzes` | List quizzes | Logged in (members see own + published) |
| POST | `/api/quizzes` | Create DRAFT quiz | Logged in |
| GET | `/api/quizzes/[id]` | Quiz with answers (for editing) | Owner / ADMIN |
| PATCH | `/api/quizzes/[id]` | Edit quiz (DRAFT only) | Owner / ADMIN |
| DELETE | `/api/quizzes/[id]` | Delete quiz | Owner / ADMIN |
| POST | `/api/quizzes/[id]/questions` | Add question | Owner / ADMIN |
| PATCH / DELETE | `/api/quizzes/[id]/questions/[questionId]` | Edit / delete question | Owner / ADMIN |
| POST | `/api/quizzes/[id]/publish` | Publish quiz | Owner / ADMIN |
| GET | `/api/quizzes/[id]/take` | Quiz for taking (no answers) | Assigned users |

The take endpoint also enforces `startsAt` and `deadline` on the server.

## Pages

| Route | Description |
|---|---|
| `/quizzes` | Quiz list |
| `/quizzes/new` | Create quiz |
| `/quizzes/[id]/edit` | Add questions, publish |
| `/quizzes/[id]/take` | Take quiz with timer |

## Validation

Zod schemas in `src/lib/validation/quiz.ts` (all 5 question types).
Rules include: min 2 options for MCQ/Dropdown, correct answer must be one of the options,
number of `___` blanks must match answers, marks greater than 0.

## Known limitations / TODO

- [ ] Dropdown, Fill-in-the-blank and Matching UI (API already supports them)
- [ ] Connect `submit()` in the take page to Member 4's `POST /api/attempts`
- [ ] Edit existing question in the UI (API `PATCH` exists)
- [ ] Tests (vitest) for validation and permissions
- [ ] Question reordering

## Manual test checklist

1. Create quiz, add MCQ and True/False questions
2. Empty question text shows an error
3. Publish, then the quiz shows PUBLISHED with a Take button
4. Timer counts down and auto-submits at 00:00
5. Network tab: `/take` response has no `correctAnswer`
6. Another member cannot edit or delete your quiz (403)