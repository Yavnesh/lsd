# ⚡ LSD: Learn Something Daily

> **"The Duolingo of Real-Life Knowledge."**  
> Become 1% smarter every single day in less than 5 minutes, without the boring textbooks.

LSD is a highly interactive, gamified micro-learning platform. It transforms complex mental models, cognitive biases, behavioral economics, money, health, and thinking skills into visual, humorous, and competitive learning quests.

---

## 🗺️ Product Vision & Mission

Our mission is to teach the most important frameworks that shape everyday life—concepts that are critical to success, relationships, and finance, but are rarely covered in traditional schools.

### 🎭 Core Curriculum Paths
- **Understand Yourself:** Personality types, habits, motivation, emotions, self-awareness.
- **Surviving the Internet:** Social media psychology, attention economy, digital habits.
- **Your Body Explained:** Sleep architecture, stress biology, nutrition, brain health.
- **Think Better:** Decision making, cognitive biases, critical thinking, mental models.
- **Money Without the Boring Stuff:** Consumer psychology, behavioral finance, wealth building.

---

## 🔄 The 7-Block Storytelling Loop

Instead of standard read-and-assess loops, every topic utilizes an intertwined **7-slide cognitive loop** designed by behavioral psychologists to maximize retention and keep learning engaging:

```mermaid
graph TD
    A[1. The Hook] --> B[2. The Meme]
    B --> C[3. The Reveal]
    C --> D[4. Why It Matters]
    D --> E[5. Test Yourself]
    E --> F[6. Mind-Blowing Fact]
    F --> G[7. The Share Card]
```

1. **The Hook 🧐:** Creates immediate curiosity and resonance (requires active reaction click to progress).
2. **Meme Version 🎭:** Relatable situation cartoon or visual providing instant recognition of the concept.
3. **The Reveal 🔓:** Explains the science behind the pattern in under 100 words (requires reaction to unlock).
4. **Why It Matters 📊:** Demonstrates the real-life impact on Career, Money, and Relationships (requires tap-to-unlock cards).
5. **Test Yourself (Quiz) ⚡:** Interactive multiple-choice challenge to check recall.
6. **Mind-Blowing Fact 💡:** An unexpected, high-impact takeaway reinforcing the concept.
7. **The Share Card 📱:** A highly visual, shareable graphic summarizing the lesson.

---

## 🏆 Gamification & Arena PvP Mode

LSD applies gaming loops directly to educational mechanics to drive daily engagement:

- **XP & Levels:** Earn XP through quests and duels to level up from *Curious Mind* to *Sage*.
- **Streak & Shields:** Maintain a daily habit loop with active streak counts, protected by purchasable Streak Shields.
- **3 Hearts (Lives):** Limits daily quiz attempts to encourage careful reasoning. Refills over time or resets on request.
- **Mind Gym Arena (PvP):** 
  - Compete in head-to-head duels against **Ghost Runs** of comparable players or bot templates.
  - Skips reading slides and drops you straight into speed-based quiz cards.
  - A **15-second countdown timer** rewards fast answers with XP multipliers (2x under 3s, 1.5x under 8s).
  - Winners are decided by accuracy and response time, modifying ELO ratings dynamically.

---

## 💻 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Database ORM:** [Prisma ORM](https://www.prisma.io/) with a PostgreSQL database
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (supporting Google OAuth and credentials fallback)
- **State Store:** [Zustand](https://github.com/pmndrs/zustand) (supporting persistence for hearts and multipliers)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with responsive themes (Light warm parchment / Dark forest night)
- **Animations:** Framer Motion & Canvas Confetti

---

## 🛠️ Getting Started

### 1. Installation
Clone the repository and download project dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and define the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lsd?schema=public"

# Next Auth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_a_secure_random_hash"

# Google Credentials (obtain via Google Developer Console)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 3. Database Initialization & Seeding
Prepare your PostgreSQL database, apply schemas, and seed the curriculum:
```bash
npx prisma generate
npx prisma db push
node scripts/seed-content.js
```
*Note: Seeding generates 189 topics representing the 5 seasons.*

### 4. Running the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`. You can inspect database tables by executing `npx prisma studio` in a separate terminal.

---

## 🛡️ License
Private Repository. Learn Something Daily © 2026. All rights reserved.
