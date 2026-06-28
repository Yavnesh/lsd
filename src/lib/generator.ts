import prisma from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════════
// TOPIC CLUSTERS PER SEASON
// Each season has multiple topic clusters so the 5 daily quests
// each cover a different angle of the season's world.
// ═══════════════════════════════════════════════════════════════
const SEASON_CLUSTERS: Record<string, string[]> = {
    "Understand Yourself": ["Personality", "Emotions", "Habits", "Motivation", "Relationships", "Identity", "Self-Awareness"],
    "Surviving The Internet": ["Attention Economy", "Social Media Psychology", "Digital Habits", "Online Influence", "Privacy Mindset"],
    "Your Body Explained": ["Sleep", "Nutrition Science", "Exercise Psychology", "Stress Biology", "Brain Health"],
    "Think Better": ["Cognitive Biases", "Mental Models", "Decision Making", "Critical Thinking", "Problem Solving"],
    "Money Without The Boring Stuff": ["Consumer Psychology", "Behavioral Finance", "Earning Mindset", "Spending Psychology", "Investing Basics"],
};

// ═══════════════════════════════════════════════════════════════
// RICH FALLBACK CONTENT
// Used when GEMINI_API_KEY is not set. Provides at least 5
// unique topics per season — one per cluster.
// ═══════════════════════════════════════════════════════════════
const RICH_FALLBACKS: Record<string, any[]> = {
    "Understand Yourself": [
        {
            title: "Introvert vs Extrovert", emoji: "🧐", cluster: "Personality", isPremium: false,
            summary: "Energy recovery is what truly separates introverts from extroverts.",
            contentBlocks: [
                { type: "hook", text: "You might be calling yourself an introvert when you're actually just exhausted." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=1000", caption: "Introvert: 'I need alone time.' | Extrovert: 'I need MORE people!'", explanation: "Introversion vs extroversion is about energy recovery, not social skills. Introverts recharge alone; extroverts recharge with others." },
                { type: "summary", title: "The Recharge Matrix 🔋", bulletPoints: ["Introvert: Battery drains in groups, charges in solitude.", "Extrovert: Battery charges in groups, drains in solitude.", "Ambivert: Adapts to both—most people are here.", "Social skills are independent of your introversion score."] },
                { type: "quiz", question: "What actually defines introversion?", options: ["Being shy", "Hating people", "How you recharge your energy", "Being quiet"], correctIndex: 2, explanation: "Introversion is about energy recovery — solitude recharges introverts, not social anxiety." },
                { type: "share_card", title: "Introvert vs Extrovert", summary: "Solitude isn't anti-social. It's energy management.", teaser: "Find your recharge style on LSD." }
            ]
        },
        {
            title: "Emotional Regulation Unlocked", emoji: "🌊", cluster: "Emotions", isPremium: false,
            summary: "You can't stop emotions — but you can choose what you do with them.",
            contentBlocks: [
                { type: "hook", text: "Suppressing emotions doesn't make them disappear — it gives them a gym membership." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1000", caption: "Me trying to 'not feel' my feelings | The feelings: 'We live here now.'", explanation: "Emotion suppression increases psychological stress. The healthier path is to name, understand, and redirect emotions." },
                { type: "summary", title: "The Emotion Regulation Toolkit 🧰", bulletPoints: ["Name it to tame it: labeling reduces emotional intensity.", "Cognitive reappraisal: reframe the situation, not the feeling.", "Opposite action: act counter to the urge (DBT technique).", "Mindfulness: observe without reacting."] },
                { type: "quiz", question: "What is 'cognitive reappraisal'?", options: ["Ignoring your feelings", "Reframing a situation to change its emotional impact", "Taking deep breaths", "Counting to 10"], correctIndex: 1, explanation: "Cognitive reappraisal means changing how you interpret a situation — one of the most effective regulation strategies." },
                { type: "share_card", title: "Emotional Regulation", summary: "Your emotions are data, not orders.", teaser: "Master your inner world on LSD." }
            ]
        },
        {
            title: "The Habit Loop Decoded", emoji: "🔄", cluster: "Habits", isPremium: false,
            summary: "Every habit has 3 parts — and you can hack any one of them.",
            contentBlocks: [
                { type: "hook", text: "You don't decide to check your phone 96 times a day. Your habit loop does." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000", caption: "My brain: 'Just check Instagram quick.' | 45 minutes later...", explanation: "Habits run on a 3-part loop: Cue → Routine → Reward. The brain automates the routine when a cue triggers a reward expectation." },
                { type: "summary", title: "Hack the Habit Loop ⚙️", bulletPoints: ["Cue: The trigger (time, place, emotion, person, or preceding action).", "Routine: The automatic behavior that follows.", "Reward: The craving satisfied — dopamine released.", "Hack it: Change the routine while keeping the cue and reward."] },
                { type: "quiz", question: "To break a bad habit, which part of the loop should you change?", options: ["The reward", "The cue", "The routine", "All three are equally easy to change"], correctIndex: 2, explanation: "Changing the routine is the most practical — the cue and reward are harder to eliminate, but you can swap the behavior." },
                { type: "share_card", title: "The Habit Loop", summary: "You're not lazy. You just haven't hacked your loop yet.", teaser: "Rewire your autopilot on LSD." }
            ]
        },
        {
            title: "Intrinsic vs Extrinsic Motivation", emoji: "🚀", cluster: "Motivation", isPremium: false,
            summary: "Money can actually destroy your love for something you enjoy.",
            contentBlocks: [
                { type: "hook", text: "Pay a kid to draw, and they'll stop drawing the moment you stop paying." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000", caption: "Passion Project on Day 1 vs Passion Project after 'Let's monetize it!'", explanation: "The Overjustification Effect: external rewards can undermine intrinsic motivation. When you're rewarded for something you love, you may start doing it FOR the reward, not the joy." },
                { type: "summary", title: "The Motivation Matrix 🎯", bulletPoints: ["Intrinsic: Driven by enjoyment, curiosity, or meaning.", "Extrinsic: Driven by money, grades, or approval.", "Overjustification Effect: Rewards can kill internal drive.", "Self-Determination Theory: Autonomy + Mastery + Purpose = peak motivation."] },
                { type: "quiz", question: "What is the Overjustification Effect?", options: ["Working too hard for too little", "When external rewards reduce internal motivation", "Being too motivated to relax", "Over-explaining your goals"], correctIndex: 1, explanation: "Adding external rewards to an already enjoyable activity can reduce your intrinsic drive over time." },
                { type: "share_card", title: "Intrinsic Motivation", summary: "Do things because they matter, not just because they pay.", teaser: "Fuel your real drive on LSD." }
            ]
        },
        {
            title: "Attachment Styles Explained", emoji: "🤝", cluster: "Relationships", isPremium: true,
            summary: "Your childhood relationships secretly run your adult love life.",
            contentBlocks: [
                { type: "hook", text: "You didn't learn love from movies — you learned it from your first caregivers. And it shows." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000", caption: "Me in relationships: reacting exactly how my 4-year-old self learned to cope.", explanation: "Attachment Theory (Bowlby & Ainsworth): how your early bonds shape 4 adult attachment styles — Secure, Anxious, Avoidant, and Fearful-Avoidant." },
                { type: "summary", title: "The 4 Attachment Styles 🔗", bulletPoints: ["Secure: Comfortable with closeness and independence.", "Anxious: Craves closeness but fears abandonment.", "Avoidant: Values independence, emotionally distant.", "Fearful-Avoidant: Wants connection but fears it simultaneously."] },
                { type: "quiz", question: "Which attachment style is most associated with fear of abandonment?", options: ["Secure", "Avoidant", "Anxious", "Fearful-Avoidant"], correctIndex: 2, explanation: "Anxious attachment is characterized by a strong fear of abandonment and hypervigilance about relationship security." },
                { type: "share_card", title: "Attachment Styles", summary: "Understanding your style is the first step to healthier love.", teaser: "Decode your relationship patterns on LSD." }
            ]
        },
    ],
    "Surviving The Internet": [
        {
            title: "The Attention Economy", emoji: "📱", cluster: "Attention Economy", isPremium: false,
            summary: "Every app you use is designed to colonize your attention.",
            contentBlocks: [
                { type: "hook", text: "You are not Instagram's customer. You are the product being sold to advertisers." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=1000", caption: "App: 'It's free!' | Also App: *sells your attention to 3,000 advertisers*", explanation: "The Attention Economy means your time and focus are the currency. Social platforms optimize for engagement (time spent), not your wellbeing." },
                { type: "summary", title: "The Attention Trap 🕸️", bulletPoints: ["Platforms profit per second of your attention.", "Infinite scroll removes natural stopping cues.", "Notifications are engineered to create compulsive checking.", "Your data shapes increasingly personalized hooks."] },
                { type: "quiz", question: "In the attention economy, what is the real 'product'?", options: ["The app itself", "Ads shown in the app", "Users' attention and data", "Premium subscriptions"], correctIndex: 2, explanation: "Your attention and behavioral data are sold to advertisers — you are the product, not the customer." },
                { type: "share_card", title: "The Attention Economy", summary: "Reclaim your time. Your attention is your most finite resource.", teaser: "Think before you scroll — learn why on LSD." }
            ]
        },
        {
            title: "The Dopamine Loop of Social Media", emoji: "🔔", cluster: "Social Media Psychology", isPremium: false,
            summary: "Likes, comments, and notifications are engineered to feel like slot machines.",
            contentBlocks: [
                { type: "hook", text: "The 'pull to refresh' gesture was literally designed to mimic a slot machine lever." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1000", caption: "Me checking my post every 2 minutes: *casino sounds* | Brain: 'Maybe THIS time...'", explanation: "Variable reward schedules (like slot machines) create the strongest behavioral loops. Social media delivers random, unpredictable rewards — exactly the trigger for compulsive checking." },
                { type: "summary", title: "The Social Media Slot Machine 🎰", bulletPoints: ["Variable rewards: unpredictable responses create compulsion.", "Likes = dopamine hit, making you crave more.", "Notifications interrupt flow state and prime checking behavior.", "Streaks and counts weaponize loss aversion."] },
                { type: "quiz", question: "Why does unpredictable social feedback create stronger addiction than consistent feedback?", options: ["People like surprises", "Variable schedules create the strongest compulsion loops", "Consistent feedback is boring", "It's faster to process"], correctIndex: 1, explanation: "Variable reward schedules produce more robust behavioral patterns than fixed schedules — exactly how slot machines (and feeds) are designed." },
                { type: "share_card", title: "Social Media Dopamine Loop", summary: "You're not addicted to the app. You're addicted to the unpredictability.", teaser: "Break the loop — start with LSD." }
            ]
        },
        {
            title: "Digital Minimalism", emoji: "🌿", cluster: "Digital Habits", isPremium: false,
            summary: "Reclaiming your offline life starts with intentional tech use.",
            contentBlocks: [
                { type: "hook", text: "The average person unlocks their phone 96 times per day — that's once every 10 minutes while awake." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1490750967868-88df5691cc9e?auto=format&fit=crop&q=80&w=1000", caption: "Me 'just checking my phone real quick' | 2 hours later: *has watched 47 videos about medieval bread*", explanation: "Digital minimalism (Cal Newport) is the practice of being intentional about technology — using it as a tool, not a compulsion." },
                { type: "summary", title: "Digital Minimalism Principles 📵", bulletPoints: ["Clutter is costly: every app demands attention tax.", "Opt-in, not opt-out: choose tools deliberately.", "Solitude is essential: time offline isn't wasted.", "High-quality leisure beats low-quality scrolling."] },
                { type: "quiz", question: "What is the core principle of digital minimalism?", options: ["Delete all apps", "Intentional, selective use of technology", "Only use tech for work", "Limit to 1 hour per day"], correctIndex: 1, explanation: "Digital minimalism is about intentional use — choosing tools that serve your values, not defaults that serve algorithms." },
                { type: "share_card", title: "Digital Minimalism", summary: "Your phone is a tool. Not the other way around.", teaser: "Audit your tech diet on LSD." }
            ]
        },
        {
            title: "The Echo Chamber Effect", emoji: "🔊", cluster: "Online Influence", isPremium: false,
            summary: "Your feed is a mirror — it only shows you what you already believe.",
            contentBlocks: [
                { type: "hook", text: "Your algorithm doesn't show you the world. It shows you a hall of mirrors reflecting your existing views." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000", caption: "Me: forms opinion | Algorithm: *shows 200 people who agree* | Me: 'I must be right'", explanation: "Filter bubbles (Eli Pariser) and echo chambers algorithmically curate content that confirms your existing beliefs, amplifying tribal thinking and reducing exposure to counter-arguments." },
                { type: "summary", title: "Escaping the Echo Chamber 🪟", bulletPoints: ["Follow people who challenge your thinking, not just validate it.", "Notice when all content reinforces one perspective.", "Seek primary sources over algorithmically curated ones.", "Epistemic humility: 'I might be in a bubble' is the first step."] },
                { type: "quiz", question: "What is a 'filter bubble'?", options: ["A spam filter", "An algorithm-created environment showing only agreeable content", "A privacy setting", "Blocking negative comments"], correctIndex: 1, explanation: "Filter bubbles are created by algorithms that optimize for engagement — showing you content that confirms what you already believe." },
                { type: "share_card", title: "Echo Chamber Effect", summary: "The algorithm feeds your ego, not your intelligence.", teaser: "Burst your bubble — learn more on LSD." }
            ]
        },
        {
            title: "Your Digital Privacy Mindset", emoji: "🔐", cluster: "Privacy Mindset", isPremium: true,
            summary: "Data you share today shapes decisions about you for years.",
            contentBlocks: [
                { type: "hook", text: "Your incognito mode hides your history from yourself. It hides nothing from your ISP, employer, or the sites you visit." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1000", caption: "Me: *opens incognito* | Also me: *still logged into Google*", explanation: "Digital privacy isn't about hiding — it's about understanding what data you generate, where it goes, and who can use it against you." },
                { type: "summary", title: "Privacy Mindset Basics 🛡️", bulletPoints: ["Incognito only hides local history — not server-side tracking.", "Every app permission is a data pipeline.", "Your location data reveals your religion, politics, and health.", "Data brokers sell 300+ data points about you to anyone."] },
                { type: "quiz", question: "What does incognito mode actually prevent?", options: ["ISPs seeing your traffic", "Google tracking you", "Local browser history being saved", "Advertisers targeting you"], correctIndex: 2, explanation: "Incognito mode only prevents your local browser from saving history. Your ISP, employer, and websites still see everything." },
                { type: "share_card", title: "Digital Privacy", summary: "Privacy isn't paranoia. It's sovereignty.", teaser: "Own your data story on LSD." }
            ]
        },
    ],
    "Your Body Explained": [
        {
            title: "The Sleep Cycle Decoded", emoji: "💤", cluster: "Sleep", isPremium: false,
            summary: "You're not just unconscious during sleep — your brain is doing its most important work.",
            contentBlocks: [
                { type: "hook", text: "Missing 90 minutes of sleep reduces daytime alertness by 32% — the equivalent of being mildly drunk." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=1000", caption: "Me: '5 more minutes' | My sleep cycle: *collapses the entire REM stage*", explanation: "Sleep runs in 90-minute cycles through NREM (light → deep) and REM stages. Waking mid-cycle causes sleep inertia. The last 2 hours are almost entirely REM — critical for memory and emotional regulation." },
                { type: "summary", title: "Sleep Cycle Cheat Sheet 🌙", bulletPoints: ["NREM Stage 1-2: Light sleep, body temperature drops.", "NREM Stage 3: Deep sleep — cell repair, immune boost.", "REM: Dreams, memory consolidation, emotional processing.", "Cutting sleep cuts REM first — the most cognitively valuable stage."] },
                { type: "quiz", question: "Which sleep stage is most important for memory consolidation?", options: ["Light NREM", "Deep NREM", "REM sleep", "The transition stage"], correctIndex: 2, explanation: "REM sleep is when the brain replays and consolidates memories from the day — it's essential for learning and emotional regulation." },
                { type: "share_card", title: "The Sleep Cycle", summary: "Sleep isn't rest. It's maintenance mode for your brain.", teaser: "Optimize your nights on LSD." }
            ]
        },
        {
            title: "You Are What You Eat (For Real)", emoji: "🥗", cluster: "Nutrition Science", isPremium: false,
            summary: "Your gut bacteria are sending signals to your brain right now.",
            contentBlocks: [
                { type: "hook", text: "90% of your serotonin is made in your gut — not your brain." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000", caption: "Me eating junk food: 'It's fine, it's just food' | My gut-brain axis: *sends anxiety signals*", explanation: "The gut-brain axis is a bidirectional communication network between your gut microbiome and your brain. Diet affects mood, anxiety, cognition, and even personality via neurotransmitter production." },
                { type: "summary", title: "Gut-Brain Axis Facts 🧬", bulletPoints: ["90% of serotonin is produced in the gut, not the brain.", "The gut microbiome contains 38 trillion bacteria.", "Ultra-processed foods alter microbiome diversity within days.", "Fermented foods (yogurt, kimchi) measurably reduce anxiety."] },
                { type: "quiz", question: "Where is most of your body's serotonin produced?", options: ["The brain", "The liver", "The gut", "The spinal cord"], correctIndex: 2, explanation: "About 90% of serotonin is produced in the gut — this is why gut health profoundly affects mood and mental wellbeing." },
                { type: "share_card", title: "Gut-Brain Axis", summary: "Your diet shapes your mood as much as your mindset does.", teaser: "Feed your brain right on LSD." }
            ]
        },
        {
            title: "Why Exercise Is a Brain Drug", emoji: "🏃", cluster: "Exercise Psychology", isPremium: false,
            summary: "Exercise doesn't just build muscle — it literally grows your brain.",
            contentBlocks: [
                { type: "hook", text: "A single 20-minute jog produces more BDNF than most antidepressants." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1000", caption: "Me avoiding the gym: 'I'll start Monday' | My brain: *slowly shrinking*", explanation: "Exercise releases BDNF (Brain-Derived Neurotrophic Factor) — literally a fertilizer for neurons. It grows the hippocampus (memory center) and reduces cortisol (stress hormone)." },
                { type: "summary", title: "Exercise as Brain Upgrade 🧠", bulletPoints: ["BDNF: Exercise grows new neurons in the hippocampus.", "Cortisol drops: stress regulation improves after 20 min cardio.", "Dopamine & serotonin spike: mood lifts during and after.", "Memory improves: aerobic exercise before learning boosts retention by 20%."] },
                { type: "quiz", question: "What is BDNF?", options: ["A muscle-building hormone", "A neurotoxin", "A brain growth factor released during exercise", "A sleep chemical"], correctIndex: 2, explanation: "BDNF (Brain-Derived Neurotrophic Factor) is released during exercise and promotes the growth of new neurons — especially in the hippocampus." },
                { type: "share_card", title: "Exercise & Brain Health", summary: "The best brain supplement is already free — it's movement.", teaser: "Upgrade your mind on LSD." }
            ]
        },
        {
            title: "The Science of Stress", emoji: "😤", cluster: "Stress Biology", isPremium: false,
            summary: "Short-term stress sharpens you. Chronic stress literally shrinks your brain.",
            contentBlocks: [
                { type: "hook", text: "Chronic stress shrinks the hippocampus — your memory center — in as little as 6 weeks." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=1000", caption: "My brain dealing with 'everything at once': *cortisol.exe has stopped working*", explanation: "Cortisol (the stress hormone) is useful in short bursts — it sharpens focus and boosts energy. But chronically elevated cortisol damages the hippocampus, suppresses immune function, and disrupts sleep." },
                { type: "summary", title: "Stress: The Dual-Edge Sword ⚔️", bulletPoints: ["Acute stress: sharpens focus, mobilizes energy (fight-or-flight).", "Chronic stress: shrinks hippocampus, damages immune system.", "Cortisol baseline: chronically high = memory and mood problems.", "Best reset: deep breathing activates the vagus nerve instantly."] },
                { type: "quiz", question: "What does chronic elevated cortisol do to the hippocampus?", options: ["Grows it", "Has no effect", "Shrinks it", "Makes it more efficient"], correctIndex: 2, explanation: "Chronic cortisol exposure causes hippocampal atrophy — measurably shrinking the brain region responsible for memory formation." },
                { type: "share_card", title: "Stress Biology", summary: "Stress isn't the problem — chronic stress is.", teaser: "Learn to manage your cortisol on LSD." }
            ]
        },
        {
            title: "Your Brain on Dopamine", emoji: "🎯", cluster: "Brain Health", isPremium: true,
            summary: "Dopamine isn't the pleasure chemical — it's the anticipation chemical.",
            contentBlocks: [
                { type: "hook", text: "Dopamine spikes more when you EXPECT a reward than when you receive it. That's why scrolling never satisfies." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000", caption: "Dopamine: *huge spike* 'Something good might happen!' | After the thing: 'Oh. That's it.'", explanation: "Dopamine drives seeking behavior, not satisfaction. The anticipation of reward (not the reward itself) creates the biggest dopamine surge — explaining why social media, gambling, and shopping create compulsive loops." },
                { type: "summary", title: "The Dopamine Truth 💊", bulletPoints: ["Dopamine = anticipation, not pleasure (that's opioids).", "Seeking behavior is dopamine-driven — the loop never ends.", "Dopamine detox: abstaining from high-stimulation activities resets baseline.", "Goal-setting leverages dopamine: breaking goals into milestones maintains motivation."] },
                { type: "quiz", question: "When does dopamine spike the most?", options: ["When you achieve a goal", "When you eat your favorite food", "When you anticipate a possible reward", "After completing work"], correctIndex: 2, explanation: "Dopamine spikes most during anticipation — the uncertainty of reward creates stronger dopamine release than the reward itself." },
                { type: "share_card", title: "Dopamine System", summary: "Your brain is chasing the next thing, not the thing you have.", teaser: "Hack your reward system on LSD." }
            ]
        },
    ],
    "Think Better": [
        {
            title: "Confirmation Bias", emoji: "🔍", cluster: "Cognitive Biases", isPremium: false,
            summary: "Your brain filters reality to confirm what you already believe.",
            contentBlocks: [
                { type: "hook", text: "You don't form opinions and then look for evidence. You look for evidence that fits your opinion — and ignore the rest." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&q=80&w=1000", caption: "Me researching 'Is coffee healthy?' until I find the 1 study that says yes.", explanation: "Confirmation bias is the tendency to search for, interpret, and recall information that confirms your preexisting beliefs. It operates automatically and unconsciously." },
                { type: "summary", title: "Fighting Confirmation Bias 🧪", bulletPoints: ["Actively seek disconfirming evidence before concluding.", "Steel-man opposing arguments before dismissing them.", "Track your predictions: were you right? Why not?", "Diverse information sources reduce bubble formation."] },
                { type: "quiz", question: "What is confirmation bias?", options: ["Remembering only bad events", "Favoring information that confirms existing beliefs", "Being overconfident", "Anchoring to first impressions"], correctIndex: 1, explanation: "Confirmation bias is the tendency to seek and interpret information in a way that confirms what you already believe." },
                { type: "share_card", title: "Confirmation Bias", summary: "You're not finding truth. You're finding your truth.", teaser: "Think clearer on LSD." }
            ]
        },
        {
            title: "First Principles Thinking", emoji: "⚗️", cluster: "Mental Models", isPremium: false,
            summary: "Elon Musk built rockets by refusing to accept 'that's just how it's done'.",
            contentBlocks: [
                { type: "hook", text: "SpaceX reduced rocket costs by 10x not by optimizing existing designs — but by questioning whether those designs made sense at all." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000", caption: "Everyone: 'Rockets cost $60M because they always have.' | First Principles: 'What ARE rockets made of, really?'", explanation: "First Principles Thinking means decomposing a problem to its fundamental truths and building back up. It's the opposite of reasoning by analogy — instead of asking 'what does X cost?', ask 'what should X cost given its components?'" },
                { type: "summary", title: "First Principles Method 🔩", bulletPoints: ["Identify and challenge assumptions you've never questioned.", "Break the problem down to its base components.", "Ask: 'What do we know for certain is true?'", "Reconstruct solutions from the ground up."] },
                { type: "quiz", question: "First principles thinking primarily involves:", options: ["Following best practices", "Copying successful competitors", "Breaking problems down to fundamental truths and rebuilding", "Using gut instinct"], correctIndex: 2, explanation: "First principles thinking means identifying basic facts (not assumptions) and reasoning up from them — creating genuinely new solutions." },
                { type: "share_card", title: "First Principles Thinking", summary: "Question the question before you answer it.", teaser: "Think like a founder on LSD." }
            ]
        },
        {
            title: "The Sunk Cost Fallacy", emoji: "💸", cluster: "Decision Making", isPremium: false,
            summary: "Throwing good money after bad is a cognitive error, not loyalty.",
            contentBlocks: [
                { type: "hook", text: "You finish a terrible movie because you already paid for it. You're not protecting your investment — you're wasting more time." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000", caption: "Me staying in a bad situation: 'But I've already invested so much.' | Future me: '...Why?'", explanation: "The Sunk Cost Fallacy: past investments (time, money, effort) should NOT influence future decisions. Only future costs and benefits should. Psychologically, loss aversion makes us irrationally value what we've already spent." },
                { type: "summary", title: "The Sunk Cost Escape Plan 🗺️", bulletPoints: ["Sunk costs are gone — they can't be recovered.", "Continuing for sunk costs wastes MORE future resources.", "Ask: 'If I were starting fresh today, would I make this choice?'", "Quitting strategically is a skill, not a failure."] },
                { type: "quiz", question: "Which question best helps overcome the Sunk Cost Fallacy?", options: ["How much have I invested?", "What will others think if I quit?", "If starting fresh today, would I make this choice?", "How much time is left?"], correctIndex: 2, explanation: "Asking 'would I do this fresh?' removes sunk cost bias by forcing you to evaluate future value, not past investment." },
                { type: "share_card", title: "Sunk Cost Fallacy", summary: "Past decisions don't have to determine your future.", teaser: "Make smarter calls on LSD." }
            ]
        },
        {
            title: "Inversion: Think Backwards", emoji: "🔄", cluster: "Critical Thinking", isPremium: false,
            summary: "The most powerful problem-solving technique is asking 'how could this fail?'",
            contentBlocks: [
                { type: "hook", text: "Charlie Munger doesn't ask 'how do I succeed?' He asks 'what would guarantee failure?' — then avoids it." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=1000", caption: "Me planning to win | Inversion: 'Cool, now how do you lose?' | Me: *actually discovers real risks*", explanation: "Inversion is a mental model from Stoic and mathematical thinking. Instead of asking 'how do I achieve X?', ask 'what would prevent X?' or 'what would guarantee the opposite?' This reveals hidden risks and constraints." },
                { type: "summary", title: "Inversion Toolkit 🔮", bulletPoints: ["Forward: 'How do I succeed?' | Backward: 'How do I guarantee failure?'", "Pre-mortem: Imagine failure, trace back its causes before starting.", "Avoidance list: Some progress comes from eliminating failure modes.", "Works for any domain: relationships, investments, health, strategy."] },
                { type: "quiz", question: "What is a 'pre-mortem' in inversion thinking?", options: ["A medical test", "Celebrating success early", "Imagining failure in advance to identify risks", "Post-project analysis"], correctIndex: 2, explanation: "A pre-mortem involves imagining the project has already failed, then identifying what caused it — revealing risks that forward planning misses." },
                { type: "share_card", title: "Inversion Thinking", summary: "Sometimes the clearest path forward is backward.", teaser: "Think like Munger on LSD." }
            ]
        },
        {
            title: "Second-Order Thinking", emoji: "♟️", cluster: "Problem Solving", isPremium: true,
            summary: "Smart decisions require thinking about the effects of effects.",
            contentBlocks: [
                { type: "hook", text: "The Cobra Effect: British India paid bounties to kill cobras. People started breeding cobras. Snake population exploded." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=1000", caption: "Solution: pays people to catch cobras | Second Order: *people breed cobras* | Third Order: *more cobras than before*", explanation: "Second-order thinking asks: 'And then what?' First-order thinking looks at immediate effects; second-order considers what those effects trigger in turn. Most bad decisions fail at the second order." },
                { type: "summary", title: "Second-Order Thinking Levels 🎯", bulletPoints: ["1st order: What happens immediately?", "2nd order: What happens because of that?", "3rd order: What happens because of THAT?", "Most unintended consequences live at the 2nd-3rd order."] },
                { type: "quiz", question: "The Cobra Effect is an example of what thinking failure?", options: ["Confirmation bias", "Overconfidence", "First-order thinking ignoring second-order consequences", "Sunk cost fallacy"], correctIndex: 2, explanation: "The Cobra Effect demonstrates first-order thinking: the immediate solution (bounty) caused second-order consequences (breeding) that made the problem worse." },
                { type: "share_card", title: "Second-Order Thinking", summary: "The road to unintended consequences is paved with first-order solutions.", teaser: "Think further ahead on LSD." }
            ]
        },
    ],
    "Money Without The Boring Stuff": [
        {
            title: "The Psychology of Spending", emoji: "🛒", cluster: "Consumer Psychology", isPremium: false,
            summary: "Retailers spend millions engineering the psychology of your purchase decisions.",
            contentBlocks: [
                { type: "hook", text: "Supermarkets put milk at the back so you walk past 200 impulse purchases first." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1000", caption: "Me: 'I'll just get milk' | Shopping cart: *somehow has 23 items*", explanation: "Retailers use environmental design, anchoring prices, scarcity cues, and social proof to trigger automatic spending behavior — bypassing your rational evaluation system." },
                { type: "summary", title: "The Spending Trap Architecture 🏪", bulletPoints: ["Loss aversion: 'Limited time offer' exploits fear of missing out.", "Price anchoring: $199 crossed out to $99 makes $99 feel cheap.", "Decoy pricing: 3 options where the middle is designed to be chosen.", "Default options: pre-ticked upgrades exploit inertia."] },
                { type: "quiz", question: "What is 'price anchoring'?", options: ["Fixing prices to inflation", "Using a high initial price to make later prices seem cheap", "Comparing prices across stores", "Anchoring to monthly payments instead of total cost"], correctIndex: 1, explanation: "Price anchoring sets a high reference point (crossed-out price, 'original' price) so the actual price feels like a deal by comparison." },
                { type: "share_card", title: "Consumer Psychology", summary: "Every price tag is a psychological argument. Learn to argue back.", teaser: "Spend smarter on LSD." }
            ]
        },
        {
            title: "Loss Aversion: Why Losses Sting Twice as Hard", emoji: "😰", cluster: "Behavioral Finance", isPremium: false,
            summary: "Losing $100 hurts about twice as much as gaining $100 feels good.",
            contentBlocks: [
                { type: "hook", text: "Kahneman found that people feel losses approximately twice as intensely as equivalent gains. This asymmetry runs every bad financial decision." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000", caption: "Gaining $100: 😊 | Losing $100: 😭😭 | Brain math: *these are not equal*", explanation: "Loss aversion (Kahneman & Tversky, Prospect Theory) means the pain of losing is psychologically twice as powerful as the pleasure of gaining. This makes people hold losing investments too long, avoid necessary risks, and panic-sell during dips." },
                { type: "summary", title: "Loss Aversion in Money 💰", bulletPoints: ["Holding losers too long: hoping to 'break even' is loss aversion.", "Selling winners too early: protecting small gains from loss fear.", "Avoiding risk: even positive expected-value bets feel scary.", "Override: reframe losses as tuition for learning, not personal failure."] },
                { type: "quiz", question: "According to Kahneman, how much more painful is a loss vs. equivalent gain?", options: ["Equal", "Twice as painful", "Three times as painful", "Depends on the person"], correctIndex: 1, explanation: "Kahneman's research found losses are approximately 2x more painful psychologically than gains of the same size — this asymmetry drives irrational financial decisions." },
                { type: "share_card", title: "Loss Aversion", summary: "Your fear of losing is costing you more than losing would.", teaser: "Make fear-free decisions on LSD." }
            ]
        },
        {
            title: "The Wealth Mindset Shift", emoji: "🧠", cluster: "Earning Mindset", isPremium: false,
            summary: "The difference between trading time for money vs. building assets that earn.",
            contentBlocks: [
                { type: "hook", text: "A job gives you money for your time. A business gives you money for other people's time. Assets give you money while you sleep." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000", caption: "Linear income: *trades 8 hours for money* | Passive income: *earns while sleeping* | Rich: 'They're different?'", explanation: "Robert Kiyosaki's Cashflow Quadrant: Employee → Self-Employed → Business Owner → Investor. Most people stay in the first two, trading time for money. Wealth is built by owning assets (businesses, real estate, investments) that generate income independently of your time." },
                { type: "summary", title: "Cashflow Quadrant Basics 💹", bulletPoints: ["E (Employee): Trade time for fixed income + job security illusion.", "S (Self-Employed): Trade time for more income but no scalability.", "B (Business): Systems produce income without your direct labor.", "I (Investor): Money earns money — pure asset leverage."] },
                { type: "quiz", question: "What is 'passive income' in the wealth mindset?", options: ["Income from a second job", "Money earned without active time exchange", "Income from freelancing", "Government benefits"], correctIndex: 1, explanation: "Passive income comes from assets (investments, businesses, royalties) that generate money without requiring direct time exchange — the core of wealth building." },
                { type: "share_card", title: "Wealth Mindset", summary: "Stop selling hours. Start building assets.", teaser: "Shift your money mindset on LSD." }
            ]
        },
        {
            title: "Why You Spend More With Cards", emoji: "💳", cluster: "Spending Psychology", isPremium: false,
            summary: "Credit cards literally reduce the psychological pain of spending.",
            contentBlocks: [
                { type: "hook", text: "MIT researchers found people bid 2x more in auctions when paying by credit card vs. cash." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000", caption: "Paying cash: *feels each dollar leaving* | Paying by card: 'It's just a number. Tap. Done.'", explanation: "The 'pain of paying' (Zellermayer) — physical cash triggers real neurological discomfort. Cards, especially contactless, abstract money into numbers, reducing the pain signal and increasing spend willingness." },
                { type: "summary", title: "Payment Psychology Hacks 💡", bulletPoints: ["Cash creates physical friction that reduces overspending.", "Contactless payments = lowest pain = highest spend.", "Pre-paying (subscriptions, bundles) reduces price awareness.", "Counteract: review bank statements weekly to reconnect numbers to reality."] },
                { type: "quiz", question: "Why do people spend more with credit cards than cash?", options: ["Cards offer rewards", "Cards reduce the psychological pain of paying", "Cash runs out faster", "Cards are faster to use"], correctIndex: 1, explanation: "Credit cards reduce the 'pain of paying' — the neurological discomfort of spending. Abstract payment methods (cards, apps) reduce spending friction and increase willingness to spend." },
                { type: "share_card", title: "Payment Psychology", summary: "Your card is engineering your spending habits. Take the wheel back.", teaser: "Hack your spend mindset on LSD." }
            ]
        },
        {
            title: "Compound Interest Is Not Boring", emoji: "📈", cluster: "Investing Basics", isPremium: true,
            summary: "Einstein allegedly called compound interest the eighth wonder of the world. Here's why.",
            contentBlocks: [
                { type: "hook", text: "If you invested $5,000 at age 25 and never added a penny, you'd have $160,000 by 65. Wait until 35, and it's only $80,000." },
                { type: "meme", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000", caption: "Investing at 25: *sits quietly* | 30 years later: *becomes unreasonably large*", explanation: "Compound interest means you earn returns on your returns. $10,000 at 10% annually becomes $11,000, then $12,100, then $13,310 — the growth accelerates exponentially over decades." },
                { type: "summary", title: "Compound Interest Rules 📐", bulletPoints: ["Rule of 72: Divide 72 by annual return % = years to double money.", "Time > amount: starting 10 years earlier beats investing 2x more.", "Fees compound too — 1% management fee erodes 25% of returns over 30 years.", "Reinvest dividends: don't break the compound chain."] },
                { type: "quiz", question: "Using the Rule of 72, how long to double money at 8% annual return?", options: ["8 years", "9 years", "12 years", "16 years"], correctIndex: 1, explanation: "72 ÷ 8 = 9 years. The Rule of 72 is a quick mental math shortcut for estimating when investments double." },
                { type: "share_card", title: "Compound Interest", summary: "Time is the most powerful investment you can make.", teaser: "Start compounding knowledge on LSD." }
            ]
        },
    ],
};

// ═══════════════════════════════════════════════════════════════
// SINGLE TOPIC GENERATOR (on-demand, for today route)
// ═══════════════════════════════════════════════════════════════
export async function generateTopic(season: string, dayOfWeek: number) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("GEMINI_API_KEY not set. Using rich fallback content.");
        return getFallbackTopic(season, dayOfWeek);
    }

    const clusters = SEASON_CLUSTERS[season] || ["General Knowledge"];
    const clusterIndex = (dayOfWeek - 1) % clusters.length;
    const cluster = clusters[clusterIndex];

    return await generateSingleWithGemini(season, dayOfWeek, cluster, apiKey);
}

// ═══════════════════════════════════════════════════════════════
// BATCH GENERATOR — generates 5 topics for today's world
// Called by the daily cron job / admin trigger
// ═══════════════════════════════════════════════════════════════
export async function generateDailyBatch(season: string, dayOfWeek: number): Promise<{
    created: number;
    skipped: number;
    topics: any[];
    errors: string[];
}> {
    const apiKey = process.env.GEMINI_API_KEY;
    const clusters = SEASON_CLUSTERS[season] || ["General Knowledge"];
    const results = { created: 0, skipped: 0, topics: [] as any[], errors: [] as string[] };

    // Generate 5 unique topics — one per cluster
    const selectedClusters = clusters.slice(0, 5);

    for (let i = 0; i < selectedClusters.length; i++) {
        const cluster = selectedClusters[i];
        // Use a sub-index offset so each topic has a unique dayOfWeek variant
        // e.g. day 1 cluster 0 → dayOfWeek variant 1.0, cluster 1 → 1.1
        // For DB uniqueness we store them all as dayOfWeek but with different clusters
        try {
            let generated: any;

            if (apiKey) {
                generated = await generateSingleWithGemini(season, dayOfWeek, cluster, apiKey);
            } else {
                // Use rich fallback — pick by cluster
                const fallbacks = RICH_FALLBACKS[season] || [];
                const byCluster = fallbacks.find(f => f.cluster === cluster) || fallbacks[i] || fallbacks[0];
                if (!byCluster) { results.errors.push(`No fallback for ${season} / ${cluster}`); continue; }
                generated = {
                    ...byCluster,
                    slug: byCluster.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    season,
                    dayOfWeek,
                    contentBlocks: byCluster.contentBlocks,
                };
            }

            if (!generated) { results.errors.push(`Generation failed for ${season} / ${cluster}`); continue; }

            // Ensure unique slug by appending cluster slug
            const clusterSlug = cluster.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const daySlug = `day-${dayOfWeek}`;
            generated.slug = `${generated.slug}-${clusterSlug}-${daySlug}`;

            // Upsert — won't duplicate if already exists
            const existing = await prisma.topic.findUnique({ where: { slug: generated.slug } });
            if (existing) {
                results.skipped++;
                results.topics.push(existing);
                continue;
            }

            const topic = await prisma.topic.create({
                data: {
                    title: generated.title,
                    slug: generated.slug,
                    emoji: generated.emoji,
                    summary: generated.summary,
                    season: generated.season,
                    cluster: generated.cluster,
                    dayOfWeek: generated.dayOfWeek,
                    isPremium: generated.isPremium || false,
                    content: JSON.stringify(generated.contentBlocks),
                }
            });

            results.created++;
            results.topics.push(topic);

            // Small delay between Gemini calls to avoid rate limiting
            if (apiKey && i < selectedClusters.length - 1) {
                await new Promise(r => setTimeout(r, 800));
            }

        } catch (err: any) {
            const msg = `Error generating ${season}/${cluster}: ${err.message}`;
            console.error(msg);
            results.errors.push(msg);
        }
    }

    return results;
}

// ═══════════════════════════════════════════════════════════════
// GEMINI API CALL
// ═══════════════════════════════════════════════════════════════
async function generateSingleWithGemini(season: string, dayOfWeek: number, cluster: string, apiKey: string) {
    const prompt = `Generate a daily micro-learning lesson for a gamified app named LSD (Learn Something Daily).
The lesson MUST match these attributes exactly:
- Season (Theme World): "${season}"
- Topic Cluster (Sub-category): "${cluster}"  
- Day of Week (1=Monday to 7=Sunday): ${dayOfWeek}
- isPremium: ${dayOfWeek >= 6 ? "true" : "false"}

LSD teaches psychology, behavior, and thinking using vibrant, meme-style, bite-sized content. Tone: smart, punchy, surprising. Audience: curious 20-35 year olds.

Output STRICT JSON (no markdown, no code blocks):
{
  "title": "Short punchy title (3-6 words max)",
  "emoji": "Single relevant emoji",
  "summary": "One punchy sentence summary",
  "cluster": "${cluster}",
  "isPremium": ${dayOfWeek >= 6},
  "contentBlocks": [
    { "type": "hook", "text": "Counter-intuitive opening statement that surprises the reader and makes them want to read on." },
    { "type": "meme", "imageUrl": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=1000", "caption": "Funny relatable meme caption under 20 words", "explanation": "60-second plain English explanation of the psychological concept, tied to the meme." },
    { "type": "summary", "title": "Catchy title for takeaways (add emoji)", "bulletPoints": ["4 specific, actionable or insight-rich bullet points"] },
    { "type": "quiz", "question": "Test comprehension, not trivia. One clear correct answer.", "options": ["4 plausible options"], "correctIndex": 0, "explanation": "Short explanation of why this is correct." },
    { "type": "share_card", "title": "Topic name", "summary": "Viral one-liner takeaway", "teaser": "CTA to share or continue learning" }
  ]
}`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);

    const data = await response.json();
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) throw new Error("Empty response from Gemini API");

    const generated = JSON.parse(jsonText);
    return {
        title: generated.title,
        slug: generated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        emoji: generated.emoji,
        summary: generated.summary,
        cluster: generated.cluster || cluster,
        season,
        dayOfWeek,
        isPremium: generated.isPremium || dayOfWeek >= 6,
        contentBlocks: generated.contentBlocks,
    };
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK — returns a rich pre-written topic
// ═══════════════════════════════════════════════════════════════
function getFallbackTopic(season: string, dayOfWeek: number) {
    const fallbacks = RICH_FALLBACKS[season] || RICH_FALLBACKS["Understand Yourself"];
    // Rotate through fallbacks by dayOfWeek
    const topic = fallbacks[(dayOfWeek - 1) % fallbacks.length];
    return {
        ...topic,
        slug: topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        season,
        dayOfWeek,
    };
}
