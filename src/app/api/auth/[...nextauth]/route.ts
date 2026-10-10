import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";

const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
    // @ts-ignore PrismaAdapter types mismatch slightly sometimes in next-auth v4 but it works
    adapter: PrismaAdapter(prisma),
    // Ensures NextAuth trusts forwarded host headers (essential for Vercel and custom domains like www.learnsomethingdaily.com)
    // @ts-ignore
    trustHost: true,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "mock-id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-secret",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "you@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { stat: true }
                });
                
                if (!user || !user.password) {
                    return null;
                }

                const isValid = verifyPassword(credentials.password, user.password);
                if (!isValid) {
                    return null;
                }
                
                return user;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key-for-development-lsd",
    callbacks: {
        async session({ session, token }) {
            if (session.user && token) {
                (session.user as any).id = token.sub;
                (session.user as any).xp = token.xp || 0;
                (session.user as any).streak = token.streak || 0;
                (session.user as any).level = token.level || "Curious Mind";
                (session.user as any).defaultAvatar = token.defaultAvatar;
                (session.user as any).suggestedAvatars = token.suggestedAvatars || [];
                (session.user as any).role = token.role;
                (session.user as any).isPremium = token.isPremium;
                (session.user as any).selectedAvatar = token.selectedAvatar;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            // Initial login: query DB once and cache properties inside encrypted JWT cookie
            if (user) {
                token.sub = user.id;
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: { stat: true }
                });
                if (dbUser) {
                    token.xp = dbUser.stat?.xp || 0;
                    token.streak = dbUser.stat?.streak || 0;
                    token.level = dbUser.stat?.level || "Curious Mind";
                    token.defaultAvatar = dbUser.defaultAvatar;
                    token.suggestedAvatars = dbUser.suggestedAvatars ? JSON.parse(dbUser.suggestedAvatars) : [];
                    token.role = dbUser.role;
                    token.isPremium = dbUser.isPremium;
                    token.selectedAvatar = dbUser.selectedAvatar || dbUser.defaultAvatar;
                }
            } 
            // Handle dynamically triggered updates to session values
            else if (trigger === "update" && session) {
                if (session.xp !== undefined) token.xp = session.xp;
                if (session.streak !== undefined) token.streak = session.streak;
                if (session.level !== undefined) token.level = session.level;
                if (session.selectedAvatar !== undefined) token.selectedAvatar = session.selectedAvatar;
                if (session.isPremium !== undefined) token.isPremium = session.isPremium;
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
                    selectedAvatar: defaultAvatar,
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

const authHandler = NextAuth(authOptions);

const handler = (req: any, res: any) => {
    if (isProduction) {
        if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === "your_google_id") {
            throw new Error("Missing or invalid GOOGLE_CLIENT_ID in production environment!");
        }
        if (!process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET === "your_google_secret") {
            throw new Error("Missing or invalid GOOGLE_CLIENT_SECRET in production environment!");
        }
        if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET === "super-secret-key-for-development-lsd") {
            throw new Error("Missing or insecure NEXTAUTH_SECRET in production environment!");
        }
    }
    return authHandler(req, res);
};

export { handler as GET, handler as POST };
