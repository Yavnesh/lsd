import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserSession, setUserSession, markSessionDirty } from "@/lib/redis";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user ? (session.user as any).id : req.headers.get("x-test-user-id");
        console.log("GAME ANSWER USER ID:", userId);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { questionId, selectedIndex, timeTaken, isCorrect, xpGained } = await req.json();

        if (questionId === undefined || isCorrect === undefined) {
            return NextResponse.json({ error: "Missing answer parameters" }, { status: 400 });
        }

        // 1. Get current session from Redis
        const gameSession = await getUserSession(userId);
        if (!gameSession) {
            return NextResponse.json({ error: "No active game session found" }, { status: 404 });
        }

        // 2. Update session variables
        const answerObj = {
            questionId,
            selectedIndex,
            timeTaken: timeTaken || 0,
            isCorrect,
            answeredAt: new Date().toISOString(),
        };

        gameSession.answers.push(answerObj);
        gameSession.xpEarned += (isCorrect ? (xpGained || 20) : 0);
        
        if (!isCorrect) {
            gameSession.hearts = Math.max(0, gameSession.hearts - 1);
        }

        gameSession.dirty = true;
        gameSession.lastUpdated = Date.now();

        // 3. Persist back to Redis & flag as dirty for write-behind sync
        await setUserSession(userId, gameSession);
        await markSessionDirty(userId);

        return NextResponse.json({ success: true, session: gameSession });
    } catch (e) {
        console.error("Failed to record answer in cache:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
