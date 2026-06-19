import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const topics = await prisma.topic.findMany({
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

        return NextResponse.json(formattedTopics);
    } catch (error) {
        console.error("Error fetching topics archive:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
