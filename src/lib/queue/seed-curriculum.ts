import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting curriculum database seeding...");

  // 1. Clean existing records to avoid duplicate slug violations during test seed runs
  console.log("Cleaning up existing curriculum records...");
  await prisma.question.deleteMany({});
  await prisma.mission.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.world.deleteMany({});

  // 2. Create Earning Mindset World
  console.log("Seeding Earning Mindset World...");
  const world1 = await prisma.world.create({
    data: {
      name: "Earning Mindset World",
      slug: "earning-mindset-world",
      emoji: "📈",
      description: "Wealth psychology, compound interest, and investment basics.",
    },
  });

  const region1a = await prisma.region.create({
    data: {
      name: "Compound Interest",
      slug: "compound-interest",
      description: "The math and mechanics of wealth compounding.",
      worldId: world1.id,
    },
  });

  const mission1a1 = await prisma.mission.create({
    data: {
      name: "What is Compound Interest?",
      slug: "what-is-compound-interest",
      sequenceOrder: 1,
      difficulty: "EASY",
      status: "PUBLISHED",
      regionId: region1a.id,
    },
  });

  await prisma.question.create({
    data: {
      missionId: mission1a1.id,
      type: "MULTIPLE_CHOICE",
      text: "If you invest $100 at 10% annual interest compounded annually, how much will you have at the end of 2 years?",
      optionsJson: JSON.stringify(["$110", "$120", "$121", "$130"]),
      correctIndex: 2,
      explanation: "After Year 1 you have $110 ($100 + $10 interest). In Year 2, you earn 10% on $110, which is $11, bringing the total to $121.",
    },
  });

  const mission1a2 = await prisma.mission.create({
    data: {
      name: "Why Starting Early Matters",
      slug: "why-starting-early-matters",
      sequenceOrder: 2,
      difficulty: "EASY",
      status: "DRAFT",
      regionId: region1a.id,
    },
  });

  await prisma.question.create({
    data: {
      missionId: mission1a2.id,
      type: "SCENARIO_DECISION",
      text: "Sarah starts investing $100/month at age 20. David starts investing $200/month at age 30. Both retire at age 60 earning the same interest. Who accumulates more money?",
      optionsJson: JSON.stringify(["Sarah accumulates significantly more", "David accumulates more", "They accumulate the exact same amount", "Cannot be determined"]),
      correctIndex: 0,
      explanation: "Sarah accumulates more because compound interest has an extra 10 years to run, meaning time is more powerful than doubling the contribution amount later.",
    },
  });

  // 3. Create Bio-Dome Arena World
  console.log("Seeding Bio-Dome Arena World...");
  const world2 = await prisma.world.create({
    data: {
      name: "Bio-Dome Arena",
      slug: "bio-dome-arena",
      emoji: "🧬",
      description: "Sleep cycles, circadian rhythm, exercise biology, and recovery.",
    },
  });

  const region2a = await prisma.region.create({
    data: {
      name: "Sleep Hygiene",
      slug: "sleep-hygiene",
      description: "Sleep architectures, REM, and alignment strategies.",
      worldId: world2.id,
    },
  });

  const mission2a1 = await prisma.mission.create({
    data: {
      name: "Circadian Rhythm Basics",
      slug: "circadian-rhythm-basics",
      sequenceOrder: 1,
      difficulty: "EASY",
      status: "PUBLISHED",
      regionId: region2a.id,
    },
  });

  await prisma.question.create({
    data: {
      missionId: mission2a1.id,
      type: "MYTH_FACT",
      text: "Exposure to high-intensity blue light in the evening helps sync your circadian rhythm for optimal deep sleep.",
      optionsJson: JSON.stringify(["Fact", "Myth"]),
      correctIndex: 1,
      explanation: "It is a myth. Blue light suppresses melatonin secretion, making it harder to fall asleep and disrupting sleep architecture.",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
