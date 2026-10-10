import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { enqueueGenerationJob } from "@/lib/queue/worker";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { worldName, regionName, sequenceOrder, difficulty } = await req.json();
    if (!worldName || !regionName || !sequenceOrder || !difficulty) {
      return NextResponse.json({ error: "Missing required fields: worldName, regionName, sequenceOrder, difficulty" }, { status: 400 });
    }

    const jobId = enqueueGenerationJob(worldName, regionName, Number(sequenceOrder), difficulty);

    return NextResponse.json({
      success: true,
      message: "Generation job enqueued successfully.",
      jobId,
    }, { status: 202 });
  } catch (error: any) {
    console.error("[API Admin Trigger] Error enqueuing generation:", error);
    return NextResponse.json({ error: "Failed to queue generation job", details: error.message }, { status: 500 });
  }
}
