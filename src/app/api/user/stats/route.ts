import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { calculateStreak } from "@/lib/streak";
import { calculateEloUpdate } from "@/lib/rating";

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
            select: {
                id: true,
                userId: true,
                topicId: true,
                status: true,
                earnedXp: true,
                selectedOptionIndex: true,
                quizCorrect: true,
                lastAttemptedAt: true,
                completedAt: true,
                topic: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        emoji: true,
                        cluster: true,
                        season: true
                    }
                }
            },
            orderBy: { lastAttemptedAt: "desc" }
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

        const topicRatings = await prisma.userTopicRating.findMany({
            where: { userId },
            orderBy: { rating: "desc" }
        });

        const ratingHistory = await prisma.userRatingHistory.findMany({
            where: { userId },
            orderBy: { recordedAt: "desc" },
            take: 20
        });
        ratingHistory.reverse();

        return NextResponse.json({
            stats: userStats || { xp: 0, streak: 0, level: "Curious Mind", streakShields: 1, globalRating: 1000, peakRating: 1000 },
            activities,
            topicRatings,
            ratingHistory
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

        // ─── PHASE 1: Core XP + Activity write (fast, minimal transaction) ────────
        const phase1 = await prisma.$transaction(async (tx) => {
            // Get or create user stats
            let userStat = await tx.userStat.findUnique({ where: { userId } });
            if (!userStat) {
                userStat = await tx.userStat.create({
                    data: { userId, xp: 0, streak: 0, level: "Curious Mind", streakShields: 1, globalRating: 1000, peakRating: 1000 }
                });
            }

            // Roll bonus rewards (only on first completion)
            let bonusXpEarned = 0;
            let bonusShieldsEarned = 0;
            let unlockedChest = null;

            if (quizCorrect === true && topicId) {
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

            // Calculate level
            let newLevel = userStat.level;
            if (newXp >= 5000) newLevel = "Sage";
            else if (newXp >= 2500) newLevel = "Mastermind";
            else if (newXp >= 1000) newLevel = "Strategist";
            else if (newXp >= 500) newLevel = "Analyst";
            else if (newXp >= 100) newLevel = "Thinker";

            // Upsert activity record
            if (topicId) {
                await tx.userActivity.upsert({
                    where: { userId_topicId: { userId, topicId } },
                    update: {
                        status: quizCorrect === false ? "FAILED" : "COMPLETED",
                        earnedXp: quizCorrect === false ? 0 : (earnedXp || 0) + bonusXpEarned,
                        selectedOptionIndex: selectedOptionIndex ?? null,
                        quizCorrect: quizCorrect ?? null,
                        lastAttemptedAt: new Date(),
                        completedAt: quizCorrect === false ? undefined : new Date()
                    },
                    create: {
                        userId,
                        topicId,
                        status: quizCorrect === false ? "FAILED" : "COMPLETED",
                        earnedXp: quizCorrect === false ? 0 : (earnedXp || 0) + bonusXpEarned,
                        selectedOptionIndex: selectedOptionIndex ?? null,
                        quizCorrect: quizCorrect ?? null,
                        lastAttemptedAt: new Date(),
                        completedAt: new Date()
                    }
                });
            }

            // Compute streak from all completed activities
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

            return { updatedStat, bonusXpEarned, bonusShieldsEarned, unlockedChest, earnedXp, quizCorrect };
        }, { timeout: 10000 });

        // ─── PHASE 2: Elo rating update (separate, non-blocking) ─────────────────
        let ratingChanges = null;
        try {
            if (topicId && quizCorrect !== undefined) {
                const topic = await prisma.topic.findUnique({ where: { id: topicId } });
                if (topic) {
                    const cluster = topic.cluster || "General";
                    const topicRatingRecord = await prisma.userTopicRating.findUnique({
                        where: { userId_cluster: { userId, cluster } }
                    }) ?? { rating: 1000, peakRating: 1000 };

                    const isSucc = quizCorrect === true;
                    const { playerChange, questChange } = calculateEloUpdate(
                        topicRatingRecord.rating,
                        topic.difficultyRating || 1200,
                        isSucc,
                        { attempts: isSucc ? 1 : 2 }
                    );

                    const newTopicRating = Math.max(800, topicRatingRecord.rating + playerChange);
                    const newTopicPeak = Math.max(topicRatingRecord.peakRating, newTopicRating);

                    await prisma.userTopicRating.upsert({
                        where: { userId_cluster: { userId, cluster } },
                        update: { rating: newTopicRating, peakRating: newTopicPeak },
                        create: { userId, cluster, rating: newTopicRating, peakRating: newTopicPeak }
                    });

                    // Update quest difficulty
                    const newDifficulty = Math.max(800, Math.min(3000, (topic.difficultyRating || 1200) + questChange));
                    await prisma.topic.update({ where: { id: topicId }, data: { difficultyRating: newDifficulty } });

                    // Recalculate global brain rating
                    const activeRatings = await prisma.userTopicRating.findMany({ where: { userId } });
                    const avgGlobal = activeRatings.length > 0
                        ? Math.round(activeRatings.reduce((acc, r) => acc + r.rating, 0) / activeRatings.length)
                        : 1000;
                    const finalGlobalRating = Math.max(800, avgGlobal);
                    const finalGlobalPeak = Math.max(phase1.updatedStat.peakRating || 1000, finalGlobalRating);

                    // Record history snapshots
                    await Promise.all([
                        prisma.userRatingHistory.create({ data: { userId, rating: newTopicRating, cluster } }),
                        prisma.userRatingHistory.create({ data: { userId, rating: finalGlobalRating, cluster: "GLOBAL" } }),
                        prisma.userStat.update({
                            where: { userId },
                            data: { globalRating: finalGlobalRating, peakRating: finalGlobalPeak }
                        })
                    ]);

                    ratingChanges = {
                        cluster,
                        categoryChange: playerChange,
                        newCategoryRating: newTopicRating,
                        globalChange: finalGlobalRating - (phase1.updatedStat.globalRating || 1000),
                        newGlobalRating: finalGlobalRating
                    };
                }
            }
        } catch (eloErr) {
            // Elo update failure is non-critical — activity and XP are already saved
            console.error("Elo update failed (non-critical):", eloErr);
        }

        // Fetch the final activity record to return
        const activity = topicId ? await prisma.userActivity.findUnique({
            where: { userId_topicId: { userId, topicId } }
        }) : null;

        return NextResponse.json({
            stats: phase1.updatedStat,
            activity,
            unlockedChest: phase1.unlockedChest,
            ratingChanges
        });

    } catch (error) {
        console.error("Error updating user stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
