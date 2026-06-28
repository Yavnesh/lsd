import prisma from "@/lib/prisma";

// Fallback topics templates if Gemini is not configured or fails
const fallbackTemplates: Record<string, Record<number, any>> = {
    "Understand Yourself": {
        1: {
            title: "Introvert vs Extrovert",
            emoji: "🧐",
            summary: "Energy recovery vs social skills.",
            cluster: "Personality",
            isPremium: false,
            contentBlocks: [
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
            ]
        }
    }
};

/**
 * Automatically generates a daily topic using the Gemini API.
 */
export async function generateTopic(season: string, dayOfWeek: number) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("GEMINI_API_KEY is not set. Generating content using static templates.");
        return getFallbackTopic(season, dayOfWeek);
    }

    const prompt = `Generate a daily micro-learning lesson for a modern SaaS app named LSD (Learn Something Daily).
The lesson must match the following attributes:
- Season Name (Theme): "${season}"
- Day of the Week (1 to 7 where 1 is Monday and 7 is Sunday): ${dayOfWeek}

LSD teaches psychology, behavior, and thinking models using vibrant, meme-style, bite-sized content.

Output MUST be a strict JSON object with the following schema:
{
  "title": "A short, punchy title (e.g. Cognitive Dissonance)",
  "emoji": "A single relevant emoji (e.g. 🧠)",
  "summary": "A 1-sentence summary of the topic",
  "cluster": "A subcategory/cluster name (e.g. Cognitive Biases, Self Control, Relationships)",
  "isPremium": false, // Set to true if dayOfWeek is 6 or 7
  "contentBlocks": [
    {
      "type": "hook",
      "text": "A highly engaging, counter-intuitive opening statement to grab attention."
    },
    {
      "type": "meme",
      "imageUrl": "A high-quality Unsplash image URL illustrating tech, human behavior, psychology, or a relatable situation (e.g. https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=1000)",
      "caption": "A funny, relatable meme caption",
      "explanation": "A simplified 60-second explanation of the topic, linking the meme to the psychological concept."
    },
    {
      "type": "summary",
      "title": "A title for the takeaways summary card (e.g. The Bias Blueprint)",
      "bulletPoints": [
        "Takeaway point 1",
        "Takeaway point 2",
        "Takeaway point 3",
        "Takeaway point 4"
      ]
    },
    {
      "type": "quiz",
      "question": "A multiple choice question to test understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0, // 0-indexed integer corresponding to the correct option
      "explanation": "A short explanation of why this answer is correct."
    },
    {
      "type": "fact",
      "title": "Mind-Blowing Fact 🧠",
      "text": "An unexpected scientific study result, statistic, or psychological discovery."
    },
    {
      "type": "share_card",
      "title": "Topic Name Summary",
      "summary": "A punchy, viral one-liner takeaway to share",
      "teaser": "CTA line (e.g., Decode your brain's loops on LSD)"
    }
  ]
}

IMPORTANT: Ensure the JSON is completely valid, parseable, and strictly adheres to the schema. Do not enclose it in markdown blocks.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) {
            throw new Error("Empty response from Gemini API");
        }

        const generatedData = JSON.parse(jsonText);
        return {
            title: generatedData.title,
            slug: generatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            emoji: generatedData.emoji,
            summary: generatedData.summary,
            cluster: generatedData.cluster,
            season,
            dayOfWeek,
            isPremium: generatedData.isPremium || dayOfWeek >= 6,
            contentBlocks: generatedData.contentBlocks
        };
    } catch (e) {
        console.error("AI Topic generation failed, falling back to templates:", e);
        return getFallbackTopic(season, dayOfWeek);
    }
}

function getFallbackTopic(season: string, dayOfWeek: number) {
    const template = fallbackTemplates[season]?.[dayOfWeek];
    if (template) {
        return {
            ...template,
            slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            season,
            dayOfWeek
        };
    }

    // Ultimate fallback if no template matches
    const title = `Insight on ${season} (Day ${dayOfWeek})`;
    return {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        emoji: "💡",
        summary: `Understand core concepts of ${season}.`,
        cluster: "General Knowledge",
        season,
        dayOfWeek,
        isPremium: dayOfWeek >= 6,
        contentBlocks: [
            { type: "hook", text: "Every day is an opportunity to learn something new about how you operate." },
            {
                type: "meme",
                imageUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=1000",
                caption: "Me at 3 AM explaining human logic to my cat.",
                explanation: "We build patterns of thought to understand our environment, often without realizing it."
            },
            {
                type: "summary",
                title: "Daily Reflections 🧭",
                bulletPoints: [
                    "Acknowledge your current mental state daily.",
                    "Review environmental cues that trigger habit loops.",
                    "Establish small, consistent cycles for energy recovery.",
                    "Prioritize self-guided interest over forced tasks."
                ]
            },
            {
                type: "quiz",
                question: "What is the key to breaking habit loops?",
                options: ["More willpower", "Changing the cue or reward", "Ignoring the habit", "Nothing"],
                correctIndex: 1,
                explanation: "Correct! Modifying the cue or reward breaks the cycle."
            },
            {
                type: "fact",
                title: "Mind-Blowing Fact 🧠",
                text: "Habits are formed by chunking behaviors together in the basal ganglia, freeing up brainpower."
            },
            {
                type: "share_card",
                title: "Daily Reflections",
                summary: "Micro-learning aggregates into major breakthroughs over time.",
                teaser: "Start stacking IQ on LSD."
            }
        ]
    };
}
