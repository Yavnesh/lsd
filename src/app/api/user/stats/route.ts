import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const userStats = await prisma.userStat.findUnique({
            where: { userId },
        });

        const activities = await prisma.userActivity.findMany({
            where: { userId },
            include: { topic: true },
            orderBy: { completedAt: "desc" }
        });

        return NextResponse.json({
            stats: userStats || { xp: 0, streak: 0, level: "Curious Mind" },
            activities
        });
    } catch (error) {
        console.error("Error retrieving user stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { xpToAdd, incrementStreak, topicId, earnedXp } = await req.json();

        // Transaction to update stats and record activity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get or create current user stats
            let userStat = await tx.userStat.findUnique({
                where: { userId }
            });

            if (!userStat) {
                userStat = await tx.userStat.create({
                    data: {
                        userId,
                        xp: 0,
                        streak: 0,
                        level: "Curious Mind"
                    }
                });
            }

            // Calculate new XP
            const newXp = userStat.xp + (xpToAdd || 0);

            // Calculate new level based on XP
            let newLevel = userStat.level;
            if (newXp >= 5000) newLevel = "Sage";
            else if (newXp >= 2500) newLevel = "Mastermind";
            else if (newXp >= 1000) newLevel = "Strategist";
            else if (newXp >= 500) newLevel = "Analyst";
            else if (newXp >= 100) newLevel = "Thinker";

            // Update user stats
            const updatedStat = await tx.userStat.update({
                where: { userId },
                data: {
                    xp: newXp,
                    streak: incrementStreak ? userStat.streak + 1 : userStat.streak,
                    level: newLevel
                }
            });

            // 2. If topicId is provided, record user activity
            let activity = null;
            if (topicId) {
                activity = await tx.userActivity.upsert({
                    where: {
                        userId_topicId: {
                            userId,
                            topicId
                        }
                    },
                    update: {}, // don't update anything if already completed
                    create: {
                        userId,
                        topicId,
                        status: "COMPLETED",
                        earnedXp: earnedXp || 0
                    }
                });
            }

            return { stats: updatedStat, activity };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating user stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
