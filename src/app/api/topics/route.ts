import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cache } from "@/lib/cache";

export async function GET() {
    try {
        const cacheKey = "all-topics";
        const cached = cache.get<any[]>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const topics = await prisma.topic.findMany({
            where: {
                type: { not: "DRAFT" }
            },
            orderBy: [
                { season: "asc" },
                { dayOfWeek: "asc" }
            ]
        });

        // Map and parse the content if needed
        const formattedTopics = topics.map(t => ({
            ...t,
            content: t.content ? JSON.parse(t.content) : []
        }));

        cache.set(cacheKey, formattedTopics, 120); // Cache for 2 minutes

        return NextResponse.json(formattedTopics);
    } catch (error) {
        console.error("Error fetching topics archive:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
