import { fetchStandings } from "@/lib/espn";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await fetchStandings();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("fetchStandings failed", err);
    return NextResponse.json([], { status: 200 });
  }
}
