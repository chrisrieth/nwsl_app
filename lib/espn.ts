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

export interface EspnCompetitorScore {
  value?: string | number;
  displayValue?: string;
  winner?: boolean;
  source?: string;
  $ref?: string;
}

export interface EspnCompetitor {
  id: string;
  homeAway: "home" | "away";
  score?: string | EspnCompetitorScore;
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
  stats: { name: string; displayValue?: string; value?: number | string }[];
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

function extractScore(raw: EspnCompetitor["score"]): string | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "string") return raw;
  // ESPN sometimes returns score as an object
  const s = raw.displayValue ?? (raw.value != null ? String(raw.value) : undefined);
  return s;
}

function teamLogo(team: EspnTeam): string {
  return team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${team.id}.png`;
}

function mapCompetitor(c: EspnCompetitor) {
  return {
    id: c.team.id,
    name: c.team.displayName,
    abbr: c.team.abbreviation,
    logo: teamLogo(c.team),
    color: c.team.color ?? "1a1a2e",
    altColor: c.team.alternateColor ?? "ffffff",
    score: extractScore(c.score),
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

async function fetchEspnEvents(url: string): Promise<EspnEvent[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events ?? [];
  } catch {
    return [];
  }
}

export async function fetchTeamSchedule(teamId: string): Promise<Match[]> {
  // ESPN's /teams/{id}/schedule endpoint only returns completed games. To pull
  // in upcoming fixtures we also query the league scoreboard month-by-month and
  // filter to events that involve this team.
  const year = new Date().getFullYear();
  const today = new Date();

  const teamScheduleUrl = `${BASE}/teams/${teamId}/schedule?season=${year}&seasontype=2`;

  const fmtDay = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const scoreboardUrls: string[] = [];
  // One month back through eight months forward.
  for (let i = -1; i < 8; i++) {
    const start = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
    scoreboardUrls.push(
      `${BASE}/scoreboard?dates=${fmtDay(start)}-${fmtDay(end)}&limit=200`
    );
  }

  const [teamEvents, ...scoreboardEventsByMonth] = await Promise.all([
    fetchEspnEvents(teamScheduleUrl),
    ...scoreboardUrls.map(fetchEspnEvents),
  ]);

  const seen = new Set<string>();
  const all: Match[] = [];

  for (const ev of teamEvents) {
    const m = mapEvent(ev);
    if (m && !seen.has(m.id)) {
      seen.add(m.id);
      all.push(m);
    }
  }

  for (const events of scoreboardEventsByMonth) {
    for (const ev of events) {
      const m = mapEvent(ev);
      if (!m || seen.has(m.id)) continue;
      if (m.homeTeam.id !== teamId && m.awayTeam.id !== teamId) continue;
      seen.add(m.id);
      all.push(m);
    }
  }

  all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return all;
}

function statNumber(stats: EspnStandingEntry["stats"], name: string): number {
  const s = stats.find((x) => x.name === name);
  if (!s) return 0;
  if (typeof s.value === "number") return s.value;
  if (typeof s.value === "string") {
    const n = parseFloat(s.value);
    return Number.isFinite(n) ? n : 0;
  }
  // ESPN sometimes wraps stat values in an object like score does.
  if (s.displayValue) {
    const n = parseFloat(s.displayValue);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function findStandingEntries(data: unknown): EspnStandingEntry[] {
  const out: EspnStandingEntry[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    const standings = obj.standings as { entries?: EspnStandingEntry[] } | undefined;
    if (standings?.entries && Array.isArray(standings.entries)) {
      out.push(...standings.entries);
    }
    if (Array.isArray(obj.children)) obj.children.forEach(visit);
    if (Array.isArray(obj.groups)) obj.groups.forEach(visit);
  };
  visit(data);
  return out;
}

export async function fetchStandings(): Promise<StandingRow[]> {
  const year = new Date().getFullYear();
  const urls = [
    `${BASE}/standings?season=${year}`,
    `${BASE}/standings`,
  ];

  let entries: EspnStandingEntry[] = [];
  for (const url of urls) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) continue;
    const data = await res.json();
    entries = findStandingEntries(data);
    if (entries.length > 0) break;
  }

  return entries.map((e) => ({
    team: {
      id: e.team.id,
      name: e.team.displayName,
      abbr: e.team.abbreviation,
      logo: teamLogo(e.team),
      color: e.team.color ?? "1a1a2e",
    },
    gp: statNumber(e.stats, "gamesPlayed"),
    w: statNumber(e.stats, "wins"),
    d: statNumber(e.stats, "ties"),
    l: statNumber(e.stats, "losses"),
    gf: statNumber(e.stats, "pointsFor"),
    ga: statNumber(e.stats, "pointsAgainst"),
    gd: statNumber(e.stats, "pointDifferential"),
    pts: statNumber(e.stats, "points"),
  }));
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
      logo: teamLogo(t.team),
      color: t.team.color ?? "1a1a2e",
      altColor: t.team.alternateColor ?? "ffffff",
    })
  );
}
