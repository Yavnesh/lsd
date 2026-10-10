import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getScheduledSeasonAndDay } from "@/lib/scheduler";
import { generateDailyBatch, generateTopic } from "@/lib/generator";
import { cache } from "@/lib/cache";

export async function GET(req: NextRequest) {
    try {
        const timezone = req.nextUrl.searchParams.get("tz") || undefined;
        const dateParam = req.nextUrl.searchParams.get("date") || new Date().toISOString().slice(0, 10);
        const { season, dayOfWeek } = getScheduledSeasonAndDay(timezone, 0, dateParam);

        const cacheKey = `today-topic-${season}-${dayOfWeek}-${dateParam}`;
        const cached = cache.get<any>(cacheKey);
        if (cached) return NextResponse.json(cached);

        // Find today's topics — all quests for this season + dayOfWeek
        let todayTopics = await prisma.topic.findMany({
            where: { season, dayOfWeek, type: { not: "DRAFT" } },
            orderBy: { createdAt: "asc" }
        });

        // AUTO-GENERATE: If no topics exist for today, trigger batch generation
        if (todayTopics.length === 0) {
            console.log(`[Today Route] No topics for Season="${season}" Day=${dayOfWeek} — triggering batch generation...`);
            await generateDailyBatch(season, dayOfWeek);
            todayTopics = await prisma.topic.findMany({
                where: { season, dayOfWeek, type: { not: "DRAFT" } },
                orderBy: { createdAt: "asc" }
            });
        }

        // Still nothing? Fall back to single topic generation (legacy)
        if (todayTopics.length === 0) {
            console.log(`[Today Route] Batch failed — falling back to single topic generation`);
            const generated = await generateTopic(season, dayOfWeek);
            const existing = await prisma.topic.findUnique({ where: { slug: generated.slug } });
            if (!existing) {
                const created = await prisma.topic.create({
                    data: {
                        title: generated.title,
                        slug: generated.slug,
                        emoji: generated.emoji,
                        summary: generated.summary,
                        season: generated.season,
                        cluster: generated.cluster,
                        dayOfWeek: generated.dayOfWeek,
                        isPremium: generated.isPremium,
                        content: JSON.stringify(generated.contentBlocks)
                    }
                });
                todayTopics = [created];
            } else {
                todayTopics = [existing];
            }
        }

        // Pick a free topic as "today's featured quest", rotating by dayOfWeek
        const freeTopics = todayTopics.filter(t => !t.isPremium);
        const candidateTopics = freeTopics.length > 0 ? freeTopics : todayTopics;
        const featuredIndex = (dayOfWeek - 1) % candidateTopics.length;
        const freeTopic = candidateTopics[featuredIndex] || candidateTopics[0];

        // Parse content blocks
        const parsedContent = freeTopic.content ? JSON.parse(freeTopic.content) : [];

        // Build prediction from prediction or hook block
        const predictionBlock = parsedContent.find((b: any) => b.type === "prediction");
        const revealBlock = parsedContent.find((b: any) => b.type === "reveal");
        const hookText = parsedContent.find((b: any) => b.type === "mission_brief")?.text
            || parsedContent.find((b: any) => b.type === "hook")?.text
            || "Every day is an opportunity to learn something surprising about how you think.";
        const prediction = {
            statement: predictionBlock?.question || hookText,
            correctAnswer: true,
            explanation: revealBlock?.text || parsedContent.find((b: any) => b.type === "meme")?.explanation || "Teachable moment."
        };

        // Tomorrow's teaser
        const tomorrowSchedule = getScheduledSeasonAndDay(timezone, 1, dateParam);
        const tomorrowTopic = await prisma.topic.findFirst({
            where: { season: tomorrowSchedule.season, dayOfWeek: tomorrowSchedule.dayOfWeek }
        });
        const tomorrowTeaser = {
            title: tomorrowTopic?.title || `New Quest: ${tomorrowSchedule.season}`,
            emoji: tomorrowTopic?.emoji || "💡",
            isPremium: tomorrowSchedule.dayOfWeek >= 6
        };

        const responseData = {
            ...freeTopic,
            content: parsedContent,
            prediction,
            tomorrow: tomorrowTeaser,
            // Expose how many quests are available today so UI can show "X quests today"
            totalQuestsToday: todayTopics.length,
        };

        cache.set(cacheKey, responseData, 60);
        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error("Error fetching today's topic:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
