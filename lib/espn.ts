const BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.nwsl";

export interface EspnTeam {
  id: string;
  displayName: string;
  shortDisplayName: string;
  abbreviation: string;
  color: string;
  alternateColor: string;
  logos: { href: string }[];
}

export interface EspnCompetitor {
  id: string;
  homeAway: "home" | "away";
  score?: string;
  team: EspnTeam;
  records?: { summary: string }[];
}

export interface EspnStatus {
  type: {
    id: string;
    name: string;
    state: "pre" | "in" | "post";
    completed: boolean;
    description: string;
    shortDetail: string;
    detail: string;
  };
  displayClock?: string;
  period?: number;
}

export interface EspnEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: {
    id: string;
    date: string;
    venue?: { fullName: string; address?: { city: string; state?: string } };
    competitors: EspnCompetitor[];
    status: EspnStatus;
    broadcasts?: { names: string[] }[];
  }[];
  status: EspnStatus;
}

export interface EspnStandingEntry {
  team: EspnTeam;
  stats: { name: string; displayValue: string; value: number }[];
}

export interface Match {
  id: string;
  date: string;
  homeTeam: { id: string; name: string; abbr: string; logo: string; color: string; altColor: string; score?: string };
  awayTeam: { id: string; name: string; abbr: string; logo: string; color: string; altColor: string; score?: string };
  venue?: string;
  city?: string;
  status: "pre" | "in" | "post";
  statusText: string;
  clock?: string;
  period?: number;
  completed: boolean;
}

export interface StandingRow {
  team: { id: string; name: string; abbr: string; logo: string; color: string };
  gp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  logo: string;
  color: string;
  altColor: string;
}

function mapCompetitor(c: EspnCompetitor) {
  return {
    id: c.team.id,
    name: c.team.displayName,
    abbr: c.team.abbreviation,
    logo: c.team.logos?.[0]?.href ?? "",
    color: c.team.color ?? "1a1a2e",
    altColor: c.team.alternateColor ?? "ffffff",
    score: c.score,
  };
}

export function mapEvent(event: EspnEvent): Match | null {
  const comp = event.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors.find((c) => c.homeAway === "home");
  const away = comp.competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;
  return {
    id: event.id,
    date: comp.date,
    homeTeam: mapCompetitor(home),
    awayTeam: mapCompetitor(away),
    venue: comp.venue?.fullName,
    city: comp.venue?.address
      ? [comp.venue.address.city, comp.venue.address.state].filter(Boolean).join(", ")
      : undefined,
    status: comp.status.type.state,
    statusText: comp.status.type.shortDetail,
    clock: comp.status.displayClock,
    period: comp.status.period,
    completed: comp.status.type.completed,
  };
}

export async function fetchScoreboard(): Promise<Match[]> {
  const res = await fetch(`${BASE}/scoreboard?limit=100`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.events ?? []).map(mapEvent).filter(Boolean) as Match[];
}

export async function fetchTeamSchedule(teamId: string): Promise<Match[]> {
  const res = await fetch(`${BASE}/teams/${teamId}/schedule`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const events: EspnEvent[] = data.events ?? [];
  return events.map(mapEvent).filter(Boolean) as Match[];
}

export async function fetchStandings(): Promise<StandingRow[]> {
  const res = await fetch(`${BASE}/standings`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const entries: EspnStandingEntry[] =
    data.standings?.entries ?? data.children?.[0]?.standings?.entries ?? [];
  return entries.map((e) => {
    const stat = (name: string) => e.stats.find((s) => s.name === name);
    return {
      team: {
        id: e.team.id,
        name: e.team.displayName,
        abbr: e.team.abbreviation,
        logo: e.team.logos?.[0]?.href ?? "",
        color: e.team.color ?? "1a1a2e",
      },
      gp: stat("gamesPlayed")?.value ?? 0,
      w: stat("wins")?.value ?? 0,
      d: stat("ties")?.value ?? 0,
      l: stat("losses")?.value ?? 0,
      gf: stat("pointsFor")?.value ?? 0,
      ga: stat("pointsAgainst")?.value ?? 0,
      gd: stat("pointDifferential")?.value ?? 0,
      pts: stat("points")?.value ?? 0,
    };
  });
}

export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${BASE}/teams?limit=50`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.sports?.[0]?.leagues?.[0]?.teams ?? []).map(
    (t: { team: EspnTeam }) => ({
      id: t.team.id,
      name: t.team.displayName,
      shortName: t.team.shortDisplayName,
      abbr: t.team.abbreviation,
      logo: t.team.logos?.[0]?.href ?? "",
      color: t.team.color ?? "1a1a2e",
      altColor: t.team.alternateColor ?? "ffffff",
    })
  );
}
