import { fetchTeams } from "@/lib/espn";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const teams = await fetchTeams();
    return NextResponse.json(teams);
  } catch (err) {
    console.error("fetchTeams failed", err);
    return NextResponse.json([], { status: 200 });
  }
}
