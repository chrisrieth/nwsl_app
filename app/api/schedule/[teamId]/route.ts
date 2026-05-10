import { fetchTeamSchedule } from "@/lib/espn";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params;
    const matches = await fetchTeamSchedule(teamId);
    return NextResponse.json(matches);
  } catch (err) {
    console.error("fetchTeamSchedule failed", err);
    return NextResponse.json([], { status: 200 });
  }
}
