import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
        }

        const baseSeed = (name || email.split("@")[0]).replace(/\s/g, '');
        const defaultAvatar = `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}`;
        const suggestedAvatars = JSON.stringify([
            `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}1`,
            `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}2`,
            `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}3`,
            `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}4`,
            `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}5`,
            `https://api.dicebear.com/9.x/bottts/svg?seed=${baseSeed}6`,
        ]);

        const hashedPassword = hashPassword(password);

        // Create user with default stats
        const user = await prisma.user.create({
            data: {
                email,
                name: name || baseSeed,
                password: hashedPassword,
                defaultAvatar,
                suggestedAvatars,
                selectedAvatar: defaultAvatar,
                stat: {
                    create: {
                        xp: 0,
                        streak: 1,
                        level: "Curious Mind"
                    }
                }
            }
        });

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
