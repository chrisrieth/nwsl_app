import { fetchScoreboard } from "@/lib/espn";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await fetchScoreboard();
    return NextResponse.json(matches);
  } catch (err) {
    console.error("fetchScoreboard failed", err);
    return NextResponse.json([], { status: 200 });
  }
}
