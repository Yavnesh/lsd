import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    // @ts-ignore PrismaAdapter types mismatch slightly sometimes in next-auth v4 but it works
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "mock-id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-secret",
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-lsd-dev-key",
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub! },
                    include: { stat: true }
                });
                if (dbUser) {
                    (session.user as any).id = dbUser.id;
                    (session.user as any).xp = dbUser.stat?.xp || 0;
                    (session.user as any).streak = dbUser.stat?.streak || 0;
                    (session.user as any).level = dbUser.stat?.level || "Curious Mind";
                    (session.user as any).defaultAvatar = dbUser.defaultAvatar;
                    (session.user as any).suggestedAvatars = dbUser.suggestedAvatars ? JSON.parse(dbUser.suggestedAvatars) : [];
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    events: {
        async createUser(message) {
            const user = message.user;
            const baseSeed = (user.name || "user").replace(/\s/g, '');
            const defaultAvatar = `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}`;
            const suggestedAvatars = JSON.stringify([
                `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}1`,
                `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}2`,
                `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}3`,
                `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}4`,
                `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}5`,
                `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}6`,
            ]);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    defaultAvatar,
                    suggestedAvatars,
                    stat: {
                        create: {
                            xp: 0,
                            streak: 0,
                            level: "Curious Mind"
                        }
                    }
                }
            });
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
