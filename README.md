# ⚡ LSD: Learn Something Daily

> **"The Duolingo of Real-Life Knowledge."**  
> Become 1% smarter every single day in under 5 minutes through interactive visual mental models, competitive PvP duels, and infinite universe exploration.

**Live Production:** [https://www.learnsomethingdaily.com](https://www.learnsomethingdaily.com)

---

## 🗺️ Product Overview & Architecture

LSD is a gamified micro-learning platform engineered to teach essential real-world frameworks—from cognitive biases and behavioral economics to decision-making models, emotional resilience, and financial psychology.

```mermaid
graph TD
    User([Learner]) --> Auth[NextAuth / Google OAuth / Credentials]
    Auth --> Hub[Daily Quest & Learn Hub /learn]
    Hub --> Slides[7-Block Cognitive Loop]
    Slides --> Quizzes[Interactive Decision Quizzes]
    Quizzes --> Gamification[XP + Leveling + Streak Shields + Artifacts]
    Gamification --> Arena[Mind Gym PvP Duels / Leaderboards]
    Hub --> Universe[Universe Graph Map /universe]
    
    Admin([Admin / Operators]) --> AdminPanel[Admin Operations Dashboard /admin]
    AdminPanel --> AI_Gen[Multi-Agent AI Generator / Gemini API]
    AdminPanel --> SuggestQueue[Community & AI Suggestion Pipeline]
    AdminPanel --> ContentTree[Universe / Worlds / Missions Manager]
```

---

## 🔄 The 7-Block Storytelling Loop

Every daily lesson is delivered via a structured **7-slide cognitive engagement model** designed to maximize retention:

```mermaid
graph LR
    A[1. The Hook] --> B[2. The Meme]
    B --> C[3. The Reveal]
    C --> D[4. Why It Matters]
    D --> E[5. Test Yourself]
    E --> F[6. Mind-Blowing Fact]
    F --> G[7. Share Card]
```

1. **The Hook 🧐:** Builds immediate resonance and curiosity with required reaction clicks.
2. **Meme Version 🎭:** Humor-driven cartoon / visual context for instant recognition.
3. **The Reveal 🔓:** Concise scientific and psychological breakdown in under 100 words.
4. **Why It Matters 📊:** Real-world impact cards spanning Career, Money, and Relationships.
5. **Test Yourself ⚡:** Scenario-driven multiple-choice challenge to test comprehension.
6. **Mind-Blowing Fact 💡:** High-impact takeaway reinforcing the core concept.
7. **The Share Card 📱:** Visual summary card ready for social sharing and streaks.

---

## 🌌 The Knowledge Universe (`/universe`)

An interactive, zoomable galaxy of interconnected knowledge nodes powered by `@xyflow/react`:
- **Hierarchy:** Worlds $\rightarrow$ Regions $\rightarrow$ Missions $\rightarrow$ Concepts.
- **Fog of War:** Unlocks adjacent nodes dynamically as the user masters prerequisite topics.
- **Knowledge Artifacts:** Rare unlockables that grant passive XP buffs and account badges.

---

## 🏆 Arena, PvP & Gamification System

- **Dynamic ELO & Matchmaking:** Real-time head-to-head duels with Ghost Runs and live timer scoring.
- **Streak Shields:** Habit loop protection against missed days.
- **Energy & Hearts (Lives):** 3 daily lives encourage careful reasoning and can be refilled.
- **Global Leaderboards:** Track daily, weekly, and all-time standing across learning clusters.

---

## 🤖 Admin Operations & Agent Pipeline (`/admin`)

- **Multi-Agent AI Generator:** Automated researcher, planner, and questioner agents leveraging Google Gemini AI for daily curriculum generation.
- **Suggestion Queue:** Community & AI draft review pipeline with batch approvals.
- **Content Hierarchy Manager:** Visual tree editor for Worlds, Regions, and Missions.

---

## 💻 Tech Stack

- **Framework:** [Next.js 16 (Turbopack)](https://nextjs.org/) (App Router, Server Actions)
- **Language:** TypeScript 5
- **Database & ORM:** PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [NextAuth.js v4](https://next-auth.js.org/) (Google OAuth 2.0 & Credentials)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Graph & Visualization:** [@xyflow/react (React Flow)](https://reactflow.dev/) + `@tsparticles/react`
- **Testing:** [Vitest](https://vitest.dev/)

---

## 🛠️ Development & Deployment Setup

### 1. Installation
```bash
git clone https://github.com/Yavnesh/lsd.git
cd lsd
npm install
```

### 2. Environment Variables Configuration
Create a `.env` file in the root directory:
```env
# Database Connection (Pooled connection for serverless/production)
DATABASE_URL="postgresql://user:password@localhost:5432/lsd?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000" # Use https://www.learnsomethingdaily.com in production
NEXTAUTH_SECRET="your-32-character-secret-key"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Generation Engine
GEMINI_API_KEY="your-gemini-api-key"

# Cron Security Secret
CRON_SECRET="your-secure-cron-secret"
```

### 3. Database Initialization
```bash
# Generate Prisma client
npx prisma generate

# Apply database schema
npx prisma db push

# Seed initial worlds, topics, and starter decks
npx prisma db seed
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Quality Assurance & Tests
```bash
# Run ESLint validation
npm run lint

# Run Unit & Integration Tests
npm test

# Verify Production Build
npm run build
```

---

## 🌿 Branching Strategy & Release Lifecycle

LSD follows a strict dual-branch deployment workflow:

```mermaid
graph LR
    Feature[feat/* or fix/*] -->|PR + CI Verification| Develop[develop (Staging)]
    Develop -->|Release Promotion PR| Master[master (Production)]
    Master -->|Automatic Deployment| Vercel[Vercel Live: www.learnsomethingdaily.com]
```

- **`develop`**: Integration branch for ongoing development, test verification, and preview builds.
- **`master`**: Production release branch connected to Vercel live deployments. Direct pushes to `master` are protected.

---

## 🛡️ License
Private Repository. Learn Something Daily © 2026. All rights reserved.
