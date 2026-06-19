import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getScheduledSeasonAndDay } from "@/lib/scheduler";

export async function GET() {
    try {
        const { season, dayOfWeek } = getScheduledSeasonAndDay();

        // Find the topic corresponding to today's schedule
        let topic = await prisma.topic.findFirst({
            where: {
                season,
                dayOfWeek
            }
        });

        // Fallback: If no topic is found for the exact schedule, serve the first available topic
        if (!topic) {
            topic = await prisma.topic.findFirst();
        }

        if (!topic) {
            return NextResponse.json({ error: "No topics found in the database." }, { status: 404 });
        }

        // Parse content JSON block
        const parsedContent = topic.content ? JSON.parse(topic.content) : [];

        return NextResponse.json({
            ...topic,
            content: parsedContent
        });
    } catch (error: any) {
        console.error("Error fetching today's topic:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
