import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const topicsData = [
  // WEEK 1 / SEASON 1: Understand Yourself
  {
    title: "Introvert vs Extrovert",
    slug: "introvert-vs-extrovert",
    emoji: "🧐",
    summary: "Energy recovery vs social skills.",
    season: "Understand Yourself",
    cluster: "Personality",
    dayOfWeek: 1, // Monday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "You might be calling yourself an introvert when you're actually just exhausted." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=1000",
        caption: "Me: *Shows proof of them lying* | Them: 'Why are you always so paranoid?'",
        explanation: "Extroversion is linked more to energy recovery than social skills. Introverts recharge alone; extroverts recharge with others."
      },
      {
        type: "summary",
        title: "The Recharge Matrix 🔋",
        bulletPoints: [
          "Introvert: Battery drains in groups, charges in solitude.",
          "Extrovert: Battery charges in groups, drains in solitude.",
          "Ambivert: The middle ground—adapting to both scenarios.",
          "Social Skills: Independent of your introversion/extroversion score."
        ]
      },
      {
        type: "quiz",
        question: "How do introverts recover energy?",
        options: ["By partying hard", "By spending time in solitude", "By overworking", "They don't recover"],
        correctIndex: 1,
        explanation: "Correct! Solitude is the battery charger for introverts."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "Extroversion is linked more to dopamine release in response to social rewards than actual communication skills."
      },
      {
        type: "share_card",
        title: "Introvert vs Extrovert",
        summary: "Solitude isn't anti-social. It's energy management.",
        teaser: "Find out your true energy score on LSD."
      }
    ])
  },
  {
    title: "Attachment Styles",
    slug: "attachment-styles",
    emoji: "🔗",
    summary: "How you bond and love.",
    season: "Understand Yourself",
    cluster: "Relationships",
    dayOfWeek: 2, // Tuesday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "Why do you chase people who pull away, or run from people who get close?" },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1000",
        caption: "Anxious partner: *double texts* | Avoidant partner: *goes to cave for 3 business days*",
        explanation: "Your early childhood bonds shape how you handle intimacy as an adult. Spotting your style is the key to relationship sanity."
      },
      {
        type: "summary",
        title: "The Four Attachment Styles 💔",
        bulletPoints: [
          "Secure: Comfortable with intimacy, boundaries, and communication.",
          "Anxious: Fears abandonment, needs constant reassurance.",
          "Avoidant: Fears loss of independence, pulls away when close.",
          "Fearful-Avoidant: Craves intimacy but terrified of getting hurt."
        ]
      },
      {
        type: "quiz",
        question: "Which style pulls away when relationships get too serious?",
        options: ["Secure", "Anxious", "Avoidant", "All of them"],
        correctIndex: 2,
        explanation: "Correct! Avoidant individuals withdraw to protect their independence."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "Over 50% of people have a Secure attachment style, but Anxious and Avoidant styles disproportionately find each other due to the anxious-avoidant trap."
      },
      {
        type: "share_card",
        title: "Attachment Styles",
        summary: "Stop chasing, stop running. Understand your love style.",
        teaser: "Decode your relationship patterns on LSD."
      }
    ])
  },
  {
    title: "Emotional Regulation",
    slug: "emotional-regulation",
    emoji: "🎭",
    summary: "Mastering your reaction.",
    season: "Understand Yourself",
    cluster: "Emotions",
    dayOfWeek: 3, // Wednesday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "Reacting instantly feels good for 2 seconds. The regret lasts for weeks." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=1000",
        caption: "My brain: 'Just burn the bridge, it will look cool.' | Me: *reaching for matches*",
        explanation: "Emotional regulation is the gap between stimulus and response. Master the gap, master your life."
      },
      {
        type: "summary",
        title: "Regulation Tactics 🧘",
        bulletPoints: [
          "Reappraisal: Changing how you think about a situation to change how you feel.",
          "Suppression: Stifling the emotion (leads to stress and physical issues).",
          "Mindfulness: Observing the emotion without judgment or action.",
          "The 90-Second Rule: An emotion takes 90 seconds to process physically unless fed by thoughts."
        ]
      },
      {
        type: "quiz",
        question: "What is the physical processing duration of an emotion if not fed by thoughts?",
        options: ["90 seconds", "10 minutes", "2 hours", "Forever"],
        correctIndex: 0,
        explanation: "Correct! Dr. Jill Bolte Taylor discovered it takes only 90 seconds to wash out chemically."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "Suppressing emotions actually increases activation of the amygdala, making you feel *more* stressed internally."
      },
      {
        type: "share_card",
        title: "Emotional Regulation",
        summary: "You are not your feelings. You are the observer of them.",
        teaser: "Get emotional control tools on LSD."
      }
    ])
  },
  {
    title: "Habit Loops",
    slug: "habit-loops",
    emoji: "🔁",
    summary: "Cue, Craving, Response, Reward.",
    season: "Understand Yourself",
    cluster: "Habits",
    dayOfWeek: 4, // Thursday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "You don't lack willpower. You just have bad loop designs." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=1000",
        caption: "Bored -> Pick up phone -> Unlock -> Doomscroll -> Put down -> Bored -> Pick up phone",
        explanation: "Every habit is a loop: Cue (trigger), Craving (desire), Response (action), and Reward (payoff). Change the cue or reward to break the habit."
      },
      {
        type: "summary",
        title: "Habit Architecture 🏗️",
        bulletPoints: [
          "Cue: Make it obvious (or invisible for bad habits).",
          "Craving: Make it attractive (or unattractive).",
          "Response: Make it easy (or difficult).",
          "Reward: Make it satisfying (or unsatisfying)."
        ]
      },
      {
        type: "quiz",
        question: "What is the first step in the habit loop?",
        options: ["Reward", "Response", "Cue", "Craving"],
        correctIndex: 2,
        explanation: "Correct! The Cue is the environmental trigger that starts the loop."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "Dopamine rises *before* you take action, during the Craving phase, not after the Reward."
      },
      {
        type: "share_card",
        title: "Habit Loops",
        summary: "Show me your habits, and I will show you your future.",
        teaser: "Optimize your loops on LSD."
      }
    ])
  },
  {
    title: "Intrinsic Motivation",
    slug: "intrinsic-motivation",
    emoji: "🔥",
    summary: "Driven from within.",
    season: "Understand Yourself",
    cluster: "Motivation",
    dayOfWeek: 5, // Friday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "If you need someone to cheer for you to get out of bed, you're already losing." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000",
        caption: "Doing it for money: 😩 | Doing it because you want to prove a point: ⚡",
        explanation: "Extrinsic rewards (money, praise) eventually fail. Intrinsic motivation (autonomy, mastery, purpose) lasts forever."
      },
      {
        type: "summary",
        title: "The Triad of Drive 🔋",
        bulletPoints: [
          "Autonomy: The desire to direct our own lives.",
          "Mastery: The urge to get better at something that matters.",
          "Purpose: The yearning to do what we do in the service of something larger than ourselves."
        ]
      },
      {
        type: "quiz",
        question: "Which of these is an intrinsic motivator?",
        options: ["Cash bonus", "Public praise", "Personal mastery", "Fear of punishment"],
        correctIndex: 2,
        explanation: "Correct! Personal mastery is driven by internal growth."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "Adding financial rewards to an already enjoyable task can actually *reduce* a person's intrinsic motivation to do it (The Overjustification Effect)."
      },
      {
        type: "share_card",
        title: "Intrinsic Motivation",
        summary: "Build drive that doesn't depend on external applause.",
        teaser: "Find your true drive on LSD."
      }
    ])
  },
  {
    title: "Identity vs Reputation",
    slug: "identity-vs-reputation",
    emoji: "👤",
    summary: "Who you are vs what they think.",
    season: "Understand Yourself",
    cluster: "Identity",
    dayOfWeek: 6, // Saturday
    isPremium: true,
    content: JSON.stringify([
      { type: "hook", text: "You spend your whole life polishing a statue of yourself that other people look at." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000",
        caption: "Me styling my outfit for people I hate vs Me in my room wearing 10-year-old sweatpants",
        explanation: "Identity is internal character. Reputation is external projection. Confusing the two leads to anxiety."
      },
      {
        type: "summary",
        title: "Separating the Self 🧭",
        bulletPoints: [
          "Identity: Built by habits, values, and private choices.",
          "Reputation: Built by marketing, optics, and others' perceptions.",
          "The Trap: Tweaking your identity to fix a reputation.",
          "The Cure: Focus on character, and let the reputation catch up."
        ]
      },
      {
        type: "quiz",
        question: "Where does true Identity come from?",
        options: ["Public relations", "Instagram likes", "Private choices and habits", "Family expectations"],
        correctIndex: 2,
        explanation: "Correct! Private alignment of values and habits forms identity."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "Your brain reacts to reputation threats in the same way it reacts to physical survival threats (using the sympathetic nervous system)."
      },
      {
        type: "share_card",
        title: "Identity vs Reputation",
        summary: "Be a person, not a brand.",
        teaser: "Refine your character on LSD."
      }
    ])
  },
  {
    title: "Connect Yourself",
    slug: "connect-yourself",
    emoji: "🌀",
    summary: "Connecting your personal dots.",
    season: "Understand Yourself",
    cluster: "Identity",
    dayOfWeek: 7, // Sunday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "Your personality, habits, and attachments are not random. They are a network." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000",
        caption: "My attachment style explains my habits, which explains my energy, which explains everything.",
        explanation: "Connecting your energy recharge style (introversion) to your attachment style helps you understand how you bond and form habits."
      },
      {
        type: "summary",
        title: "The Complete Network 🌐",
        bulletPoints: [
          "Energy levels affect emotional regulation.",
          "Habits dictate relationship attachment triggers.",
          "Intrinsic motivation defines true identity."
        ]
      },
      {
        type: "quiz",
        question: "What ties emotional regulation and habits together?",
        options: ["Self-awareness", "External luck", "Other people's views", "Nothing"],
        correctIndex: 0,
        explanation: "Correct! Self-awareness is the central node of the personal network."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "Writing down how your habits connect to your personal identity makes you 300% more likely to keep them long term."
      },
      {
        type: "share_card",
        title: "Connect Yourself",
        summary: "You are a complete system, not a set of random facts.",
        teaser: "Get the full picture on LSD."
      }
    ])
  },

  // WEEK 2 / SEASON 2: Surviving The Internet
  {
    title: "The Attention Economy",
    slug: "attention-economy",
    emoji: "👀",
    summary: "You aren't the customer; you're the product.",
    season: "Surviving The Internet",
    cluster: "Attention Economy",
    dayOfWeek: 1, // Monday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "If the app is free, your attention is the cargo." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000",
        caption: "Dev team: 'How do we get him to scroll 5 more seconds?' | Me: *mindlessly swiping*",
        explanation: "Tech companies sell your attention to advertisers. They design loops to maximize screen time, not your happiness."
      },
      {
        type: "summary",
        title: "Engagement Engineering 📱",
        bulletPoints: [
          "Infinite Scroll: Removes natural stopping points.",
          "Variable Rewards: Pulling down to refresh is like playing a slot machine.",
          "Notifications: Leveraging social approval anxiety.",
          "Algorithms: Serving outrage because it generates the highest engagement."
        ]
      },
      {
        type: "quiz",
        question: "Why do apps use infinite scroll?",
        options: ["To save battery", "To eliminate natural stopping points", "For aesthetic reasons", "It is cheaper"],
        correctIndex: 1,
        explanation: "Correct! The absence of boundaries keeps you scrolling longer."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "The inventor of the Infinite Scroll, Aza Raskin, publicly apologized, stating he designed a system that wastes lifetimes."
      },
      {
        type: "share_card",
        title: "The Attention Economy",
        summary: "Guard your attention like your bank account.",
        teaser: "Take back your focus on LSD."
      }
    ])
  },

  // WEEK 3 / SEASON 3: Your Body Explained
  {
    title: "The Sleep Cycle",
    slug: "sleep-cycle",
    emoji: "💤",
    summary: "The brain's nightly cleaning service.",
    season: "Your Body Explained",
    cluster: "Sleep",
    dayOfWeek: 4, // Thursday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "Sleep isn't downtime. It's when your brain washes out its own toxic waste." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1511295742364-92767fa62d9f?auto=format&fit=crop&q=80&w=1000",
        caption: "Brain at 3 AM: 'Let's remember that awkward thing from 2012.'",
        explanation: "During deep sleep, the glymphatic system opens up, flushing out metabolic waste that builds up during the day."
      },
      {
        type: "summary",
        title: "Sleep Architecture 🌙",
        bulletPoints: [
          "Stage 1 & 2: Light sleep, body temperature drops.",
          "Stage 3: Deep sleep, physical restoration and waste clearance.",
          "REM Sleep: Dreaming, emotional processing, and memory consolidation.",
          "Circadian Rhythm: Driven by light exposure and temperature cycles."
        ]
      },
      {
        type: "quiz",
        question: "Which system flushes metabolic waste from the brain during sleep?",
        options: ["Lymphatic system", "Glymphatic system", "Nervous system", "Digestive system"],
        correctIndex: 1,
        explanation: "Correct! The glymphatic system cleanses the brain during deep sleep."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "Chronic sleep deprivation prevents the brain from cleaning itself, which is linked to accelerated cognitive decline."
      },
      {
        type: "share_card",
        title: "The Sleep Cycle",
        summary: "Sleep is the ultimate cognitive enhancement tool.",
        teaser: "Optimize your rest on LSD."
      }
    ])
  },

  // WEEK 4 / SEASON 4: Think Better
  {
    title: "Confirmation Bias",
    slug: "confirmation-bias",
    emoji: "🧠",
    summary: "Believing what you already think.",
    season: "Think Better",
    cluster: "Cognitive Biases",
    dayOfWeek: 6, // Saturday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "You think you're looking for the truth, but you're actually looking for agreement." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=1000",
        caption: "Google search: 'Why my opinion is 100% correct and smart'",
        explanation: "Confirmation bias is the tendency to search for, interpret, and recall information in a way that confirms your beliefs."
      },
      {
        type: "summary",
        title: "The Bias Blueprint 🗺️",
        bulletPoints: [
          "Selective Exposure: Reading only sources you agree with.",
          "Biased Interpretation: Twisting neutral facts to fit your story.",
          "Memory Recall: Forgetting opposing evidence while remembering supporting facts.",
          "The Echo Chamber: Surrounding yourself with people who agree with you."
        ]
      },
      {
        type: "quiz",
        question: "What is confirmation bias?",
        options: ["Being friendly", "Filtering facts to fit existing beliefs", "Changing your mind easily", "Critical thinking"],
        correctIndex: 1,
        explanation: "Correct! It filters reality to support what you already believe."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "When presented with facts contradicting their beliefs, people's beliefs often strengthen—known as the Backfire Effect."
      },
      {
        type: "share_card",
        title: "Confirmation Bias",
        summary: "If you only read what you agree with, you aren't thinking.",
        teaser: "De-bias your brain on LSD."
      }
    ])
  },

  // WEEK 5 / SEASON 5: Money Without The Boring Stuff
  {
    title: "The Sunk Cost Fallacy",
    slug: "sunk-cost-fallacy",
    emoji: "📉",
    summary: "Throwing good money after bad.",
    season: "Money Without The Boring Stuff",
    cluster: "Consumer Psychology",
    dayOfWeek: 5, // Friday
    isPremium: false,
    content: JSON.stringify([
      { type: "hook", text: "You keep sitting in a movie you hate just because you paid for the ticket." },
      {
        type: "meme",
        imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1000",
        caption: "Me finishing a terrible meal because: 'I paid $20 for this, my stomach is now a trash bin.'",
        explanation: "The sunk cost fallacy is continuing an endeavor because of previously invested resources (money, time, effort), even if the outcome is bad."
      },
      {
        type: "summary",
        title: "How Fallacies Cheat You 💸",
        bulletPoints: [
          "Past is gone: You cannot retrieve spent money or time.",
          "Future impact: Every minute spent on a bad project is stolen from a good one.",
          "Emotional bias: Admitting failure feels worse than wasting more assets.",
          "The Remedy: Ask: 'If I started fresh today, would I invest in this?'"
        ]
      },
      {
        type: "quiz",
        question: "What does the Sunk Cost Fallacy make you do?",
        options: ["Invest in index funds", "Continue bad investments because of past costs", "Cut losses early", "Ignore money"],
        correctIndex: 1,
        explanation: "Correct! It makes you waste more resources because you've already wasted some."
      },
      {
        type: "fact",
        title: "Mind-Blowing Fact 🧠",
        text: "Animals generally do not display the Sunk Cost Fallacy; it is a human error driven by our desire to seem consistent and avoid regret."
      },
      {
        type: "share_card",
        title: "Sunk Cost Fallacy",
        summary: "Your past losses should not dictate your future choices.",
        teaser: "Save your assets on LSD."
      }
    ])
  }
];

async function main() {
  console.log("Cleaning database...");
  await prisma.userActivity.deleteMany({});
  await prisma.userQuest.deleteMany({});
  await prisma.userTrophy.deleteMany({});
  await prisma.userStat.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.quest.deleteMany({});
  await prisma.trophy.deleteMany({});

  console.log("Seeding Quests...");
  const quests = [
    { title: "First Step", description: "Complete your first lesson", target: 1, rewardXp: 50 },
    { title: "Streak Master", description: "Reach a 7-day streak", target: 7, rewardXp: 200 },
    { title: "Intel Addict", description: "Complete 15 lessons", target: 15, rewardXp: 500 },
  ];
  for (const q of quests) {
    await prisma.quest.create({ data: q });
  }

  console.log("Seeding Trophies...");
  const trophies = [
    { name: "Curious Kid", description: "Complete your first daily topic", icon: "🌱" },
    { name: "Week Warrior", description: "Complete a full weekly cycle", icon: "🔥" },
    { name: "Sage Mind", description: "Unlock the Sage rank by earning 5000+ XP", icon: "🧠" },
  ];
  for (const t of trophies) {
    await prisma.trophy.create({ data: t });
  }

  console.log("Seeding Topics...");
  for (const topic of topicsData) {
    await prisma.topic.create({
      data: topic
    });
  }

  console.log("Seeding database completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
