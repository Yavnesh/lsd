// Simple global singleton in-memory cache with TTL support
const globalRef = global as any;

if (!globalRef.memoryCache) {
    globalRef.memoryCache = new Map<string, { data: any; expiresAt: number }>();
}

export const cache = {
    get: <T>(key: string): T | null => {
        const cached = globalRef.memoryCache.get(key);
        if (!cached) return null;
        if (Date.now() > cached.expiresAt) {
            globalRef.memoryCache.delete(key);
            return null;
        }
        return cached.data as T;
    },
    set: (key: string, data: any, ttlSeconds: number): void => {
        globalRef.memoryCache.set(key, {
            data,
            expiresAt: Date.now() + (ttlSeconds * 1000)
        });
    },
    delete: (key: string): void => {
        globalRef.memoryCache.delete(key);
    },
    clear: (): void => {
        globalRef.memoryCache.clear();
    }
};
