import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getScheduledSeasonAndDay } from "@/lib/scheduler";
import { generateDailyBatch, generateTopic } from "@/lib/generator";
import { cache } from "@/lib/cache";

export async function GET(req: NextRequest) {
    try {
        const timezone = req.nextUrl.searchParams.get("tz") || undefined;
        const dateParam = req.nextUrl.searchParams.get("date") || new Date().toISOString().slice(0, 10);
        const { season, dayOfWeek } = getScheduledSeasonAndDay(timezone);

        const cacheKey = `today-topic-${season}-${dayOfWeek}-${dateParam}`;
        const cached = cache.get<any>(cacheKey);
        if (cached) return NextResponse.json(cached);

        // Find today's topics — all quests for this season + dayOfWeek
        let todayTopics = await prisma.topic.findMany({
            where: { season, dayOfWeek },
            orderBy: { createdAt: "asc" }
        });

        // AUTO-GENERATE: If no topics exist for today, trigger batch generation
        if (todayTopics.length === 0) {
            console.log(`[Today Route] No topics for Season="${season}" Day=${dayOfWeek} — triggering batch generation...`);
            await generateDailyBatch(season, dayOfWeek);
            todayTopics = await prisma.topic.findMany({
                where: { season, dayOfWeek },
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

        // Pick the first free topic as "today's featured quest"
        const freeTopic = todayTopics.find(t => !t.isPremium) || todayTopics[0];

        // Parse content blocks
        const parsedContent = freeTopic.content ? JSON.parse(freeTopic.content) : [];

        // Build prediction from hook block
        const hookText = parsedContent.find((b: any) => b.type === "hook")?.text
            || "Every day is an opportunity to learn something surprising about how you think.";
        const prediction = {
            statement: hookText,
            correctAnswer: true,
            explanation: parsedContent.find((b: any) => b.type === "meme")?.explanation || "Teachable moment."
        };

        // Tomorrow's teaser
        const tomorrowSchedule = getScheduledSeasonAndDay(timezone, 1);
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
