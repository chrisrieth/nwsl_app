"use client";

import { use, useCallback, useEffect, useState, type ReactNode } from "react";
import { MatchDetail } from "@/lib/espn";
import AppBar from "@/components/AppBar";
import {
  Box,
  Chip,
  Divider,
  Skeleton,
  Typography,
} from "@mui/material";
import { format, parseISO } from "date-fns";

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/matches/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data) { setMatch(data); setLoading(false); }
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Poll every 20s while live.
  useEffect(() => {
    if (match?.status !== "in") return;
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [match?.status, load]);

  const title = match
    ? `${match.awayTeam.abbr} vs ${match.homeTeam.abbr}`
    : "Match";

  return (
    <>
      <AppBar title={title} subtitle="NWSL" showBack />

      {loading ? (
        <LoadingSkeleton />
      ) : notFound || !match ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">Match not found.</Typography>
        </Box>
      ) : (
        <MatchContent match={match} />
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
    </Box>
  );
}

function MatchContent({ match }: { match: MatchDetail }) {
  return (
    <Box sx={{ pb: 10 }}>
      <ScoreHeader match={match} />
      {match.goals.length > 0 && <GoalsList match={match} />}
      {match.stats.length > 0 && <StatsList match={match} />}
      <MatchInfo match={match} />
    </Box>
  );
}

function ScoreHeader({ match }: { match: MatchDetail }) {
  const isLive = match.status === "in";
  const isFinal = match.status === "post";
  const dateStr = (() => {
    try { return format(parseISO(match.date), "EEE, MMM d · h:mm a"); }
    catch { return ""; }
  })();

  return (
    <Box
      sx={{
        bgcolor: "primary.main",
        color: "#fff",
        pt: 2,
        pb: 3,
        px: 2,
        textAlign: "center",
      }}
    >
      {/* Status */}
      <Box sx={{ mb: 1.5 }}>
        {isLive ? (
          <Chip
            label={match.statusText}
            size="small"
            sx={{
              bgcolor: "#e53935",
              color: "#fff",
              fontWeight: 700,
              animation: "pulse 1.5s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.6 },
              },
            }}
          />
        ) : isFinal ? (
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            Final
          </Typography>
        ) : (
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {dateStr}
          </Typography>
        )}
      </Box>

      {/* Teams + scores */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <TeamBlock team={match.awayTeam} status={match.status} />

        <Box sx={{ textAlign: "center", minWidth: 72 }}>
          {match.status !== "pre" ? (
            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: -1 }}>
              {match.awayTeam.score ?? "–"}&nbsp;–&nbsp;{match.homeTeam.score ?? "–"}
            </Typography>
          ) : (
            <Typography variant="h5" sx={{ opacity: 0.6, fontWeight: 600 }}>
              vs
            </Typography>
          )}
          {isLive && match.clock && (
            <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.25, display: "block" }}>
              {match.clock}
            </Typography>
          )}
          {isFinal && (
            <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.25, display: "block" }}>
              {dateStr}
            </Typography>
          )}
        </Box>

        <TeamBlock team={match.homeTeam} status={match.status} />
      </Box>
    </Box>
  );
}

function TeamBlock({
  team,
  status,
}: {
  team: MatchDetail["homeTeam"];
  status: MatchDetail["status"];
}) {
  const homeScore = parseInt(team.score ?? "-1");
  const isWinner = status === "post" && homeScore >= 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, flex: 1 }}>
      {team.logo ? (
        <Box
          component="img"
          src={team.logo}
          alt={team.abbr}
          sx={{ width: 52, height: 52, objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
        />
      ) : (
        <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: `#${team.color}` }} />
      )}
      <Typography
        variant="caption"
        sx={{ fontWeight: isWinner ? 700 : 500, opacity: isWinner ? 1 : 0.85, textAlign: "center" }}
      >
        {team.abbr}
      </Typography>
    </Box>
  );
}

function GoalsList({ match }: { match: MatchDetail }) {
  return (
    <Box sx={{ px: 2, pt: 2 }}>
      <SectionLabel>Goals</SectionLabel>
      {match.goals.map((g, i) => {
        const isHome = g.teamId === match.homeTeam.id;
        return (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: isHome ? "flex-end" : "flex-start",
              py: 0.75,
            }}
          >
            {!isHome && (
              <Box
                component="img"
                src={match.awayTeam.logo}
                alt={match.awayTeam.abbr}
                sx={{ width: 20, height: 20, objectFit: "contain", mr: 1, flexShrink: 0 }}
              />
            )}
            <Typography variant="body2">
              {g.scorer}
              {g.ownGoal ? " (OG)" : ""}
              {g.penalty ? " (P)" : ""}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mx: 1 }}>
              {g.minute}
            </Typography>
            {isHome && (
              <Box
                component="img"
                src={match.homeTeam.logo}
                alt={match.homeTeam.abbr}
                sx={{ width: 20, height: 20, objectFit: "contain", ml: 1, flexShrink: 0 }}
              />
            )}
          </Box>
        );
      })}
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
}

function StatsList({ match }: { match: MatchDetail }) {
  return (
    <Box sx={{ px: 2, pt: 2 }}>
      <SectionLabel>Match Stats</SectionLabel>

      {/* Team headers */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box component="img" src={match.awayTeam.logo} alt={match.awayTeam.abbr} sx={{ width: 18, height: 18, objectFit: "contain" }} />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{match.awayTeam.abbr}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{match.homeTeam.abbr}</Typography>
          <Box component="img" src={match.homeTeam.logo} alt={match.homeTeam.abbr} sx={{ width: 18, height: 18, objectFit: "contain" }} />
        </Box>
      </Box>

      {match.stats.map((s) => (
        <StatBar key={s.name} stat={s} />
      ))}
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
}

function StatBar({ stat }: { stat: MatchDetail["stats"][0] }) {
  const away = parseFloat(stat.awayValue) || 0;
  const home = parseFloat(stat.homeValue) || 0;
  const total = away + home;
  const awayPct = total === 0 ? 50 : (away / total) * 100;
  const homePct = total === 0 ? 50 : (home / total) * 100;

  return (
    <Box sx={{ mb: 1.25 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 28 }}>
          {stat.awayValue}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: "center" }}>
          {stat.label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 28, textAlign: "right" }}>
          {stat.homeValue}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", bgcolor: "grey.200" }}>
        <Box sx={{ width: `${awayPct}%`, bgcolor: "primary.main", transition: "width 0.3s" }} />
        <Box sx={{ width: `${homePct}%`, bgcolor: "grey.400", transition: "width 0.3s" }} />
      </Box>
    </Box>
  );
}

function MatchInfo({ match }: { match: MatchDetail }) {
  const hasInfo = match.venue || match.broadcasts.length > 0;
  if (!hasInfo) return null;

  return (
    <Box sx={{ px: 2, pt: 2 }}>
      <SectionLabel>Info</SectionLabel>
      {match.venue && (
        <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
          <Typography variant="body2" color="text.secondary">Venue</Typography>
          <Typography variant="body2" sx={{ textAlign: "right", maxWidth: "60%" }}>
            {match.city ? `${match.venue} · ${match.city}` : match.venue}
          </Typography>
        </Box>
      )}
      {match.broadcasts.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
          <Typography variant="body2" color="text.secondary">TV</Typography>
          <Typography variant="body2">{match.broadcasts.join(", ")}</Typography>
        </Box>
      )}
    </Box>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{ display: "block", color: "text.secondary", fontWeight: 700, letterSpacing: "0.08em", mb: 0.5 }}
    >
      {children}
    </Typography>
  );
}
