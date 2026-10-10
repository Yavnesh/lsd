import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

const SUGGESTIONS_FILE_PATH = path.join(process.cwd(), "src/lib/agents/suggestions.json");

export interface SuggestionItem {
  id: string;
  type: "WORLD" | "REGION" | "MISSION";
  parentName?: string; // Parent World or Region name
  name: string;
  reason: string;
  estimatedDifficulty?: string;
  estimatedPopularity?: string;
  confidence: number;
}

export function loadSuggestions(): SuggestionItem[] {
  try {
    const raw = fs.readFileSync(SUGGESTIONS_FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveSuggestions(items: SuggestionItem[]) {
  fs.writeFileSync(SUGGESTIONS_FILE_PATH, JSON.stringify(items, null, 2), "utf-8");
}

export async function runSuggestionsPlanner(): Promise<SuggestionItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return [
      {
        id: "sug_1",
        type: "WORLD",
        name: "Entrepreneur's Empire",
        reason: "Business thinking and startup frameworks are currently unrepresented.",
        confidence: 0.9,
      },
      {
        id: "sug_2",
        type: "REGION",
        parentName: "Bio-Dome Arena",
        name: "Circadian Rhythm",
        reason: "Expands sleep biome to explore biological timers.",
        confidence: 0.85,
      },
    ];
  }

  // 1. Fetch active structure from DB
  const worlds = await prisma.world.findMany({
    include: { regions: { include: { missions: { select: { name: true } } } } },
  });

  const activeStructure = worlds.map((w) => ({
    world: w.name,
    regions: w.regions.map((r) => ({
      region: r.name,
      missionsCount: r.missions.length,
    })),
  }));

  const prompt = `You are the Content Suggestions Planner for "LSD: Learn Something Daily".
Your job is to inspect the active curriculum structure and suggest:
1. Missing Worlds (e.g. Entrepreneur's Empire, Philosophy Peaks)
2. Missing Regions for existing worlds
3. Missing Missions for existing regions

Active Content Structure in Database:
${JSON.stringify(activeStructure, null, 2)}

Recommend 3-5 high-priority suggestions. Return a JSON array matching this schema:
[
  {
    "type": "WORLD" | "REGION" | "MISSION",
    "parentName": "Name of Parent World (for Regions) or Region (for Missions). Leave blank for Worlds.",
    "name": "Suggested Name",
    "reason": "Clear explanation of why this fits the LSD learning philosophy",
    "estimatedDifficulty": "EASY" | "MEDIUM" | "HARD",
    "estimatedPopularity": "HIGH" | "MEDIUM" | "LOW",
    "confidence": 0.85 // Number between 0 and 1
  }
]

Output STRICT JSON (no markdown, no code blocks):`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Suggestions Planner API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!jsonText) throw new Error("Empty response from Suggestions Planner");

  const results = JSON.parse(jsonText);
  const items: SuggestionItem[] = results.map((item: any, index: number) => ({
    id: `sug_${Date.now()}_${index}`,
    type: item.type || "WORLD",
    parentName: item.parentName || undefined,
    name: item.name || "New Suggested Item",
    reason: item.reason || "Completes curriculum paths.",
    estimatedDifficulty: item.estimatedDifficulty || "MEDIUM",
    estimatedPopularity: item.estimatedPopularity || "HIGH",
    confidence: typeof item.confidence === "number" ? item.confidence : 0.8,
  }));

  saveSuggestions(items);
  return items;
}
