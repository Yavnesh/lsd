import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
    // @ts-ignore PrismaAdapter types mismatch slightly sometimes in next-auth v4 but it works
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "mock-id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-secret",
        }),
        CredentialsProvider({
            name: "Test Account",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "developer@lsd.com" },
                name: { label: "Name", type: "text", placeholder: "Developer" }
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;
                
                let user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { stat: true }
                });
                
                if (!user) {
                    const baseSeed = credentials.name || credentials.email.split("@")[0];
                    user = await prisma.user.create({
                        data: {
                            email: credentials.email,
                            name: credentials.name || baseSeed,
                            defaultAvatar: `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}`,
                            suggestedAvatars: JSON.stringify([
                                `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}1`,
                                `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}2`,
                                `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}3`,
                            ]),
                            stat: {
                                create: {
                                    xp: 0,
                                    streak: 1,
                                    level: "Curious Mind"
                                }
                            }
                        },
                        include: { stat: true }
                    });
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
