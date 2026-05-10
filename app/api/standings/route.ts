import { fetchStandings } from "@/lib/espn";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALT = "https://site.web.api.espn.com/apis/v2/sports/soccer/usa.nwsl";
const BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.nwsl";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("raw") === "1") {
    const year = new Date().getFullYear();
    const targets = [
      `${ALT}/standings?season=${year}`,
      `${ALT}/standings`,
      `${BASE}/standings?season=${year}`,
      `${BASE}/standings`,
    ];
    const results: Array<Record<string, unknown>> = [];
    for (const u of targets) {
      try {
        const r = await fetch(u, { cache: "no-store" });
        const text = await r.text();
        let parsed: unknown = null;
        try { parsed = JSON.parse(text); } catch { parsed = text.slice(0, 500); }
        results.push({ url: u, status: r.status, ok: r.ok, body: parsed });
      } catch (err) {
        results.push({ url: u, error: String(err) });
      }
    }
    return NextResponse.json(results);
  }

  try {
    const rows = await fetchStandings();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("fetchStandings failed", err);
    return NextResponse.json([], { status: 200 });
  }
}
