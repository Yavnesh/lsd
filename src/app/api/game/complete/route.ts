import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getUserSession, deleteUserSession, clearDirtyFlag } from "@/lib/redis";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user ? (session.user as any).id : req.headers.get("x-test-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get current active session from Redis
        const gameSession = await getUserSession(userId);
        if (!gameSession) {
            return NextResponse.json({ error: "No active game session found" }, { status: 404 });
        }

        // 2. Immediate Flush Event: Persist to Postgres database atomically
        await prisma.$transaction(async (tx) => {
            // Upsert UserActivity record as COMPLETED
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
                    status: "COMPLETED",
                    earnedXp: gameSession.xpEarned,
                },
                update: {
                    status: "COMPLETED",
                    earnedXp: gameSession.xpEarned,
                },
            });

            // Update user global stats
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

        // 3. Cleanup session caches
        await deleteUserSession(userId);
        await clearDirtyFlag(userId);

        return NextResponse.json({ success: true, xpEarned: gameSession.xpEarned });
    } catch (e) {
        console.error("Failed to complete game session:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
