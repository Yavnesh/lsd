import { NextRequest, NextResponse } from "next/server";
import { generateDailyBatch } from "@/lib/generator";
import { getScheduledSeasonAndDay } from "@/lib/scheduler";
import { cache } from "@/lib/cache";

/**
 * POST /api/admin/generate-daily
 *
 * Generates 5 unique daily quests for today's season world.
 * Protected by CRON_SECRET header.
 *
 * Can be triggered:
 *   1. By a cron job (Vercel Cron / GitHub Actions) with Authorization header
 *   2. Manually from admin panel
 *   3. By running: curl -X POST http://localhost:3000/api/admin/generate-daily \
 *        -H "Authorization: Bearer YOUR_CRON_SECRET" -H "Content-Type: application/json"
 *
 * Supports optional body:
 *   { "season": "...", "dayOfWeek": 1 }  — to generate for a specific day/season
 *   { "seedAll": true }                  — to seed all 5 seasons × 7 days (35 topics)
 */
export async function POST(req: NextRequest) {
    // Auth check
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "lsd-dev-secret";

    const isAdminToken = authHeader === `Bearer ${cronSecret}`;
    const isLocalDev = process.env.NODE_ENV === "development" && !authHeader; // Allow unauthenticated in dev

    if (!isAdminToken && !isLocalDev) {
        return NextResponse.json({ error: "Unauthorized. Provide Authorization: Bearer <CRON_SECRET>" }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const tz = req.nextUrl.searchParams.get("tz") || "Asia/Kolkata";

        // Check if full seed was requested
        if (body.seedAll === true) {
            return await seedAllSeasons(tz);
        }

        // Default: generate for today
        let { season, dayOfWeek } = body;
        if (!season || !dayOfWeek) {
            const scheduled = getScheduledSeasonAndDay(tz);
            season = season || scheduled.season;
            dayOfWeek = dayOfWeek || scheduled.dayOfWeek;
        }

        console.log(`[Daily Generator] Generating 5 quests for: Season="${season}", Day=${dayOfWeek}`);

        const result = await generateDailyBatch(season, dayOfWeek);

        // Bust relevant caches
        cache.delete("all-topics");
        const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: tz });
        cache.delete(`today-topic-${season}-${dayOfWeek}-${todayKey}`);

        return NextResponse.json({
            success: true,
            message: `Generated ${result.created} new topics, skipped ${result.skipped} existing`,
            season,
            dayOfWeek,
            ...result,
        });

    } catch (err: any) {
        console.error("[Daily Generator] Error:", err);
        return NextResponse.json({ error: "Generation failed", details: err.message }, { status: 500 });
    }
}

/**
 * GET /api/admin/generate-daily
 * Returns current DB topic stats — no auth required for read
 */
export async function GET(req: NextRequest) {
    const { prisma } = await import("@/lib/prisma").then(m => ({ prisma: m.default }));
    const tz = req.nextUrl.searchParams.get("tz") || "Asia/Kolkata";
    const { season, dayOfWeek } = getScheduledSeasonAndDay(tz);

    const [total, todayTopics, allBySeasonDay] = await Promise.all([
        prisma.topic.count(),
        prisma.topic.findMany({
            where: { season, dayOfWeek },
            select: { id: true, title: true, cluster: true, emoji: true, isPremium: true, createdAt: true }
        }),
        prisma.topic.groupBy({
            by: ["season", "dayOfWeek"],
            _count: { id: true },
            orderBy: [{ season: "asc" }, { dayOfWeek: "asc" }]
        })
    ]);

    return NextResponse.json({
        currentSeason: season,
        currentDayOfWeek: dayOfWeek,
        totalTopics: total,
        todayQuestCount: todayTopics.length,
        todayQuests: todayTopics,
        topicMatrix: allBySeasonDay.map(r => ({
            season: r.season,
            dayOfWeek: r.dayOfWeek,
            count: r._count.id
        }))
    });
}

// ─────────────────────────────────────────────────────────────────
// Seed ALL seasons × all 7 days (35 total unique topic combinations)
// Only runs once per slug — safe to call multiple times
// ─────────────────────────────────────────────────────────────────
async function seedAllSeasons(tz: string) {
    const seasons = [
        "Understand Yourself",
        "Surviving The Internet",
        "Your Body Explained",
        "Think Better",
        "Money Without The Boring Stuff",
    ];

    let totalCreated = 0;
    let totalSkipped = 0;
    const allErrors: string[] = [];

    for (const season of seasons) {
        for (let day = 1; day <= 7; day++) {
            const result = await generateDailyBatch(season, day);
            totalCreated += result.created;
            totalSkipped += result.skipped;
            allErrors.push(...result.errors);

            // Small delay between batches
            await new Promise(r => setTimeout(r, 200));
        }
    }

    // Bust all caches
    cache.delete("all-topics");

    return NextResponse.json({
        success: true,
        message: `Full seed complete: ${totalCreated} created, ${totalSkipped} skipped`,
        totalCreated,
        totalSkipped,
        errors: allErrors,
    });
}
