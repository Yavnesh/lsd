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

        // Dynamic streak healing & shield consumption
        const { streak: calculatedStreak, shieldsConsumed } = calculateStreak(activities, timezone, userStats?.streakShields || 0);
        if (userStats && (userStats.streak !== calculatedStreak || shieldsConsumed > 0)) {
            userStats = await prisma.userStat.update({
                where: { userId },
                data: { 
                    streak: calculatedStreak,
                    streakShields: Math.max(0, userStats.streakShields - shieldsConsumed)
                }
            });
        }

        return NextResponse.json({
            stats: userStats || { xp: 0, streak: 0, level: "Curious Mind", streakShields: 1 },
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
                        level: "Curious Mind",
                        streakShields: 1
                    }
                });
            }

            // 2. Roll variable bonus rewards if correct
            let bonusXpEarned = 0;
            let bonusShieldsEarned = 0;
            let unlockedChest = null;

            if (quizCorrect && topicId) {
                // Check if they completed it before today
                const alreadyCompleted = await tx.userActivity.findFirst({
                    where: { userId, topicId, status: "COMPLETED" }
                });
                
                if (!alreadyCompleted) {
                    const rand = Math.random();
                    if (rand < 0.70) {
                        bonusXpEarned = [10, 20, 30, 50][Math.floor(Math.random() * 4)];
                        unlockedChest = { type: "XP", amount: bonusXpEarned, label: `+${bonusXpEarned} Bonus XP` };
                    } else if (rand < 0.90) {
                        bonusShieldsEarned = 1;
                        unlockedChest = { type: "SHIELD", amount: 1, label: "+1 Streak Shield" };
                    } else {
                        unlockedChest = { type: "BADGE", label: "Rare Badge Unlocked!" };
                    }
                }
            }

            // Calculate new XP
            const actualXpToAdd = quizCorrect === false ? 0 : (xpToAdd || 0);
            const newXp = userStat.xp + actualXpToAdd + bonusXpEarned;

            // Calculate new level based on XP
            let newLevel = userStat.level;
            if (newXp >= 5000) newLevel = "Sage";
            else if (newXp >= 2500) newLevel = "Mastermind";
            else if (newXp >= 1000) newLevel = "Strategist";
            else if (newXp >= 500) newLevel = "Analyst";
            else if (newXp >= 100) newLevel = "Thinker";

            // 3. Record activity first
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

            // 4. Compute dynamic streak from all activities
            const allActivities = await tx.userActivity.findMany({
                where: { userId, status: "COMPLETED" },
                orderBy: { completedAt: "desc" }
            });
            const { streak: computedStreak, shieldsConsumed } = calculateStreak(allActivities, timezone || "UTC", userStat.streakShields);

            // Update user stats
            const updatedStat = await tx.userStat.update({
                where: { userId },
                data: {
                    xp: newXp,
                    streak: computedStreak,
                    streakShields: Math.max(0, userStat.streakShields - shieldsConsumed + bonusShieldsEarned),
                    level: newLevel
                }
            });

            // Retrieve created activity
            const activity = topicId ? await tx.userActivity.findUnique({
                where: { userId_topicId: { userId, topicId } }
            }) : null;

            return { stats: updatedStat, activity, unlockedChest };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating user stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
