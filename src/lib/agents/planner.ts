import { PlannerOutput } from "./types";

export async function runPlannerAgent(
  worldName: string,
  regionName: string,
  sequenceOrder: number,
  difficulty: "EASY" | "MEDIUM" | "HARD",
  existingMissions: string[]
): Promise<PlannerOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      worldName,
      regionName,
      missionName: `${regionName} Mission ${sequenceOrder}`,
      sequenceOrder,
      difficulty,
      focusConcept: `Mastering the core elements of ${regionName} at sequence stage ${sequenceOrder}.`,
    };
  }

  const { loadAgentPrompt } = require("./promptLoader");
  const rawPrompt = loadAgentPrompt("planner");
  const prompt = rawPrompt
    .replace(/{worldName}/g, worldName)
    .replace(/{regionName}/g, regionName)
    .replace(/{sequenceOrder}/g, String(sequenceOrder))
    .replace(/{difficulty}/g, difficulty)
    .replace(/{existingMissions}/g, JSON.stringify(existingMissions));

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
    throw new Error(`Planner Agent API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!jsonText) throw new Error("Empty response from Planner Agent");

  const result = JSON.parse(jsonText);
  return {
    worldName: result.worldName || worldName,
    regionName: result.regionName || regionName,
    missionName: result.missionName || `${regionName} Quiz ${sequenceOrder}`,
    sequenceOrder: Number(result.sequenceOrder) || sequenceOrder,
    difficulty: result.difficulty || difficulty,
    focusConcept: result.focusConcept || `Focusing on ${regionName} progression.`,
  };
}
