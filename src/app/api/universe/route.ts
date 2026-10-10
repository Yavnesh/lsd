import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const parentSlug = searchParams.get("parentSlug");

        // 1. Root Level: Fetch all Worlds
        if (!parentSlug) {
            const worlds = await prisma.world.findMany({
                select: { id: true, name: true, slug: true, emoji: true }
            });
            return NextResponse.json({ 
                type: 'world',
                nodes: worlds.map(w => ({ ...w, progress: 0 })) // default progress
            });
        }

        // 2. Fetch Regions for a specific World
        const world = await prisma.world.findUnique({
            where: { slug: parentSlug },
            include: {
                regions: {
                    select: { id: true, name: true, slug: true }
                }
            }
        });

        if (world) {
            return NextResponse.json({
                type: 'region',
                nodes: world.regions.map(r => ({
                    ...r,
                    emoji: '🪐', // Default emoji for regions
                    progress: 0
                }))
            });
        }

        // 3. Fetch Missions for a specific Region (if we had missions seeded)
        const region = await prisma.region.findUnique({
            where: { slug: parentSlug },
            include: {
                missions: {
                    select: { id: true, name: true, slug: true }
                }
            }
        });

        if (region) {
            return NextResponse.json({
                type: 'mission',
                nodes: region.missions.map(m => ({
                    ...m,
                    emoji: '📜',
                    progress: 0
                }))
            });
        }

        return NextResponse.json({ type: 'empty', nodes: [] });

    } catch (error: any) {
        console.error("Universe API Error:", error);
        return NextResponse.json({ error: "Failed to fetch universe data", details: error?.message || String(error) }, { status: 500 });
    }
}
