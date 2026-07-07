import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redis, setUserSession, getUserSession } from "@/lib/redis";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user ? (session.user as any).id : req.headers.get("x-test-user-id");
        console.log("GAME START USER ID:", userId);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { topicId, isPvp } = await req.json();

        if (!topicId) {
            return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
        }

        // 1. Get stats from DB
        let userStats = await prisma.userStat.findUnique({
            where: { userId },
        });

        if (!userStats) {
            userStats = await prisma.userStat.create({
                data: {
                    userId,
                    xp: 0,
                    streak: 0,
                    level: "Curious Mind",
                },
            });
        }

        // Get heart count from store or database logic.
        // We will read hearts from redis first (so we don't overwrite if they lost a heart in a parallel quest)
        // If not found in redis, we read it from localStorage sync or default to 3.
        // Since hearts are stored on the user store, we can initialize it to 3 or read from client.
        // For security, the backend keeps session hearts:
        const existingSession = await getUserSession(userId);
        let startHearts = 3;
        if (existingSession) {
            startHearts = existingSession.hearts !== undefined ? existingSession.hearts : 3;
        }

        const gameSession = {
            sessionId: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            topicId,
            isPvp: !!isPvp,
            startedAt: new Date().toISOString(),
            currentStage: 0,
            answers: [],
            xpEarned: 0,
            coinsEarned: 0,
            hearts: startHearts,
            dirty: false,
        };

        // Cache the session in Redis
        await setUserSession(userId, gameSession);

        return NextResponse.json({ success: true, session: gameSession });
    } catch (e) {
        console.error("Failed to start game session:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
