import Redis from "ioredis";
import fs from "fs";
import path from "path";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const globalForRedis = global as unknown as { 
    redis: Redis | undefined;
    useMemoryFallback: boolean | undefined;
};

const CACHE_FILE = path.join(process.cwd(), "session-cache-fallback.json");

function readFallbackCache(): { cache: Record<string, string>; sets: Record<string, string[]> } {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
        }
    } catch (e) {
        // Ignore parsing errors
    }
    return { cache: {}, sets: {} };
}

function writeFallbackCache(data: { cache: Record<string, string>; sets: Record<string, string[]> }) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data), "utf-8");
    } catch (e) {
        // Ignore write errors
    }
}

export const redis = globalForRedis.redis ?? new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 2000,
});

redis.on("error", (err) => {
    if (!globalForRedis.useMemoryFallback) {
        console.warn("Redis connection issue. Falling back to multi-process file-based session cache.");
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
        const data = readFallbackCache();
        const sessionVal = data.cache[keys.session(userId)];
        return sessionVal ? JSON.parse(sessionVal) : null;
    }
    try {
        const data = await redis.get(keys.session(userId));
        return data ? JSON.parse(data) : null;
    } catch {
        globalForRedis.useMemoryFallback = true;
        const data = readFallbackCache();
        const sessionVal = data.cache[keys.session(userId)];
        return sessionVal ? JSON.parse(sessionVal) : null;
    }
}

export async function setUserSession(userId: string, sessionData: any) {
    if (isFallbackActive()) {
        const data = readFallbackCache();
        data.cache[keys.session(userId)] = JSON.stringify(sessionData);
        writeFallbackCache(data);
        return;
    }
    try {
        await redis.set(keys.session(userId), JSON.stringify(sessionData), "EX", 3600 * 24);
    } catch {
        globalForRedis.useMemoryFallback = true;
        const data = readFallbackCache();
        data.cache[keys.session(userId)] = JSON.stringify(sessionData);
        writeFallbackCache(data);
    }
}

export async function markSessionDirty(userId: string) {
    if (isFallbackActive()) {
        const data = readFallbackCache();
        const dirtyKey = keys.dirty();
        const currentSet = new Set(data.sets[dirtyKey] || []);
        currentSet.add(userId);
        data.sets[dirtyKey] = Array.from(currentSet);
        writeFallbackCache(data);
        return;
    }
    try {
        await redis.sadd(keys.dirty(), userId);
    } catch {
        globalForRedis.useMemoryFallback = true;
        const data = readFallbackCache();
        const dirtyKey = keys.dirty();
        const currentSet = new Set(data.sets[dirtyKey] || []);
        currentSet.add(userId);
        data.sets[dirtyKey] = Array.from(currentSet);
        writeFallbackCache(data);
    }
}

export async function getDirtySessions(): Promise<string[]> {
    if (isFallbackActive()) {
        const data = readFallbackCache();
        return data.sets[keys.dirty()] || [];
    }
    try {
        return await redis.smembers(keys.dirty());
    } catch {
        globalForRedis.useMemoryFallback = true;
        const data = readFallbackCache();
        return data.sets[keys.dirty()] || [];
    }
}

export async function clearDirtyFlag(userId: string) {
    if (isFallbackActive()) {
        const data = readFallbackCache();
        const dirtyKey = keys.dirty();
        const currentSet = new Set(data.sets[dirtyKey] || []);
        currentSet.delete(userId);
        data.sets[dirtyKey] = Array.from(currentSet);
        writeFallbackCache(data);
        return;
    }
    try {
        await redis.srem(keys.dirty(), userId);
    } catch {
        globalForRedis.useMemoryFallback = true;
        const data = readFallbackCache();
        const dirtyKey = keys.dirty();
        const currentSet = new Set(data.sets[dirtyKey] || []);
        currentSet.delete(userId);
        data.sets[dirtyKey] = Array.from(currentSet);
        writeFallbackCache(data);
    }
}

export async function deleteUserSession(userId: string) {
    if (isFallbackActive()) {
        const data = readFallbackCache();
        delete data.cache[keys.session(userId)];
        writeFallbackCache(data);
        return;
    }
    try {
        await redis.del(keys.session(userId));
    } catch {
        globalForRedis.useMemoryFallback = true;
        const data = readFallbackCache();
        delete data.cache[keys.session(userId)];
        writeFallbackCache(data);
    }
}
