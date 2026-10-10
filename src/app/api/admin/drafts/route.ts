import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { cache } from "@/lib/cache";

// GET all drafts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const drafts = await prisma.topic.findMany({
      where: {
        type: "DRAFT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedDrafts = drafts.map((t) => {
      let parsedContent = null;
      try {
        parsedContent = t.content ? JSON.parse(t.content) : null;
      } catch (e) {
        console.error(`Failed to parse content JSON for topic ID: ${t.id}`, e);
      }
      return {
        ...t,
        content: parsedContent,
      };
    });

    return NextResponse.json(formattedDrafts);
  } catch (error: any) {
    console.error("[API Admin Drafts GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch drafts", details: error.message }, { status: 500 });
  }
}

// PUT (update a draft, or publish it by changing type to 'DAILY')
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, emoji, summary, slides, quiz, type, isPremium, difficultyRating } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing draft topic ID" }, { status: 400 });
    }

    // Assemble the complete content blocks
    const contentPayload = {
      slides,
      quiz,
    };

    const updated = await prisma.topic.update({
      where: { id },
      data: {
        title,
        emoji,
        summary,
        isPremium,
        difficultyRating: Number(difficultyRating) || 1200,
        type: type || "DRAFT",
        content: JSON.stringify(contentPayload),
      },
    });

    // If published, bust all-topics cache
    if (type === "DAILY" || type === "HUB") {
      cache.delete("all-topics");
    }

    return NextResponse.json({
      success: true,
      message: "Topic updated successfully.",
      topic: updated,
    });
  } catch (error: any) {
    console.error("[API Admin Drafts PUT] Error:", error);
    return NextResponse.json({ error: "Failed to update topic", details: error.message }, { status: 500 });
  }
}

// DELETE a draft
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing topic ID" }, { status: 400 });
    }

    await prisma.topic.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Draft deleted successfully.",
    });
  } catch (error: any) {
    console.error("[API Admin Drafts DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete topic", details: error.message }, { status: 500 });
  }
}
