"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";

function SessionSync() {
    const { data: session, status } = useSession();
    const login = useUserStore((state) => state.login);
    const logout = useUserStore((state) => state.logout);
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);
    const userEmail = useUserStore((state) => state.userEmail);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            if (!isLoggedIn || userEmail !== session.user.email) {
                login(
                    session.user.name || "",
                    session.user.email || "",
                    (session.user as any).selectedAvatar || (session.user as any).defaultAvatar || "",
                    (session.user as any).suggestedAvatars || []
                );
            }
        } else if (status === "unauthenticated") {
            if (isLoggedIn) {
                logout();
            }
        }
    }, [status, session, login, logout, isLoggedIn, userEmail]);

    return null;
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SessionSync />
            {children}
        </SessionProvider>
    );
}
