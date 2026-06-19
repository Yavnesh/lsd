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
    addXp: (amount: number, topicId?: string) => void;
    incrementStreak: () => void;
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

            addXp: async (amount, topicId) => {
                set((state) => ({ xp: state.xp + amount }));
                get().checkLevelUp();
                
                if (get().isLoggedIn) {
                    try {
                        await fetch('/api/user/stats', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ xpToAdd: amount, topicId, earnedXp: amount })
                        });
                    } catch (e) {
                        console.error("Failed to sync XP with backend", e);
                    }
                }
            },

            incrementStreak: async () => {
                set((state) => ({ streak: state.streak + 1 }));
                if (get().isLoggedIn) {
                    try {
                        await fetch('/api/user/stats', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ incrementStreak: true })
                        });
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
                suggestedAvatars: []
            }),

            checkLevelUp: () => {
                const currentXp = get().xp;
                const currentLevel = get().level;
                const newLevel = calculateLevel(currentXp);

                if (newLevel !== currentLevel) {
                    set({ level: newLevel });
                }
            },

            setAvatar: (avatarUrl) => set({ userAvatar: avatarUrl }),

            syncWithDatabase: async () => {
                try {
                    const res = await fetch('/api/user/stats');
                    if (res.ok) {
                        const data = await res.json();
                        set({
                            xp: data.stats.xp,
                            streak: data.stats.streak,
                            level: data.stats.level
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
                suggestedAvatars: state.suggestedAvatars
            }),
        }
    )
);
