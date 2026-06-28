import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { avatarUrl } = await req.json();

        if (!avatarUrl) {
            return NextResponse.json({ error: "Avatar URL is required." }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { selectedAvatar: avatarUrl }
        });

        return NextResponse.json({ success: true, selectedAvatar: updatedUser.selectedAvatar });
    } catch (error) {
        console.error("Error updating user avatar:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
