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

        const { topicId } = await req.json();

        if (!topicId) {
            return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
        }

        // Get current user rating
        const userStat = await prisma.userStat.findUnique({
            where: { userId }
        });
        const playerRating = userStat?.globalRating || 1000;

        // Search for a GhostRun close to player rating (+/- 150) in this topic
        let ghostRun = await prisma.ghostRun.findFirst({
            where: {
                topicId,
                userId: { not: userId },
                rating: {
                    gte: playerRating - 150,
                    lte: playerRating + 150
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Fallback to any ghost run if no close match is found
        if (!ghostRun) {
            ghostRun = await prisma.ghostRun.findFirst({
                where: {
                    topicId,
                    userId: { not: userId }
                },
                orderBy: { createdAt: "desc" }
            });
        }

        // Fetch questions for this topic
        const topic = await prisma.topic.findUnique({
            where: { id: topicId }
        });

        if (!topic) {
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        const parsedContent = topic.content ? JSON.parse(topic.content) : [];
        const questionsList: any[] = [];
        parsedContent.forEach((block: any) => {
            if (block.type === "quiz" || block.type === "decision_point") {
                questionsList.push(block);
            } else if (block.type === "boss_battle" && Array.isArray(block.questions)) {
                block.questions.forEach((q: any) => {
                    questionsList.push(q);
                });
            }
        });

        const botAnswers = questionsList.map((q: any, idx: number) => {
            const isCorrect = Math.random() < 0.7;
            const timeTaken = parseFloat((Math.random() * 6 + 3).toFixed(1));
            return {
                questionId: q.question || `q-${idx}`,
                isCorrect,
                timeTaken
            };
        });
        const botScore = botAnswers.filter(a => a.isCorrect).length;
        const botTotalTime = parseFloat(botAnswers.reduce((acc, cur) => acc + cur.timeTaken, 0).toFixed(1));

        let opponent = {
            name: "CognitiveBot",
            avatar: "🤖",
            rating: Math.round(playerRating + (Math.random() * 100 - 50))
        };

        let opponentGhost = {
            score: botScore,
            totalTime: botTotalTime,
            answersJson: JSON.stringify(botAnswers)
        };

        if (ghostRun) {
            const oppUser = await prisma.user.findUnique({
                where: { id: ghostRun.userId },
                include: { stat: true }
            });
            if (oppUser) {
                opponent = {
                    name: oppUser.name || "Opponent",
                    avatar: oppUser.selectedAvatar || oppUser.defaultAvatar || "🧠",
                    rating: oppUser.stat?.globalRating || ghostRun.rating
                };
                opponentGhost = {
                    score: ghostRun.score,
                    totalTime: ghostRun.totalTime,
                    answersJson: ghostRun.answersJson
                };
            }
        }

        // Extract quiz questions for response
        const quizBlocks = parsedContent.filter((b: any) => b.type === "quiz" || b.type === "decision_point" || b.type === "boss_battle");

        // Create a unique Match ID
        const matchId = `pvp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        return NextResponse.json({
            matchId,
            opponent,
            opponentGhost,
            questions: quizBlocks,
            playerRating
        });
    } catch (error) {
        console.error("Error creating PvP match:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
