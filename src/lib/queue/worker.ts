import { runFullGenerationPipeline } from "../agents/orchestrator";
import prisma from "@/lib/prisma";

export interface JobStatus {
  id: string;
  worldName: string;
  regionName: string;
  sequenceOrder: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  progress: number; // 0 to 100
  logs: string[];
  error?: string;
  resultMissionId?: string;
  createdAt: Date;
}

// Memory cache for active jobs
const jobsMap = new Map<string, JobStatus>();

export function getJobStatus(jobId: string): JobStatus | undefined {
  return jobsMap.get(jobId);
}

export function getAllJobs(): JobStatus[] {
  return Array.from(jobsMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function enqueueGenerationJob(
  worldName: string,
  regionName: string,
  sequenceOrder: number,
  difficulty: "EASY" | "MEDIUM" | "HARD"
): string {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  
  const job: JobStatus = {
    id: jobId,
    worldName,
    regionName,
    sequenceOrder,
    difficulty,
    status: "PENDING",
    progress: 0,
    logs: [`[Queue] Enqueued generation job ${jobId} for Region: "${regionName}"`],
    createdAt: new Date(),
  };

  jobsMap.set(jobId, job);

  processJob(jobId).catch((err) => {
    console.error(`[Queue] Fatal error processing job ${jobId}:`, err);
  });

  return jobId;
}

async function processJob(jobId: string) {
  const job = jobsMap.get(jobId);
  if (!job) return;

  try {
    job.status = "RUNNING";
    job.progress = 10;
    job.logs.push("[Orchestrator] Starting evolved curriculum generation pipeline...");

    // 1. Planner Agent
    job.progress = 25;
    job.logs.push("[Planner Agent] Inspecting content maps and defining next sequence step...");

    // 2. Researcher Agent
    job.progress = 45;
    job.logs.push("[Research Agent] Compiling scientific factsheets and objectives...");

    // 3. Curriculum Agent
    job.progress = 65;
    job.logs.push("[Curriculum Agent] Building slide brief and hook elements...");

    // 4. Question Generator Agent
    job.progress = 80;
    job.logs.push("[Questioner Agent] Crafting progression quiz questions...");

    // 5. Reviewer & self-repair
    job.progress = 90;
    job.logs.push("[Reviewer Agent] Validating schema constraints and semantic duplicates...");

    const missionPayload = await runFullGenerationPipeline(
      job.worldName,
      job.regionName,
      job.sequenceOrder,
      job.difficulty
    );

    job.logs.push(`[Reviewer Agent] Validation passed. Mission: "${missionPayload.name}"`);
    job.logs.push("[Publisher Agent] Committing curriculum entries to database...");

    // Ensure World exists
    const worldSlug = job.worldName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const world = await prisma.world.upsert({
      where: { slug: worldSlug },
      update: {},
      create: {
        name: job.worldName,
        slug: worldSlug,
        emoji: "🗺️",
      },
    });

    // Ensure Region exists
    const regionSlug = job.regionName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const region = await prisma.region.upsert({
      where: { slug: regionSlug },
      update: {},
      create: {
        name: job.regionName,
        slug: regionSlug,
        worldId: world.id,
      },
    });

    // Save Mission as DRAFT
    const createdMission = await prisma.mission.upsert({
      where: { slug: missionPayload.slug },
      update: {
        name: missionPayload.name,
        sequenceOrder: missionPayload.sequenceOrder,
        difficulty: missionPayload.difficulty,
        status: "DRAFT",
      },
      create: {
        name: missionPayload.name,
        slug: missionPayload.slug,
        sequenceOrder: missionPayload.sequenceOrder,
        difficulty: missionPayload.difficulty,
        status: "DRAFT",
        regionId: region.id,
      },
    });

    // Save Questions associated with this mission
    // Clean up existing questions first if upserting
    await prisma.question.deleteMany({
      where: { missionId: createdMission.id },
    });

    for (const q of missionPayload.questions) {
      await prisma.question.create({
        data: {
          missionId: createdMission.id,
          type: q.type,
          text: q.text,
          optionsJson: JSON.stringify(q.options),
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        },
      });
    }

    job.progress = 100;
    job.status = "COMPLETED";
    job.resultMissionId = createdMission.id;
    job.logs.push(`[Publisher Agent] Mission successfully saved as DRAFT. ID: ${createdMission.id}`);
  } catch (error: any) {
    console.error(`[Queue] Error processing job ${jobId}:`, error);
    job.status = "FAILED";
    job.error = error.message || "Internal generation failure";
    job.logs.push(`[Error] Pipeline execution failed: ${job.error}`);
  }
}
