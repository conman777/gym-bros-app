import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/background-jobs";

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      error: job.error,
    });
  } catch (error) {
    console.error("Setup status error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 },
    );
  }
}
