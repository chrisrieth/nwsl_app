import { fetchScoreboard } from "@/lib/espn";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  const matches = await fetchScoreboard();
  return NextResponse.json(matches);
}
