import { QuestionData } from "./types";

export async function runQuestionerAgent(
  missionName: string,
  difficulty: string,
  context: string,
  count: number = 3
): Promise<QuestionData[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Generate mock questions
    const mockQuestions: QuestionData[] = [];
    for (let i = 0; i < count; i++) {
      mockQuestions.push({
        type: i % 2 === 0 ? "MULTIPLE_CHOICE" : "MYTH_FACT",
        text: `Scenario assessment question ${i + 1} for ${missionName}.`,
        options: i % 2 === 0 ? ["Choice A", "Choice B", "Choice C", "Choice D"] : ["True", "False"],
        correctIndex: 0,
        explanation: "Correct selection explanation.",
      });
    }
    return mockQuestions;
  }

  const { loadAgentPrompt } = require("./promptLoader");
  const rawPrompt = loadAgentPrompt("questioner");
  const prompt = rawPrompt
    .replace(/{missionName}/g, missionName)
    .replace(/{difficulty}/g, difficulty)
    .replace(/{context}/g, context)
    .replace(/{count}/g, String(count));

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
    throw new Error(`Questioner Agent API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!jsonText) throw new Error("Empty response from Questioner Agent");

  const results = JSON.parse(jsonText);
  if (!Array.isArray(results)) {
    throw new Error("Invalid output from Questioner Agent. Expected JSON array of questions.");
  }

  return results.map((item: any) => ({
    type: item.type || "MULTIPLE_CHOICE",
    text: item.text || "Assessment question?",
    options: Array.isArray(item.options) ? item.options : ["A", "B", "C", "D"],
    correctIndex: typeof item.correctIndex === "number" ? item.correctIndex : 0,
    explanation: item.explanation || "Correct option details.",
  }));
}
