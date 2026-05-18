@AGENTS.md

# NWSL App — Project Guide

A mobile-first progressive web app for tracking NWSL scores, schedules, and standings. Built by Chris Rieth, deployed on Vercel, designed in claude.ai/design and implemented with Claude Code.

**Live app:** https://nwsl-app.vercel.app  
**GitHub:** https://github.com/chrisrieth/nwsl_app  
**Vercel project:** chris-rieth-s-projects / nwsl-app (auto-deploys PRs for preview)

---

## Stack

- **Next.js 16** (App Router, React 19) — see AGENTS.md, this version has breaking changes
- **TypeScript** throughout
- **No CSS framework** — all styling is inline React styles + CSS custom properties
- **Font:** Archivo Black via `next/font/google` (weight 400 only)
- **Date handling:** date-fns
- **Data source:** ESPN public APIs (no auth required)
- **PWA:** service worker + manifest in `/public`
- **Deployment:** Vercel (auto-preview on every PR branch)

MUI is installed but **removed from all active pages** — only legacy unused components still reference it. Do not add new MUI usage.

---

## Project Structure

```
app/
  layout.tsx              Root layout: Archivo Black font, BottomNav, padding for nav
  globals.css             CSS custom properties for dark/light mode (--bg, --ink, etc.)
  page.tsx                Home: favorite team schedule, live game card, upcoming fixtures
  error.tsx               Global error boundary (no MUI)
  scores/page.tsx         League-wide scoreboard, grouped by day
  standings/page.tsx      League table with playoff tier indicators
  teams/page.tsx          Team browser grid
  teams/[id]/page.tsx     Team detail: hero slab, form dots, fixtures feed
  match/[id]/page.tsx     Live match detail: score HUD, event log, live polling
  api/
    scoreboard/route.ts   ESPN scoreboard → Match[]
    schedule/[teamId]/    ESPN team schedule → Match[]
    standings/route.ts    ESPN standings → StandingRow[]
    teams/route.ts        ESPN teams → Team[]
    match/[id]/route.ts   ESPN summary endpoint → match detail + events

components/
  BottomNav.tsx           B-direction tab bar (always dark bg, team-color top border)
  KineticBg.tsx           Page wrapper: halftone dot wash + diagonal motion-slash bg
  KineticBadge.tsx        Parallelogram team badge with shadow offset
  KineticBanner.tsx       Slanted callout banner (● LIVE NOW style)
  KineticBurst.tsx        Comic starburst SVG (behind live scores)
  ServiceWorkerRegistrar  PWA service worker setup

  --- LEGACY (unused, kept for reference) ---
  AppBar.tsx              Old MUI top bar — superseded by inline headers per page
  MatchCard.tsx           Old MUI match card — superseded by inline cards per page
  MatchList.tsx           Old MUI list with scroll-to-anchor — superseded per page
  TeamPicker.tsx          Old MUI team picker dialog — superseded by inline overlay

lib/
  espn.ts                 ESPN API client: types, fetch functions, data mappers
  favorites.ts            localStorage: team ID, abbreviation, primary color
  teamColors.ts           Neon accent map (abbr → neon hex) for dark mode
  useNight.ts             useNight() hook: reads prefers-color-scheme, reactive
  MuiRegistry.tsx         LEGACY MUI SSR wrapper — not used in layout, keep but ignore
  theme.ts                LEGACY MUI theme — not used, keep but ignore
```

---

## Design System — Kinetic Pop (Direction B)

Designed in claude.ai/design. Two directions were proposed; **Direction B was chosen and implemented**.

### Visual language
- **Parallelogram clip-paths** on nearly everything: badges, cards, banners, tags
  - Standard card: `polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)`
  - Hero slab: `polygon(0 12px, 100% 0, 100% calc(100% - 12px), 0 100%)`
- **Halftone dot wash** (top-left, fades toward bottom-right) — from `KineticBg`
- **Diagonal motion-line slash** (top-right corner) — from `KineticBg`
- **Comic burst starburst SVG** — behind the live score number, from `KineticBurst`
- **Skewed type** — `transform: skew(-6deg)` or `skew(-8deg)` on headlines
- **ALL-CAPS** labels everywhere, `letterSpacing: "0.10em"` to `"0.14em"`

### Colors
| Mode | Background | Text | Team accent |
|------|-----------|------|-------------|
| Light | `#ffffff` | `#0a0a0a` | Team primary (ESPN `color` field, prepend `#`) |
| Dark | `#0a0a0a` | `#ffffff` | Team neon (from `lib/teamColors.ts`) |

Cards and surfaces are always `#0a0a0a` in both modes (dark cards on light background is intentional).

CSS custom properties in `globals.css`:
- `--bg` / `--ink` — page background / text
- `--ink-muted` — subdued labels (#666 / #888)
- `--border` — divider lines (#e8e8e8 / #1a1a1a)
- `--surface` / `--surface-text` — for MUI remnants (unused in active pages)

Dark mode detection: `lib/useNight.ts` → `useNight()` hook (client-only, starts false on server, reactive to OS changes).

### Font
Archivo Black, weight 400 only (it's a display face). Loaded via `next/font/google`, available as `var(--font-archivo)`. Applied on `body` in `layout.tsx`.

### Team accents
`lib/teamColors.ts` maps ESPN abbreviations → neon hex for dark mode.  
`getTeamAccent(abbr, primaryHex, night)` returns the correct color for current mode.  
`lib/favorites.ts` caches the selected team's `abbr` and `color` in `localStorage` so the BottomNav can show the correct accent without an API fetch.

---

## Data Layer

### ESPN API endpoints used
```
Base: https://site.api.espn.com/apis/site/v2/sports/soccer/usa.nwsl

GET /scoreboard?limit=100          → all current/recent matches
GET /scoreboard?dates={from}-{to}  → matches in a date range
GET /teams/{id}/schedule           → team season schedule
GET /standings                     → league table
GET /teams?limit=50                → all teams
GET /summary?event={id}            → match detail + key events
```

ESPN returns `color` as a hex string **without** the leading `#`. Always prepend it: `` `#${team.color}` ``.

### Key types (lib/espn.ts)
- `Match` — normalized match: homeTeam, awayTeam, status (`"pre" | "in" | "post"`), clock, period, venue
- `StandingRow` — team + gp/w/d/l/gf/ga/gd/pts
- `Team` — id, name, shortName, abbr, logo, color, altColor

### Caching (vercel.json)
- `/api/teams` — 1 hour
- `/api/standings`, `/api/schedule/:teamId` — 5 minutes
- `/api/scoreboard` — 60 seconds

### Live polling
When `status === "in"` matches exist, pages poll their data endpoint every **20 seconds** via `setInterval` in a `useEffect`.

---

## Routes / Pages

| Route | Tab | What it shows |
|-------|-----|---------------|
| `/` | HOME | Favorite team's live or next match + upcoming fixtures. First visit shows team picker. |
| `/scores` | SCORES | Full league scoreboard grouped by day. Tapping a card goes to `/match/[id]`. |
| `/standings` | TABLE | League standings table with playoff/play-in tier indicators. |
| `/teams` | TEAMS | All 14 clubs. Tapping goes to `/teams/[id]`. |
| `/teams/[id]` | — | Team detail: accent wedge hero, W/D/L stats, form dots, fixtures feed. |
| `/match/[id]` | — | Live match: big score HUD, clock, event log (from ESPN summary). |

The BottomNav has four tabs: HOME (◆), TEAMS (▲), SCORES (●), TABLE (■).  
Active tab is skewed and colored with the favorite team's accent.

---

## Favorite Team Flow

1. First visit → `getFavoriteTeam()` returns null → team picker overlay shown
2. User picks a team → `setFavoriteTeam(id)` + `setFavoriteMeta(abbr, color)` stored in localStorage
3. Subsequent visits → home page loads that team's schedule directly
4. "Change Favorite Team" button in home page → picker overlay with close (✕)
5. Setting a team from `/teams/[id]` page also calls `setFavoriteMeta` so BottomNav accent updates

---

## PWA Setup

Service worker registered by `ServiceWorkerRegistrar` (network-first strategy). Manifest at `/public/manifest.json`. Icons in `/public/icons/`. Apple touch icon configured in `layout.tsx` metadata.

---

## Unused / Legacy Files

These exist and compile but are not imported by any active page:
- `components/AppBar.tsx` — MUI app bar
- `components/MatchCard.tsx` — MUI match card
- `components/MatchList.tsx` — MUI match list with scroll-to-anchor
- `components/TeamPicker.tsx` — MUI team picker
- `lib/MuiRegistry.tsx` — MUI emotion SSR wrapper
- `lib/theme.ts` — MUI theme config

Safe to delete eventually; kept for reference.

---

## Recommended Next Phases

These are the most natural next steps, roughly in priority order:

### 1. Real match events on the live detail page
The `/api/match/[id]` route fetches ESPN's `summary` endpoint and looks for `keyEvents`. In practice, ESPN's free tier may return an empty `keyEvents` array for NWSL. Options:
- Try `data.drives`, `data.plays`, or `data.scoringPlays` in the route
- Add a "live scoreline only" fallback state that's clearly labeled
- Consider a third-party NWSL stats source (API-Football, SportMonks) for richer events

### 2. Notifications for favorite team matches
PWA push notifications when the favorite team's match goes live. Requires:
- A Vercel cron job (or Edge Function) to check scoreboard and trigger pushes
- Web Push API setup with VAPID keys
- Permission prompt UX in the app

### 3. Player stats / roster on the team page
ESPN has a `/rosters` endpoint. Add a "ROSTER" tab to the team detail page (alongside the fixtures) showing players, positions, goals, assists. Good use of the existing tab-strip UI pattern from the live match design.

### 4. Historical match results / season archive
The home page only shows upcoming fixtures. Add a "RESULTS" section below upcoming showing the last 5 completed matches with W/D/L coloring. The data is already fetched in the schedule — just filter and render.

### 5. Scoreboard ticker on home
Direction A had a scrolling ticker bar. A subtle marquee of live scores at the top of the home screen would be a nice polish touch without needing Direction A's full redesign.

### 6. Delete the legacy MUI files
Once the codebase is stable and confirmed working in production, remove `AppBar.tsx`, `MatchCard.tsx`, `MatchList.tsx`, `TeamPicker.tsx`, `lib/MuiRegistry.tsx`, `lib/theme.ts`, and the MUI + emotion packages from `package.json`. This will reduce the bundle significantly.

### 7. Team color accuracy
`lib/teamColors.ts` uses hand-picked neon colors. ESPN's `altColor` field sometimes contains a better secondary color. Consider cross-referencing ESPN's `altColor` against the neon map and using whichever is more saturated.
