import { runPlannerAgent } from "./planner";
import { runResearchAgent } from "./researcher";
import { runCurriculumAgent } from "./curriculum";
import { runQuestionerAgent } from "./questioner";
import { runReviewerAgent } from "./reviewer";
import { MissionData } from "./types";
import prisma from "@/lib/prisma";

export async function runFullGenerationPipeline(
  worldName: string,
  regionName: string,
  sequenceOrder: number,
  difficulty: "EASY" | "MEDIUM" | "HARD"
): Promise<MissionData> {
  console.log(`[Pipeline] Starting evolved generation for: World="${worldName}", Region="${regionName}", Order=${sequenceOrder}`);

  // 1. Fetch existing missions inside this region for planner duplication check
  const regionRecord = await prisma.region.findFirst({
    where: { name: regionName },
    include: { missions: { select: { name: true } } },
  });
  const existingMissions = regionRecord ? regionRecord.missions.map((m) => m.name) : [];

  // 2. Planner Agent
  const blueprint = await runPlannerAgent(
    worldName,
    regionName,
    sequenceOrder,
    difficulty,
    existingMissions
  );
  console.log(`[Pipeline] [Planner Output]:`, blueprint);

  // 3. Research Agent
  const research = await runResearchAgent(blueprint);
  console.log(`[Pipeline] [Researcher Output] factsheet compiled.`);

  // 4. Curriculum Agent
  const brief = await runCurriculumAgent(research);
  console.log(`[Pipeline] [Curriculum Output] structured brief hook.`);

  // 5. Questioner Agent
  // Set target questions count: Easy (3), Medium (4), Hard (5)
  const questionsCount = difficulty === "EASY" ? 3 : difficulty === "MEDIUM" ? 4 : 5;
  const questions = await runQuestionerAgent(
    blueprint.missionName,
    difficulty,
    brief.context,
    questionsCount
  );
  console.log(`[Pipeline] [Questioner Output] generated ${questions.length} questions.`);

  const slug = blueprint.missionName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Assemble full mission payload
  const missionPayload: MissionData = {
    name: blueprint.missionName,
    slug,
    sequenceOrder: blueprint.sequenceOrder,
    difficulty: blueprint.difficulty,
    brief,
    questions,
  };

  // 6. Reviewer Agent
  const review = await runReviewerAgent(missionPayload, existingMissions);

  if (!review.isValid) {
    if (review.repairedMission) {
      console.log(`[Pipeline] Reviewer repaired and approved the mission.`);
      return review.repairedMission;
    } else {
      throw new Error(`Pipeline Validation Failed: ${review.errors.join("; ")}`);
    }
  }

  console.log(`[Pipeline] Verification Succeeded for mission: "${missionPayload.name}"`);
  return missionPayload;
}
