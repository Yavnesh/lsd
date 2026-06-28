import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    xp: number;
    streak: number;
    level: string;
    isLoggedIn: boolean;
    userName: string;
    userEmail: string;
    userAvatar: string;
    suggestedAvatars: string[];
    streakShields: number;
    addXp: (amount: number, topicId?: string, quizCorrect?: boolean, selectedOptionIndex?: number, incrementStreak?: boolean) => Promise<any>;
    incrementStreak: () => Promise<void>;
    login: (name: string, email: string, avatar: string, suggestedAvatars: string[]) => void;
    logout: () => void;
    checkLevelUp: () => void;
    setAvatar: (avatarUrl: string) => void;
    syncWithDatabase: () => Promise<void>;
}

const calculateLevel = (xp: number): string => {
    if (xp >= 5000) return 'Sage';
    if (xp >= 2500) return 'Mastermind';
    if (xp >= 1000) return 'Strategist';
    if (xp >= 500) return 'Analyst';
    if (xp >= 100) return 'Thinker';
    return 'Curious Mind';
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            xp: 0,
            streak: 0,
            level: 'Curious Mind',
            isLoggedIn: false,
            userName: 'Guest',
            userEmail: '',
            userAvatar: 'G',
            suggestedAvatars: [],
            streakShields: 1,

            addXp: async (amount, topicId, quizCorrect, selectedOptionIndex, incrementStreak) => {
                // Optimistic local update
                set((state) => ({ xp: state.xp + (quizCorrect === false ? 0 : amount) }));
                get().checkLevelUp();
                
                if (get().isLoggedIn) {
                    try {
                        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                        const res = await fetch('/api/user/stats', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                xpToAdd: amount,
                                topicId,
                                earnedXp: amount,
                                quizCorrect,
                                selectedOptionIndex,
                                incrementStreak,
                                timezone: tz
                            })
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data.stats) {
                                set({
                                    xp: data.stats.xp,
                                    streak: data.stats.streak,
                                    level: data.stats.level,
                                    streakShields: data.stats.streakShields
                                });
                            }
                            return data;
                        }
                    } catch (e) {
                        console.error("Failed to sync XP with backend", e);
                    }
                }
                return null;
            },

            incrementStreak: async () => {
                set((state) => ({ streak: state.streak + 1 }));
                if (get().isLoggedIn) {
                    try {
                        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                        const res = await fetch('/api/user/stats', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ incrementStreak: true, timezone: tz })
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data.stats) {
                                set({
                                    xp: data.stats.xp,
                                    streak: data.stats.streak,
                                    level: data.stats.level,
                                    streakShields: data.stats.streakShields
                                });
                            }
                        }
                    } catch (e) {
                        console.error("Failed to sync streak with backend", e);
                    }
                }
            },

            login: (name, email, avatar, suggestedAvatars) => {
                set({ 
                    isLoggedIn: true, 
                    userName: name, 
                    userEmail: email,
                    userAvatar: avatar,
                    suggestedAvatars 
                });
                get().syncWithDatabase();
            },

            logout: () => set({ 
                isLoggedIn: false, 
                xp: 0, 
                streak: 0, 
                level: 'Curious Mind', 
                userName: 'Guest', 
                userEmail: '',
                userAvatar: 'G',
                suggestedAvatars: [],
                streakShields: 1
            }),

            checkLevelUp: () => {
                const currentXp = get().xp;
                const currentLevel = get().level;
                const newLevel = calculateLevel(currentXp);

                if (newLevel !== currentLevel) {
                    set({ level: newLevel });
                }
            },

            setAvatar: async (avatarUrl) => {
                set({ userAvatar: avatarUrl });
                if (get().isLoggedIn) {
                    try {
                        await fetch('/api/user/profile', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ avatarUrl })
                        });
                    } catch (e) {
                        console.error("Failed to sync avatar with backend", e);
                    }
                }
            },

            syncWithDatabase: async () => {
                try {
                    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const res = await fetch(`/api/user/stats?tz=${encodeURIComponent(tz)}`);
                    if (res.ok) {
                        const data = await res.json();
                        set({
                            xp: data.stats.xp,
                            streak: data.stats.streak,
                            level: data.stats.level,
                            streakShields: data.stats.streakShields
                        });
                    }
                } catch (e) {
                    console.error("Failed to sync database stats", e);
                }
            }
        }),
        {
            name: 'lsd-user-storage',
            partialize: (state) => ({ 
                xp: state.xp, 
                streak: state.streak, 
                level: state.level, 
                isLoggedIn: state.isLoggedIn,
                userName: state.userName,
                userEmail: state.userEmail,
                userAvatar: state.userAvatar,
                suggestedAvatars: state.suggestedAvatars,
                streakShields: state.streakShields
            }),
        }
    )
);
