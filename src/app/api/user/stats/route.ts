import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { calculateStreak } from "@/lib/streak";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const timezone = req.nextUrl.searchParams.get("tz") || "UTC";

        let userStats = await prisma.userStat.findUnique({
            where: { userId },
        });

        const activities = await prisma.userActivity.findMany({
            where: { userId },
            include: { topic: true },
            orderBy: { completedAt: "desc" }
        });

        // Dynamic streak healing
        const calculatedStreak = calculateStreak(activities, timezone);
        if (userStats && userStats.streak !== calculatedStreak) {
            userStats = await prisma.userStat.update({
                where: { userId },
                data: { streak: calculatedStreak }
            });
        }

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
        const { xpToAdd, topicId, earnedXp, quizCorrect, selectedOptionIndex, timezone } = await req.json();

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
            const actualXpToAdd = quizCorrect === false ? 0 : (xpToAdd || 0);
            const newXp = userStat.xp + actualXpToAdd;

            // Calculate new level based on XP
            let newLevel = userStat.level;
            if (newXp >= 5000) newLevel = "Sage";
            else if (newXp >= 2500) newLevel = "Mastermind";
            else if (newXp >= 1000) newLevel = "Strategist";
            else if (newXp >= 500) newLevel = "Analyst";
            else if (newXp >= 100) newLevel = "Thinker";

            // 2. Record activity first
            if (topicId) {
                await tx.userActivity.upsert({
                    where: {
                        userId_topicId: {
                            userId,
                            topicId
                        }
                    },
                    update: {
                        status: quizCorrect === false ? "FAILED" : "COMPLETED",
                        selectedOptionIndex: selectedOptionIndex !== undefined ? selectedOptionIndex : null,
                        quizCorrect: quizCorrect !== undefined ? quizCorrect : null,
                        lastAttemptedAt: new Date(),
                        completedAt: quizCorrect === false ? undefined : new Date()
                    },
                    create: {
                        userId,
                        topicId,
                        status: quizCorrect === false ? "FAILED" : "COMPLETED",
                        earnedXp: quizCorrect === false ? 0 : (earnedXp || 0),
                        selectedOptionIndex: selectedOptionIndex !== undefined ? selectedOptionIndex : null,
                        quizCorrect: quizCorrect !== undefined ? quizCorrect : null,
                        lastAttemptedAt: new Date(),
                        completedAt: new Date()
                    }
                });
            }

            // 3. Compute dynamic streak from all activities
            const allActivities = await tx.userActivity.findMany({
                where: { userId, status: "COMPLETED" },
                orderBy: { completedAt: "desc" }
            });
            const computedStreak = calculateStreak(allActivities, timezone || "UTC");

            // Update user stats
            const updatedStat = await tx.userStat.update({
                where: { userId },
                data: {
                    xp: newXp,
                    streak: computedStreak,
                    level: newLevel
                }
            });

            // Retrieve created activity
            const activity = topicId ? await tx.userActivity.findUnique({
                where: { userId_topicId: { userId, topicId } }
            }) : null;

            return { stats: updatedStat, activity };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating user stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
