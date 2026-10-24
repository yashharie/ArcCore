# ArcCore ⚡ — Learn. Challenge. Evolve.

ArcCore is a collaborative learning and quiz platform for a group of learners to share knowledge, create quizzes, test understanding, and track progress together.

---

## 🧑‍💻 Member 4 — Quiz Attempts, Results & Leaderboard

This branch is owned by **Member 4** and covers:

- Quiz attempt lifecycle (start → in-progress → submitted)
- Server-side automatic scoring (never trusts client-submitted scores)
- Answer review with correct answers and explanations
- Results history (all past attempts)
- Leaderboard ranked by total score
- Personal progress dashboard with stats

---

## 🗂️ Member 4 File Structure

```
src/
├── app/
│   ├── dashboard/page.tsx         ← Member progress dashboard
│   ├── results/
│   │   ├── page.tsx               ← Quiz history list
│   │   └── [attemptId]/page.tsx   ← Answer review page
│   ├── leaderboard/page.tsx       ← Leaderboard
│   └── api/
│       ├── attempts/
│       │   ├── route.ts           ← GET (list) / POST (start attempt)
│       │   └── [attemptId]/
│       │       ├── route.ts       ← GET (single attempt)
│       │       └── submit/route.ts ← POST (submit + score)
│       ├── leaderboard/route.ts   ← GET leaderboard
│       └── progress/route.ts      ← GET user progress stats
├── features/
│   └── results/
│       ├── types.ts               ← TypeScript types
│       └── scoring.ts             ← Server-side scoring logic
└── lib/
    └── db/
        └── prisma.ts              ← Shared Prisma client
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- PostgreSQL database
- npm

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-USERNAME/ArcCore.git
cd ArcCore

# 2. Install dependencies
npm install

# 3. Copy env file and fill in your PostgreSQL connection string
cp .env.example .env

# 4. Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔗 API Endpoints (Member 4)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/attempts?userId=<id>` | List all attempts for a user |
| `POST` | `/api/attempts` | Start a new attempt |
| `GET` | `/api/attempts/[attemptId]?userId=<id>` | Get attempt with answers |
| `POST` | `/api/attempts/[attemptId]/submit` | Submit answers (scores on server) |
| `GET` | `/api/leaderboard` | Get ranked leaderboard |
| `GET` | `/api/progress?userId=<id>` | Get user progress stats |

---

## 🔐 Security Notes

- Scores are **always calculated on the server** — client-submitted scores are never trusted.
- Attempt ownership is verified before returning any data.
- Quiz deadlines and published status are checked before allowing attempts.

---

## 🤝 Integration Points

| What | Who provides it |
|------|----------------|
| `userId` / session | Member 1 (Auth) |
| Quiz data & questions | Member 3 (Quiz Engine) |
| Topic progress tracking | Member 2 (Topics) |
| CS analytics dashboard | Member 5 (Admin) |

Replace `PLACEHOLDER_USER_ID` in page files with Member 1's `getServerSession()` once auth is ready.
