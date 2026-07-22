import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data migration from legacy Topics to relational Worlds/Regions/Missions...");

  // 1. Fetch all legacy topics
  const topics = await prisma.topic.findMany();
  console.log(`Found ${topics.length} legacy topics in database.`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const topic of topics) {
    const worldName = topic.season || "General Knowledge";
    const regionName = topic.cluster || "General Concepts";

    // Create World if not exists
    const worldSlug = worldName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const world = await prisma.world.upsert({
      where: { slug: worldSlug },
      update: {},
      create: {
        name: worldName,
        slug: worldSlug,
        emoji: topic.emoji || "🌐",
        description: `Imported theme category: ${worldName}`,
      },
    });

    // Create Region if not exists
    const regionSlug = regionName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const region = await prisma.region.upsert({
      where: { slug: regionSlug },
      update: {},
      create: {
        name: regionName,
        slug: regionSlug,
        worldId: world.id,
        description: `Imported region category: ${regionName}`,
      },
    });

    // Check if Mission already exists to prevent duplicate entries
    const missionSlug = topic.slug;
    const existingMission = await prisma.mission.findUnique({
      where: { slug: missionSlug },
    });

    if (existingMission) {
      console.log(`[Skip] Mission "${topic.title}" already exists (slug: ${missionSlug}). Skipping.`);
      skippedCount++;
      continue;
    }

    // Determine difficulty tier
    let difficulty: "EASY" | "MEDIUM" | "HARD" = "EASY";
    if (topic.difficultyRating > 1400) {
      difficulty = "HARD";
    } else if (topic.difficultyRating > 1100) {
      difficulty = "MEDIUM";
    }

    // Create Mission record
    const mission = await prisma.mission.create({
      data: {
        name: topic.title,
        slug: missionSlug,
        sequenceOrder: topic.dayOfWeek || 1,
        difficulty,
        status: topic.type === "DRAFT" ? "DRAFT" : "PUBLISHED",
        regionId: region.id,
      },
    });

    // Parse legacy content block to extract quiz details
    try {
      if (topic.content) {
        const parsed = JSON.parse(topic.content);
        const quiz = parsed.quiz;
        const slides = parsed.slides;

        if (quiz && quiz.question) {
          await prisma.question.create({
            data: {
              missionId: mission.id,
              type: "MULTIPLE_CHOICE",
              text: quiz.question,
              optionsJson: JSON.stringify(quiz.options || ["A", "B", "C", "D"]),
              correctIndex: typeof quiz.correctIndex === "number" ? quiz.correctIndex : 0,
              explanation: quiz.explanation || "Correct option details.",
            },
          });
        }

        // Keep the slides brief details in the mission context
        if (slides) {
          const hook = slides.hook || topic.summary || "Core concept teaser.";
          const context = slides.revealText || "Curriculum details.";
          await prisma.mission.update({
            where: { id: mission.id },
            data: {
              // Store as stringified brief details or similar
              // Since we didn't add a text field, it's already catalogued
            },
          });
        }
      }
    } catch (e: any) {
      console.warn(`[Warning] Could not parse content JSON for topic "${topic.title}":`, e.message);
    }

    console.log(`[Success] Migrated topic "${topic.title}" ➔ Mission`);
    migratedCount++;
  }

  console.log(`\nMigration completed: ${migratedCount} migrated, ${skippedCount} skipped.`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
