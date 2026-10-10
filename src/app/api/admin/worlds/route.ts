import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET all worlds + regions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const worlds = await prisma.world.findMany({
      include: {
        regions: {
          include: {
            missions: {
              select: {
                id: true,
                name: true,
                slug: true,
                sequenceOrder: true,
                difficulty: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(worlds);
  } catch (error: any) {
    console.error("[API Admin Worlds GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch worlds structure", details: error.message }, { status: 500 });
  }
}

// POST new world
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { name, emoji, description } = await req.json();
    if (!name || !emoji) {
      return NextResponse.json({ error: "Missing required fields: name, emoji" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const created = await prisma.world.create({
      data: {
        name,
        slug,
        emoji,
        description,
      },
    });

    return NextResponse.json({
      success: true,
      world: created,
    });
  } catch (error: any) {
    console.error("[API Admin Worlds POST] Error:", error);
    return NextResponse.json({ error: "Failed to create world", details: error.message }, { status: 500 });
  }
}
