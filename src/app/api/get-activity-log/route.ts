import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const activities = await prisma.activityLog.findMany({
      where: category ? { category } : undefined,
      orderBy: { timestamp: "desc" },
      take: Math.min(limit, 200), // Max 200 activities
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Failed to fetch activity log:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activity log",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
