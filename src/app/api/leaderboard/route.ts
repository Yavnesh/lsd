import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { cache } from "@/lib/cache";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user ? (session.user as any).id : null;

        // Try getting cached top listings
        const cacheKey = "leaderboard-top-lists";
        let listings = cache.get<{ topXp: any[]; topStreak: any[] }>(cacheKey);

        if (!listings) {
            // Fetch top users in parallel
            const [topXpUsers, topStreakUsers] = await Promise.all([
                prisma.userStat.findMany({
                    take: 10,
                    orderBy: { xp: "desc" },
                    select: {
                        xp: true,
                        streak: true,
                        level: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                                selectedAvatar: true
                            }
                        }
                    }
                }),
                prisma.userStat.findMany({
                    take: 10,
                    orderBy: { streak: "desc" },
                    select: {
                        xp: true,
                        streak: true,
                        level: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                                selectedAvatar: true
                            }
                        }
                    }
                })
            ]);

            listings = { topXp: topXpUsers, topStreak: topStreakUsers };
            // Cache listings for 60 seconds
            cache.set(cacheKey, listings, 60);
        }

        // If user is authenticated, compute their rank standings in parallel
        let userStanding = { xpRank: 0, streakRank: 0, xp: 0, streak: 0 };
        if (userId) {
            const currentUserStat = await prisma.userStat.findUnique({
                where: { userId }
            });

            if (currentUserStat) {
                const [xpCount, streakCount] = await Promise.all([
                    prisma.userStat.count({
                        where: { xp: { gt: currentUserStat.xp } }
                    }),
                    prisma.userStat.count({
                        where: { streak: { gt: currentUserStat.streak } }
                    })
                ]);

                userStanding = {
                    xpRank: xpCount + 1,
                    streakRank: streakCount + 1,
                    xp: currentUserStat.xp,
                    streak: currentUserStat.streak
                };
            }
        }

        return NextResponse.json({
            topXp: listings.topXp,
            topStreak: listings.topStreak,
            standing: userStanding
        });
    } catch (e: any) {
        console.error("Leaderboard error:", e);
        return NextResponse.json({ error: "Failed to load leaderboard." }, { status: 500 });
    }
}
