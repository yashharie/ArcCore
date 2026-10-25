# ArcCore ⚡

### Learn. Challenge. Evolve.

ArcCore is a collaborative learning and quiz platform designed to help a group of learners share knowledge, create quizzes, test their understanding, and track their progress together.

The platform combines topic presentations, interactive quizzes, automatic scoring, performance analytics, and competitive leaderboards in one place.

## 🎯 Project Objectives

- Encourage collaborative learning through topic presentations.
- Allow members to create quizzes based on what they learn.
- Enable Admins to create quizzes and exams for the group.
- Provide automatic scoring and detailed answer reviews.
- Track individual learning progress and quiz performance.
- Motivate members through leaderboards and achievements.
- Provide a centralized platform for managing learning activities.

## ✨ Features

### 👤 Member Features

- Secure registration and login.
- Personalized member dashboard.
- Create and share learning topics.
- View topics presented by other members.
- Create quizzes based on learning materials.
- Take quizzes assigned to them or made available to the group.
- View scores and correct or incorrect answers.
- Review previous quiz attempts.
- Track learning progress and performance.
- View leaderboards and compare results with other members.

### 🛡️ Admin Features

- Manage user accounts and member access.
- Create, manage, and publish group-wide quizzes.
- Create and schedule group exams.
- Assign assessments to selected members or the entire group.
- Configure quiz deadlines, time limits, and marks.
- Monitor quiz attempts and examination results.
- View member performance and overall learning progress.
- Access leaderboards and platform-wide analytics.

### 📝 Quiz System

ArcCore is planned to support the following question types:

- Multiple-choice questions
- True or false questions
- Dropdown selection questions
- Fill-in-the-blank questions
- Matching questions

Additional quiz capabilities include automatic scoring, configurable marks, deadlines, time limits, answer reviews, and attempt history.

## 🧰 Technology Stack

| Technology     | Purpose                           |
| -------------- | --------------------------------- |
| Next.js        | Application framework             |
| TypeScript     | Type-safe development             |
| React          | User interface                    |
| Tailwind CSS   | Styling and responsive layouts    |
| PostgreSQL     | Relational database               |
| Git and GitHub | Version control and collaboration |

The exact database access library, authentication solution, and deployment provider will be finalized during development.

## 🏗️ Project Structure

The planned project structure is:

```text
ArcCore/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   ├── topics/
│   │   ├── quizzes/
│   │   ├── results/
│   │   ├── leaderboard/
│   │   └── api/
│   ├── components/
│   ├── features/
│   │   ├── users/
│   │   ├── topics/
│   │   ├── quizzes/
│   │   ├── results/
│   │   ├── leaderboard/
│   │   └── exams/
│   └── lib/
│       ├── auth/
│       ├── db/
│       └── validation/
├── prisma/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

This structure is a starting plan and may evolve as the project develops.

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- Node.js (LTS version recommended)
- npm
- Git
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/ArcCore.git
cd ArcCore
```

Replace `YOUR-USERNAME` with the GitHub account or organization that owns the repository.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and configure the required environment variables.

Example:

```env
DATABASE_URL="your_postgresql_connection_string"
```

Add other required variables when the authentication and database configuration are implemented.

**Important:** Never commit `.env` files, database passwords, API keys, or other secrets to GitHub.

### 4. Configure the Database

Create a PostgreSQL database for ArcCore and configure its connection string.

Run the project's database migration commands once the database library and migration setup have been established.

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

ArcCore is developed collaboratively. Contributors should follow the shared coding standards and development workflow.

### Contribution Workflow

1. Clone the repository.
2. Create a new branch for your feature or bug fix.
3. Implement and test your changes.
4. Commit your changes with a meaningful commit message.
5. Push your branch to GitHub.
6. Open a Pull Request for review.
7. Merge changes into `main` after approval and required checks.

### Branch Naming

Examples:

```text
feature/authentication
feature/topic-management
feature/quiz-builder
feature/leaderboard
feature/group-exams
fix/quiz-scoring
docs/update-readme
```

### Commit Message Examples

```text
feat: add quiz creation
feat: implement topic management
fix: correct quiz scoring
docs: update project README
refactor: improve dashboard components
```

### Collaboration Guidelines

- Keep features separated into logical modules.
- Follow the agreed database schema and API contracts.
- Avoid committing directly to `main`.
- Review Pull Requests before merging.
- Test changes before submitting them.
- Do not commit secrets or personal credentials.
- Update documentation when project behavior changes.

## 🔐 Security

Security is an important part of ArcCore.

- Authenticate users before granting access to protected features.
- Enforce Admin and Member permissions on the server.
- Validate submitted data on the server.
- Calculate quiz scores on the server rather than trusting client-submitted scores.
- Store passwords using secure password hashing when password-based authentication is implemented.
- Protect sensitive configuration using environment variables.
- Prevent users from accessing unauthorized quiz attempts or results.

## 📌 Project Status

**Status:** In Development

ArcCore is being developed incrementally. Features described in this README represent the intended functionality and may not all be implemented yet.

## 🛣️ Planned Development Milestones

- [ ] Initialize the Next.js and TypeScript project.
- [ ] Establish the PostgreSQL schema and migrations.
- [ ] Implement authentication and role-based access.
- [ ] Develop member and Admin dashboards.
- [ ] Implement topic and learning-material management.
- [ ] Develop the quiz builder and supported question types.
- [ ] Implement quiz attempts, scoring, and answer review.
- [ ] Build leaderboards and progress tracking.
- [ ] Implement group exams and scheduling.
- [ ] Add automated tests and security checks.
- [ ] Deploy the application.

---

**ArcCore — Learn. Challenge. Evolve.** ⚡
