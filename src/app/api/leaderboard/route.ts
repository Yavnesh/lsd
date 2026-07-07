import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { cache } from "@/lib/cache";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user ? (session.user as any).id : null;
        
        const mode = req.nextUrl.searchParams.get("mode") || "general";

        if (mode === "skill") {
            const category = req.nextUrl.searchParams.get("category") || "GLOBAL";

            const cacheKey = `leaderboard-${category}`;
            let listings = cache.get<any[]>(cacheKey);

            if (!listings) {
                if (category === "GLOBAL") {
                    listings = await prisma.userStat.findMany({
                        take: 10,
                        orderBy: { globalRating: "desc" },
                        select: {
                            xp: true,
                            streak: true,
                            level: true,
                            globalRating: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    selectedAvatar: true
                                }
                            }
                        }
                    });
                } else {
                    const ratings = await prisma.userTopicRating.findMany({
                        where: { cluster: category },
                        take: 10,
                        orderBy: { rating: "desc" },
                        select: {
                            rating: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    selectedAvatar: true,
                                    stat: {
                                        select: {
                                            xp: true,
                                            streak: true,
                                            level: true
                                        }
                                    }
                                }
                            }
                        }
                    });

                    listings = ratings.map(r => ({
                        xp: r.user.stat?.xp || 0,
                        streak: r.user.stat?.streak || 0,
                        level: r.user.stat?.level || "Curious Mind",
                        globalRating: r.rating,
                        user: {
                            name: r.user.name,
                            email: r.user.email,
                            selectedAvatar: r.user.selectedAvatar
                        }
                    }));
                }
                cache.set(cacheKey, listings, 30);
            }

            // Standing rank calculation
            let userStanding = { rank: 0, rating: 1000 };
            if (userId) {
                if (category === "GLOBAL") {
                    const currentUserStat = await prisma.userStat.findUnique({
                        where: { userId }
                    });
                    if (currentUserStat) {
                        const count = await prisma.userStat.count({
                            where: { globalRating: { gt: currentUserStat.globalRating } }
                        });
                        userStanding = {
                            rank: count + 1,
                            rating: currentUserStat.globalRating
                        };
                    }
                } else {
                    const currentRating = await prisma.userTopicRating.findUnique({
                        where: { userId_cluster: { userId, cluster: category } }
                    });
                    const currentVal = currentRating?.rating || 1000;
                    const count = await prisma.userTopicRating.count({
                        where: { cluster: category, rating: { gt: currentVal } }
                    });
                    userStanding = {
                        rank: count + 1,
                        rating: currentVal
                    };
                }
            }

            return NextResponse.json({
                listings,
                standing: userStanding
            });
        } else {
            // General Streak & XP Leaderboards
            const cacheKey = "leaderboard-general";
            let listings = cache.get<{ topXp: any[]; topStreak: any[] }>(cacheKey);

            if (!listings) {
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
                cache.set(cacheKey, listings, 30);
            }

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
        }
    } catch (e: any) {
        console.error("Leaderboard error:", e);
        return NextResponse.json({ error: "Failed to load leaderboard." }, { status: 500 });
    }
}
