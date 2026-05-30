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
    addXp: (amount: number) => void;
    incrementStreak: () => void;
    login: (name: string, email: string, avatar: string, suggestedAvatars: string[]) => void;
    logout: () => void;
    checkLevelUp: () => void;
    setAvatar: (avatarUrl: string) => void;
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

            addXp: (amount) => {
                set((state) => ({ xp: state.xp + amount }));
                get().checkLevelUp();
            },

            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

            login: (name, email, avatar, suggestedAvatars) => set({ 
                isLoggedIn: true, 
                userName: name, 
                userEmail: email,
                userAvatar: avatar,
                suggestedAvatars 
            }),

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
