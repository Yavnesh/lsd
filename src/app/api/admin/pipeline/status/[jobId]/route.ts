import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getJobStatus } from "@/lib/queue/worker";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { jobId } = await params;
    const status = getJobStatus(jobId);

    if (!status) {
      return NextResponse.json({ error: `Job with ID ${jobId} not found.` }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error: any) {
    console.error("[API Admin Status] Error fetching job status:", error);
    return NextResponse.json({ error: "Failed to fetch job status", details: error.message }, { status: 500 });
  }
}
