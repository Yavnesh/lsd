import { MissionSchema, MissionData } from "./types";

export interface ReviewResult {
  isValid: boolean;
  errors: string[];
  repairedMission?: MissionData;
}

export async function runReviewerAgent(
  mission: MissionData,
  existingMissions: string[]
): Promise<ReviewResult> {
  const errors: string[] = [];

  // 1. Zod Validation
  const zodResult = MissionSchema.safeParse(mission);
  if (!zodResult.success) {
    zodResult.error.issues.forEach((err) => {
      errors.push(`[Schema Error] Path: "${err.path.join(".")}" - ${err.message}`);
    });
  }

  // 2. Similarity Screen
  const newName = mission.name.toLowerCase();
  for (const existing of existingMissions) {
    if (existing.toLowerCase() === newName) {
      errors.push(`[Duplicate Error] A mission with name "${mission.name}" already exists in database.`);
    }
  }

  // 3. Self-repair prompt if errors exist
  const apiKey = process.env.GEMINI_API_KEY;
  if (errors.length > 0 && apiKey) {
    try {
      console.log("Reviewer Agent detected issues. Initiating self-repair...", errors);
      const repairPrompt = `You are the Reviewer Agent self-repair loop for "LSD: Learn Something Daily".
The generated mission has failed validation rules. Your job is to fix it and output a fully compliant JSON object.

Errors Detected:
${errors.map((e) => `- ${e}`).join("\n")}

Input Mission Object:
${JSON.stringify(mission, null, 2)}

Output a corrected, fully compliant JSON object matching this schema exactly:
{
  "name": "Short punchy name (3-6 words)",
  "slug": "unique-slug-string",
  "sequenceOrder": ${mission.sequenceOrder},
  "difficulty": "${mission.difficulty}",
  "brief": {
    "hook": "max 200 characters",
    "context": "max 400 characters",
    "learningObjectives": ["Objective 1", "Objective 2"]
  },
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "text": "max 500 characters",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "max 500 characters"
    }
  ]
}

Output STRICT JSON (no markdown, no code blocks):`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: repairPrompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const repaired = JSON.parse(jsonText);
          const parsedRepaired = MissionSchema.safeParse(repaired);
          if (parsedRepaired.success) {
            console.log("Self-repair successful!");
            return {
              isValid: true,
              errors: [],
              repairedMission: parsedRepaired.data,
            };
          }
        }
      }
    } catch (e) {
      console.error("Self-repair failed:", e);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
