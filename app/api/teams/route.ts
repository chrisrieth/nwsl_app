import { fetchTeams } from "@/lib/espn";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  const teams = await fetchTeams();
  return NextResponse.json(teams);
}
