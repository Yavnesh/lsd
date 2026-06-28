import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { cache } from "@/lib/cache";

export async function POST(req: Request) {
    try {
        // Enforce RBAC: Check session and user role
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if ((session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
        }

        const payload = await req.json();
        const { title, slug, emoji, summary, season, cluster, dayOfWeek, isPremium, contentBlocks } = payload;

        if (!title || !slug) {
            return NextResponse.json({ error: "Title and slug are required fields." }, { status: 400 });
        }

        const newTopic = await prisma.topic.upsert({
            where: { slug },
            update: {
                title,
                emoji,
                summary,
                season,
                cluster,
                dayOfWeek: parseInt(dayOfWeek) || null,
                isPremium: !!isPremium,
                content: JSON.stringify(contentBlocks)
            },
            create: {
                title,
                slug,
                emoji,
                summary,
                season,
                cluster,
                dayOfWeek: parseInt(dayOfWeek) || null,
                isPremium: !!isPremium,
                content: JSON.stringify(contentBlocks)
            }
        });

        // Invalidate topics cache
        cache.delete("all-topics");

        return NextResponse.json({ success: true, topic: newTopic });
    } catch (error: any) {
        console.error("Error creating topic in admin panel:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
