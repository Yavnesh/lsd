import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

const PROMPTS_FILE_PATH = path.join(process.cwd(), "src/lib/agents/prompts.json");

function readPromptsFile() {
  try {
    const rawData = fs.readFileSync(PROMPTS_FILE_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (e) {
    // Default fallback object
    return {
      planner: "Planner agent default instructions...",
      researcher: "Researcher agent default instructions...",
      curriculum: "Curriculum agent default instructions...",
      questioner: "Questioner agent default instructions...",
    };
  }
}

// GET active prompts config
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const prompts = readPromptsFile();
    return NextResponse.json(prompts);
  } catch (error: any) {
    console.error("[API Admin Prompts GET] Error:", error);
    return NextResponse.json({ error: "Failed to read prompts", details: error.message }, { status: 500 });
  }
}

// POST updates to prompts file
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { planner, researcher, curriculum, questioner } = body;

    const payload = {
      planner: planner || "",
      researcher: researcher || "",
      curriculum: curriculum || "",
      questioner: questioner || "",
    };

    fs.writeFileSync(PROMPTS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Prompt templates updated successfully.",
    });
  } catch (error: any) {
    console.error("[API Admin Prompts POST] Error:", error);
    return NextResponse.json({ error: "Failed to save prompts", details: error.message }, { status: 500 });
  }
}
