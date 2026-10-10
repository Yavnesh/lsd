import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { loadSuggestions, saveSuggestions, runSuggestionsPlanner } from "@/lib/agents/suggestionsPlanner";
import { enqueueGenerationJob } from "@/lib/queue/worker";
import prisma from "@/lib/prisma";

// GET active suggestions queue
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const items = loadSuggestions();
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("[API Admin Suggestions GET] Error:", error);
    return NextResponse.json({ error: "Failed to load suggestions", details: error.message }, { status: 500 });
  }
}

// POST trigger new suggestion planner run
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const items = await runSuggestionsPlanner();
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("[API Admin Suggestions POST] Error:", error);
    return NextResponse.json({ error: "Failed to trigger suggestions planner", details: error.message }, { status: 500 });
  }
}

// PUT / DELETE (Approve/Reject suggestion item)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, action } = body; // action: "APPROVE" or "REJECT"

    if (!id || !action) {
      return NextResponse.json({ error: "Missing required parameters: id, action" }, { status: 400 });
    }

    const items = loadSuggestions();
    const targetItem = items.find((item) => item.id === id);

    if (!targetItem) {
      return NextResponse.json({ error: "Suggestion item not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      if (targetItem.type === "WORLD") {
        const slug = targetItem.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await prisma.world.create({
          data: {
            name: targetItem.name,
            slug,
            emoji: "🌐",
            description: targetItem.reason,
          },
        });
      } else if (targetItem.type === "REGION") {
        // Resolve parent World
        const parentWorldName = targetItem.parentName || "Understand Yourself";
        const world = await prisma.world.findFirst({
          where: { name: parentWorldName },
        });
        if (world) {
          const slug = targetItem.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          await prisma.region.create({
            data: {
              name: targetItem.name,
              slug,
              description: targetItem.reason,
              worldId: world.id,
            },
          });
        }
      } else if (targetItem.type === "MISSION") {
        // Resolve parent Region and associated World
        const parentRegionName = targetItem.parentName || "Personality";
        const region = await prisma.region.findFirst({
          where: { name: parentRegionName },
          include: { world: true },
        });
        if (region) {
          // Find next sequenceOrder
          const count = await prisma.mission.count({ where: { regionId: region.id } });
          // Enqueue generation job in background
          enqueueGenerationJob(
            region.world.name,
            region.name,
            count + 1,
            (targetItem.estimatedDifficulty as any) || "EASY"
          );
        }
      }
    }

    // Remove from active suggestions list
    const filtered = items.filter((item) => item.id !== id);
    saveSuggestions(filtered);

    return NextResponse.json({ success: true, message: `Suggestion successfully ${action.toLowerCase()}d.` });
  } catch (error: any) {
    console.error("[API Admin Suggestions PUT] Error:", error);
    return NextResponse.json({ error: "Failed to process suggestion", details: error.message }, { status: 500 });
  }
}
