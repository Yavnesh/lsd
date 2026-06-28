import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getScheduledSeasonAndDay } from "@/lib/scheduler";
import { generateTopic } from "@/lib/generator";
import { cache } from "@/lib/cache";

export async function GET(req: NextRequest) {
    try {
        // Read client timezone from query param
        const timezone = req.nextUrl.searchParams.get("tz") || undefined;
        const { season, dayOfWeek } = getScheduledSeasonAndDay(timezone);

        const cacheKey = `today-topic-${season}-${dayOfWeek}`;
        const cached = cache.get<any>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Find the topic corresponding to today's schedule
        let topic = await prisma.topic.findFirst({
            where: {
                season,
                dayOfWeek
            }
        });

        // Auto-generation: If no topic is found, generate it using the AI content generator
        if (!topic) {
            console.log(`No topic found for Season: "${season}", Day: ${dayOfWeek}. Triggering AI generator...`);
            const generated = await generateTopic(season, dayOfWeek);
            
            // Check if another request created it concurrently
            topic = await prisma.topic.findUnique({
                where: { slug: generated.slug }
            });

            if (!topic) {
                topic = await prisma.topic.create({
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
            }
        }

        // Parse content JSON block
        const parsedContent = topic.content ? JSON.parse(topic.content) : [];

        const responseData = {
            ...topic,
            content: parsedContent
        };

        // Cache the formatted topic for 1 minute
        cache.set(cacheKey, responseData, 60);

        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error("Error fetching today's topic:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
