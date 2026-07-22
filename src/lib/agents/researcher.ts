import { PlannerOutput, ResearchOutput } from "./types";

export async function runResearchAgent(
  blueprint: PlannerOutput
): Promise<ResearchOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ...blueprint,
      factsheetMarkdown: `# Research: ${blueprint.missionName}\n\nFocusing on: ${blueprint.focusConcept}`,
    };
  }

  const { loadAgentPrompt } = require("./promptLoader");
  const rawPrompt = loadAgentPrompt("researcher");
  const prompt = rawPrompt
    .replace(/{worldName}/g, blueprint.worldName)
    .replace(/{regionName}/g, blueprint.regionName)
    .replace(/{missionName}/g, blueprint.missionName)
    .replace(/{sequenceOrder}/g, String(blueprint.sequenceOrder))
    .replace(/{difficulty}/g, blueprint.difficulty)
    .replace(/{focusConcept}/g, blueprint.focusConcept);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Research Agent API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const factsheetMarkdown = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!factsheetMarkdown) throw new Error("Empty response from Research Agent");

  return {
    ...blueprint,
    factsheetMarkdown,
  };
}
