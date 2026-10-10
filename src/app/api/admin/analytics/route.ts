import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // 1. Gather general statistics
    const [totalUsers, totalTopics, totalActivities, averageStats] = await Promise.all([
      prisma.user.count(),
      prisma.topic.count(),
      prisma.userActivity.count(),
      prisma.userStat.aggregate({
        _avg: {
          streak: true,
          globalRating: true,
        },
      }),
    ]);

    // 2. Fetch all topics with count of associated activities
    const topicsList = await prisma.topic.findMany({
      select: {
        id: true,
        title: true,
        cluster: true,
        season: true,
        emoji: true,
        isPremium: true,
        difficultyRating: true,
        userActivities: {
          select: {
            quizCorrect: true,
            status: true,
          },
        },
      },
      orderBy: [
        { season: "asc" },
        { dayOfWeek: "asc" },
      ],
      take: 100, // limit to 100 results for rendering
    });

    const formattedTopics = topicsList.map((t) => {
      const completions = t.userActivities.filter((a) => a.status === "COMPLETED").length;
      const quizAttempts = t.userActivities.filter((a) => a.quizCorrect !== null).length;
      const quizCorrects = t.userActivities.filter((a) => a.quizCorrect === true).length;
      
      const successRate = quizAttempts > 0 ? Math.round((quizCorrects / quizAttempts) * 100) : 100;

      return {
        id: t.id,
        title: t.title,
        cluster: t.cluster || "General",
        season: t.season || "General",
        emoji: t.emoji || "🧠",
        isPremium: t.isPremium,
        difficultyRating: t.difficultyRating,
        completions,
        successRate,
      };
    });

    return NextResponse.json({
      summary: {
        totalUsers,
        totalTopics,
        totalActivities,
        averageStreak: Math.round(averageStats._avg.streak || 0),
        averageElo: Math.round(averageStats._avg.globalRating || 1000),
      },
      topics: formattedTopics,
    });
  } catch (error: any) {
    console.error("[API Admin Analytics GET] Error:", error);
    return NextResponse.json({ error: "Failed to load analytics", details: error.message }, { status: 500 });
  }
}
