import { fetchStandings } from "@/lib/espn";
import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  const rows = await fetchStandings();
  return NextResponse.json(rows);
}
