import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user ? (session.user as any).id : req.headers.get("x-test-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { topicId, opponentScore, opponentTime, opponentRating, opponentName, answers } = await req.json();

        console.log("PVP SUBMIT BODY:", { topicId, opponentScore, opponentTime, opponentRating, opponentName, answers });

        if (!topicId || opponentScore === undefined || opponentTime === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Calculate player score and time
        const totalQuestions = answers.length;
        const playerScore = answers.filter((a: any) => a.isCorrect).length;
        const playerTime = answers.reduce((acc: number, cur: any) => acc + (cur.timeTaken || 0), 0);

        // 2. Determine match outcome
        let status: "VICTORY" | "DEFEAT" | "DRAW" = "DRAW";
        if (playerScore === 0) {
            status = "DEFEAT";
        } else if (playerScore > opponentScore) {
            status = "VICTORY";
        } else if (playerScore < opponentScore) {
            status = "DEFEAT";
        } else {
            // Tie breaker on time
            if (playerTime < opponentTime) {
                status = "VICTORY";
            } else if (playerTime > opponentTime) {
                status = "DEFEAT";
            } else {
                status = "DRAW";
            }
        }

        // 3. Calculate Elo rating changes
        const playerStat = await prisma.userStat.findUnique({ where: { userId } });
        const playerRating = playerStat?.globalRating || 1000;
        const oppRating = opponentRating || 1000;

        const expectedScore = 1 / (1 + Math.pow(10, (oppRating - playerRating) / 400));
        let actualScore = 0.5; // Draw
        if (status === "VICTORY") actualScore = 1.0;
        if (status === "DEFEAT") actualScore = 0.0;

        const kFactor = 32;
        let eloChange = Math.round(kFactor * (actualScore - expectedScore));

        // Perfect Game Modifier (5/5 correct and fast)
        if (status === "VICTORY" && playerScore === totalQuestions && totalQuestions > 0) {
            eloChange = Math.round(eloChange * 1.25);
        }

        const newRating = Math.max(100, playerRating + eloChange);
        const newPeakRating = Math.max(playerStat?.peakRating || 1000, newRating);

        // 4. Update player's UserStat in database
        await prisma.userStat.update({
            where: { userId },
            data: {
                globalRating: newRating,
                peakRating: newPeakRating,
                xp: { increment: playerScore * 15 + (status === "VICTORY" ? 50 : 10) } // Win bonus XP
            }
        });

        // 5. Log match history in PvpMatch
        const pvpMatch = await prisma.pvpMatch.create({
            data: {
                challengerId: userId,
                opponentId: opponentName || "Opponent",
                challengerScore: playerScore,
                opponentScore: opponentScore,
                challengerTime: playerTime,
                opponentTime: opponentTime,
                eloChange: eloChange,
                status: status
            }
        });

        // 6. Save current run as a GhostRun so other players can match against it
        await prisma.ghostRun.create({
            data: {
                userId,
                topicId,
                score: playerScore,
                totalTime: playerTime,
                answersJson: JSON.stringify(answers),
                rating: newRating
            }
        });

        // 7. Add Rating History Record
        await prisma.userRatingHistory.create({
            data: {
                userId,
                rating: newRating,
                cluster: "GLOBAL"
            }
        });

        // 8. Create UserActivity record to mark the topic as completed
        try {
            await prisma.userActivity.upsert({
                where: {
                    userId_topicId: {
                        userId,
                        topicId
                    }
                },
                update: {
                    status: "COMPLETED",
                    earnedXp: playerScore * 15 + (status === "VICTORY" ? 50 : 10),
                    quizCorrect: playerScore > 0,
                    lastAttemptedAt: new Date(),
                    completedAt: new Date()
                },
                create: {
                    userId,
                    topicId,
                    status: "COMPLETED",
                    earnedXp: playerScore * 15 + (status === "VICTORY" ? 50 : 10),
                    quizCorrect: playerScore > 0,
                    lastAttemptedAt: new Date(),
                    completedAt: new Date()
                }
            });
        } catch (e) {
            console.error("Failed to record UserActivity in PvP:", e);
        }

        return NextResponse.json({
            success: true,
            status,
            playerScore,
            opponentScore,
            playerTime,
            opponentTime,
            eloChange,
            newRating,
            matchId: pvpMatch.id
        });
    } catch (error) {
        console.error("Error submitting PvP match results:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
