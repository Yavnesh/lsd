# ⚡ LSD (Learn Something Daily)

> Become 1% smarter every single day without the boring textbooks.

LSD is a modern Next.js gamified learning application taking mental models, psychological phenomena, and social frameworks and compressing them into engaging, 60-second viral-style lessons. 

## 🚀 Features
- **Micro-Learning Format:** Content is delivered via punchy hooks, relatable memes, polls, and quizzes instead of enormous walls of text.
- **Gamified Engine:** Users earn XP, hit Streaks, and unlock Levels dynamically stored in a local SQLite database using Prisma.
- **Authentication:** Seamless **Google OAuth** login flow built using NextAuth.
- **Dynamic Profiles:** Accounts are immediately populated with unique, automatically generated robotic avatars utilizing the DiceBear API.
- **Theming:** Full responsive implementation of Dark & Light Mode UI natively supporting Tailwind V4 styling parameters.

## 💻 Tech Stack
- [Next.js](https://nextjs.org/) (App Router, Turbopack)
- [Prisma ORM](https://www.prisma.io/)
- SQLite Local Database
- [NextAuth.js](https://next-auth.js.org/)
- [Zustand](https://github.com/pmndrs/zustand) (State Management)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Framer Motion

## 🛠️ Getting Started

### 1. Installation
Clone the repo and download your dependencies:
```bash
npm install
```

### 2. Environment Setup
Rename your `.env.example` (or create a `.env` file) inside the project root and add the following parameters securely:
```env
DATABASE_URL="file:./dev.db"

# Next Auth Secrets
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key"

# Google Credentials setup via Google Cloud Console
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
```

### 3. Database Initialization
Ensure your SQLite database is strictly mapped to the Prisma Schema:
```bash
npx prisma generate
npx prisma db push
```

### 4. Boot Up server
```bash
npm run dev
```
Navigate your browser to `http://localhost:3000`. You can freely browse your local database models visually by opening `npx prisma studio` in a separate terminal. 

## 🛡️ License
Private Repository. Learn Something Daily © 2026.
