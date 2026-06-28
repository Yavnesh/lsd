"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";

function SessionSync() {
    const { data: session, status } = useSession();
    const { login, logout } = useUserStore();
    const prevStatus = useRef(status);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            login(
                session.user.name || "",
                session.user.email || "",
                (session.user as any).selectedAvatar || (session.user as any).defaultAvatar || "",
                (session.user as any).suggestedAvatars || []
            );
        } else if (status === "unauthenticated") {
            logout();
        }
        prevStatus.current = status;
    }, [status, session, login, logout]);

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
