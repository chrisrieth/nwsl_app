import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ESPN_SUMMARY = "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.nwsl/summary";

interface EspnKeyEvent {
  clock?: { displayValue?: string };
  text?: string;
  type?: { text?: string; id?: string };
  team?: { id?: string; abbreviation?: string };
  scoringPlay?: boolean;
  participants?: { athlete?: { displayName?: string } }[];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${ESPN_SUMMARY}?event=${id}`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ error: `ESPN ${res.status}` }, { status: 502 });
    const data = await res.json();

    const comp = data.header?.competitions?.[0];
    if (!comp) return NextResponse.json({ error: "No match data" }, { status: 404 });

    const home = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "home");
    const away = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "away");

    const status = comp.status ?? {};
    const homeTeam = home?.team ?? {};
    const awayTeam = away?.team ?? {};

    // Extract key events from the summary
    const rawEvents: EspnKeyEvent[] = data.keyEvents ?? data.keyPlay ?? [];
    const events = rawEvents.map((e: EspnKeyEvent) => ({
      clock: e.clock?.displayValue ?? "",
      text: e.text ?? e.type?.text ?? "",
      typeId: e.type?.id ?? "",
      teamId: e.team?.id ?? "",
      teamAbbr: e.team?.abbreviation ?? "",
      isGoal: e.scoringPlay === true,
      participant: e.participants?.[0]?.athlete?.displayName ?? "",
    }));

    return NextResponse.json({
      id,
      homeTeam: {
        id: homeTeam.id,
        name: homeTeam.displayName ?? homeTeam.name,
        abbr: homeTeam.abbreviation,
        color: homeTeam.color ?? "1a1a2e",
        logo: homeTeam.logos?.[0]?.href ?? `https://a.espncdn.com/i/teamlogos/soccer/500/${homeTeam.id}.png`,
        score: home?.score,
      },
      awayTeam: {
        id: awayTeam.id,
        name: awayTeam.displayName ?? awayTeam.name,
        abbr: awayTeam.abbreviation,
        color: awayTeam.color ?? "1a1a2e",
        logo: awayTeam.logos?.[0]?.href ?? `https://a.espncdn.com/i/teamlogos/soccer/500/${awayTeam.id}.png`,
        score: away?.score,
      },
      venue: comp.venue?.fullName,
      city: comp.venue?.address ? [comp.venue.address.city, comp.venue.address.state].filter(Boolean).join(", ") : undefined,
      status: status.type?.state ?? "pre",
      statusText: status.type?.shortDetail ?? status.type?.description ?? "",
      clock: status.displayClock,
      period: status.period,
      completed: status.type?.completed ?? false,
      events,
    });
  } catch (err) {
    console.error("Match API error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
