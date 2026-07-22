import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// POST a new Region
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { name, description, worldId } = await req.json();
    if (!name || !worldId) {
      return NextResponse.json({ error: "Missing required fields: name, worldId" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const created = await prisma.region.create({
      data: {
        name,
        slug,
        description,
        worldId,
      },
    });

    return NextResponse.json({
      success: true,
      region: created,
    });
  } catch (error: any) {
    console.error("[API Admin Regions POST] Error:", error);
    return NextResponse.json({ error: "Failed to create region", details: error.message }, { status: 500 });
  }
}
