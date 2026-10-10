import { ResearchOutput } from "./types";

export async function runCurriculumAgent(
  research: ResearchOutput
): Promise<{ hook: string; context: string; learningObjectives: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      hook: `Discover how ${research.missionName} affects your choices daily!`,
      context: `Explore this scenario testing ${research.focusConcept} inside the ${research.regionName} framework.`,
      learningObjectives: ["Understand the baseline mechanism.", "Recognize everyday traps."],
    };
  }

  const { loadAgentPrompt } = require("./promptLoader");
  const rawPrompt = loadAgentPrompt("curriculum");
  const prompt = rawPrompt
    .replace(/{researchFactsheet}/g, research.factsheetMarkdown)
    .replace(/{topic}/g, research.missionName)
    .replace(/{cluster}/g, research.regionName)
    .replace(/{season}/g, research.worldName);

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
    throw new Error(`Curriculum Agent API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!jsonText) throw new Error("Empty response from Curriculum Agent");

  const result = JSON.parse(jsonText);
  return {
    hook: result.hook || "Why do we repeat bad choices?",
    context: result.context || "Welcome to this new challenge module.",
    learningObjectives: result.learningObjectives || ["Learn basic properties."],
  };
}
