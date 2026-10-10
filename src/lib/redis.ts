import Redis from "ioredis";
import prisma from "./prisma";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const globalForRedis = global as unknown as { 
    redis: Redis | undefined;
    useMemoryFallback: boolean | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 2000,
});

redis.on("error", (err) => {
    if (!globalForRedis.useMemoryFallback) {
        console.warn("Redis connection issue. Falling back to Prisma DB cache.");
        globalForRedis.useMemoryFallback = true;
    }
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

function isFallbackActive(): boolean {
    return !!globalForRedis.useMemoryFallback;
}

export const keys = {
    session: (userId: string) => `user:${userId}:session`,
    dirty: () => `system:dirty_sessions`,
};

export async function getUserSession(userId: string) {
    if (isFallbackActive()) {
        const cache = await prisma.gameSessionCache.findUnique({ where: { userId } });
        return cache ? JSON.parse(cache.data) : null;
    }
    try {
        const data = await redis.get(keys.session(userId));
        return data ? JSON.parse(data) : null;
    } catch {
        globalForRedis.useMemoryFallback = true;
        const cache = await prisma.gameSessionCache.findUnique({ where: { userId } });
        return cache ? JSON.parse(cache.data) : null;
    }
}

export async function setUserSession(userId: string, sessionData: any) {
    if (isFallbackActive()) {
        await prisma.gameSessionCache.upsert({
            where: { userId },
            update: { data: JSON.stringify(sessionData) },
            create: { userId, data: JSON.stringify(sessionData) }
        });
        return;
    }
    try {
        await redis.set(keys.session(userId), JSON.stringify(sessionData), "EX", 3600 * 24);
    } catch {
        globalForRedis.useMemoryFallback = true;
        await prisma.gameSessionCache.upsert({
            where: { userId },
            update: { data: JSON.stringify(sessionData) },
            create: { userId, data: JSON.stringify(sessionData) }
        });
    }
}

export async function markSessionDirty(userId: string) {
    if (isFallbackActive()) {
        await prisma.gameSessionCache.updateMany({
            where: { userId },
            data: { isDirty: true }
        });
        return;
    }
    try {
        await redis.sadd(keys.dirty(), userId);
    } catch {
        globalForRedis.useMemoryFallback = true;
        await prisma.gameSessionCache.updateMany({
            where: { userId },
            data: { isDirty: true }
        });
    }
}

export async function getDirtySessions(): Promise<string[]> {
    if (isFallbackActive()) {
        const dirty = await prisma.gameSessionCache.findMany({
            where: { isDirty: true },
            select: { userId: true }
        });
        return dirty.map(d => d.userId);
    }
    try {
        return await redis.smembers(keys.dirty());
    } catch {
        globalForRedis.useMemoryFallback = true;
        const dirty = await prisma.gameSessionCache.findMany({
            where: { isDirty: true },
            select: { userId: true }
        });
        return dirty.map(d => d.userId);
    }
}

export async function clearDirtyFlag(userId: string) {
    if (isFallbackActive()) {
        await prisma.gameSessionCache.updateMany({
            where: { userId },
            data: { isDirty: false }
        });
        return;
    }
    try {
        await redis.srem(keys.dirty(), userId);
    } catch {
        globalForRedis.useMemoryFallback = true;
        await prisma.gameSessionCache.updateMany({
            where: { userId },
            data: { isDirty: false }
        });
    }
}

export async function deleteUserSession(userId: string) {
    if (isFallbackActive()) {
        await prisma.gameSessionCache.deleteMany({ where: { userId } });
        return;
    }
    try {
        await redis.del(keys.session(userId));
    } catch {
        globalForRedis.useMemoryFallback = true;
        await prisma.gameSessionCache.deleteMany({ where: { userId } });
    }
}
