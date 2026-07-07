import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDirtySessions, getUserSession, clearDirtyFlag } from "@/lib/redis";

export async function POST(req: NextRequest) {
    try {
        // Optional secret key check to prevent unauthorized flushes
        const authHeader = req.headers.get("Authorization");
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dirtyUserIds = await getDirtySessions();
        let flushedCount = 0;

        for (const userId of dirtyUserIds) {
            const gameSession = await getUserSession(userId);
            if (!gameSession) {
                // Stale dirty record, just clear flag
                await clearDirtyFlag(userId);
                continue;
            }

            // Sync dirty session data to DB
            await prisma.$transaction(async (tx) => {
                // Upsert UserActivity status (in progress or completed)
                await tx.userActivity.upsert({
                    where: {
                        userId_topicId: {
                            userId,
                            topicId: gameSession.topicId,
                        },
                    },
                    create: {
                        userId,
                        topicId: gameSession.topicId,
                        status: "IN_PROGRESS",
                        earnedXp: gameSession.xpEarned,
                    },
                    update: {
                        earnedXp: gameSession.xpEarned,
                    },
                });

                // Increment user XP stats
                const stats = await tx.userStat.findUnique({ where: { userId } });
                if (stats) {
                    await tx.userStat.update({
                        where: { userId },
                        data: {
                            xp: stats.xp + gameSession.xpEarned,
                        },
                    });
                }
            });

            // Mark session clean
            gameSession.dirty = false;
            await clearDirtyFlag(userId);
            flushedCount++;
        }

        return NextResponse.json({ success: true, flushedSessionsCount: flushedCount });
    } catch (e) {
        console.error("Failed to run cache synchronization worker:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
