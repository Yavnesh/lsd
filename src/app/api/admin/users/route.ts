import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET: search/list users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      },
      include: {
        stat: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // limit to 50 results
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("[API Admin Users GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 });
  }
}

// PUT: update user role, premium, streak, xp, ELO, shields
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, isPremium, streak, xp, level, streakShields, globalRating } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // Update User role/premium
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role || undefined,
        isPremium: isPremium !== undefined ? isPremium : undefined,
      },
    });

    // Update UserStat if stats parameters are provided
    if (
      streak !== undefined ||
      xp !== undefined ||
      level !== undefined ||
      streakShields !== undefined ||
      globalRating !== undefined
    ) {
      await prisma.userStat.upsert({
        where: { userId },
        update: {
          streak: streak !== undefined ? Number(streak) : undefined,
          xp: xp !== undefined ? Number(xp) : undefined,
          level: level || undefined,
          streakShields: streakShields !== undefined ? Number(streakShields) : undefined,
          globalRating: globalRating !== undefined ? Number(globalRating) : undefined,
        },
        create: {
          userId,
          streak: Number(streak) || 0,
          xp: Number(xp) || 0,
          level: level || "Curious Mind",
          streakShields: Number(streakShields) || 1,
          globalRating: Number(globalRating) || 1000,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User account updated successfully.",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("[API Admin Users PUT] Error:", error);
    return NextResponse.json({ error: "Failed to update user", details: error.message }, { status: 500 });
  }
}
