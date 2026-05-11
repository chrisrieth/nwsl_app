"use client";

import { Match } from "@/lib/espn";
import { Box } from "@mui/material";
import { differenceInCalendarDays, format, parseISO } from "date-fns";

interface Props {
  match: Match;
  anchor?: boolean;
}

function isToday(dateStr: string) {
  return differenceInCalendarDays(parseISO(dateStr), new Date()) === 0;
}

function isTomorrow(dateStr: string) {
  return differenceInCalendarDays(parseISO(dateStr), new Date()) === 1;
}

function isYesterday(dateStr: string) {
  return differenceInCalendarDays(parseISO(dateStr), new Date()) === -1;
}

function formatMatchTime(dateStr: string) {
  return format(parseISO(dateStr), "h:mm a");
}

function Burst({ size = 64, color = "#FF2D55" }: { size?: number; color?: string }) {
  const spikes = 16;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = (i % 2 === 0 ? 0.5 : 0.33) * size;
    const ang = (i / (spikes * 2)) * Math.PI * 2;
    pts.push(`${size / 2 + Math.cos(ang) * r},${size / 2 + Math.sin(ang) * r}`);
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", top: -6, right: -10, pointerEvents: "none", zIndex: 0 }}
    >
      <polygon points={pts.join(" ")} fill={color} stroke="#0a0a0a" strokeWidth="2" strokeLinejoin="miter" />
    </svg>
  );
}

export default function MatchCard({ match, anchor }: Props) {
  const accent = `#${match.homeTeam.color || "FF2D55"}`;
  const isLive = match.status === "in";
  const isFinal = match.status === "post";

  const homeScore = match.homeTeam.score !== undefined ? parseInt(match.homeTeam.score) : null;
  const awayScore = match.awayTeam.score !== undefined ? parseInt(match.awayTeam.score) : null;

  const homeWins = isFinal && homeScore !== null && awayScore !== null && homeScore > awayScore;
  const awayWins = isFinal && homeScore !== null && awayScore !== null && awayScore > homeScore;

  const today = isToday(match.date);
  const tomorrow = isTomorrow(match.date);
  const yesterday = isYesterday(match.date);

  let topBadge: { label: string; bg: string; color: string } | null = null;
  if (isLive) {
    topBadge = { label: `● LIVE · ${match.statusText}`, bg: accent, color: "#0a0a0a" };
  } else if (isFinal) {
    topBadge = { label: "FINAL", bg: "#1a1a1a", color: "#555" };
  } else if (today) {
    topBadge = { label: "TODAY", bg: accent, color: "#0a0a0a" };
  } else if (tomorrow) {
    topBadge = { label: "TOMORROW", bg: "#1a1a1a", color: "#fff" };
  } else if (yesterday) {
    topBadge = { label: "YESTERDAY", bg: "#1a1a1a", color: "#555" };
  }

  return (
    <Box
      id={anchor ? "anchor-match" : undefined}
      sx={{
        mb: 1.5,
        scrollMarginTop: anchor ? 72 : 0,
        position: "relative",
        clipPath: "polygon(0 14px, 100% 0, 100% calc(100% - 14px), 0 100%)",
        bgcolor: "#111111",
        px: 2,
        pt: topBadge ? "22px" : "14px",
        pb: "14px",
        outline: anchor ? `2px solid ${accent}` : "none",
        boxShadow: isLive ? `0 0 24px ${accent}44` : "none",
      }}
    >
      {/* Status badge */}
      {topBadge && (
        <Box
          sx={{
            position: "absolute",
            top: -1,
            right: 18,
            px: "10px",
            py: "3px",
            bgcolor: topBadge.bg,
            color: topBadge.color,
            fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.10em",
            clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)",
            ...(isLive && {
              animation: "kpulse 1.5s ease-in-out infinite",
              "@keyframes kpulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.65 },
              },
            }),
          }}
        >
          {topBadge.label}
        </Box>
      )}

      {/* Main score grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 1,
          position: "relative",
        }}
      >
        {/* Home team */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {match.homeTeam.logo && (
              <Box
                component="img"
                src={match.homeTeam.logo}
                alt={match.homeTeam.abbr}
                sx={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }}
              />
            )}
            <Box
              sx={{
                fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                fontSize: "0.75rem",
                color: isFinal && !homeWins ? "#444" : "#fff",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              {match.homeTeam.abbr.toUpperCase()}
            </Box>
          </Box>
          {(isLive || isFinal) && homeScore !== null && (
            <Box
              sx={{
                fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                fontSize: "2.8rem",
                lineHeight: 0.85,
                color: isLive ? accent : homeWins ? "#fff" : "#444",
                transform: "skewX(-6deg)",
                display: "inline-block",
              }}
            >
              {homeScore}
            </Box>
          )}
        </Box>

        {/* Center */}
        <Box sx={{ textAlign: "center", position: "relative", minWidth: 40 }}>
          {isLive && <Burst size={60} color={accent} />}
          {isLive || isFinal ? (
            <Box
              sx={{
                fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                fontSize: "1.1rem",
                color: "#333",
                transform: "skewX(-6deg)",
                position: "relative",
                zIndex: 1,
              }}
            >
              –
            </Box>
          ) : (
            <Box
              sx={{
                fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                fontSize: "0.65rem",
                color: "#555",
                letterSpacing: "0.06em",
              }}
            >
              {formatMatchTime(match.date)}
            </Box>
          )}
        </Box>

        {/* Away team */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-end" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexDirection: "row-reverse" }}>
            {match.awayTeam.logo && (
              <Box
                component="img"
                src={match.awayTeam.logo}
                alt={match.awayTeam.abbr}
                sx={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }}
              />
            )}
            <Box
              sx={{
                fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                fontSize: "0.75rem",
                color: isFinal && !awayWins ? "#444" : "#fff",
                letterSpacing: "0.04em",
                lineHeight: 1,
                textAlign: "right",
              }}
            >
              {match.awayTeam.abbr.toUpperCase()}
            </Box>
          </Box>
          {(isLive || isFinal) && awayScore !== null && (
            <Box
              sx={{
                fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                fontSize: "2.8rem",
                lineHeight: 0.85,
                color: isLive ? "#fff" : awayWins ? "#fff" : "#444",
                transform: "skewX(-6deg)",
                display: "inline-block",
                opacity: isLive ? 0.55 : 1,
              }}
            >
              {awayScore}
            </Box>
          )}
        </Box>
      </Box>

      {/* Full team names row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", mt: 0.75 }}>
        <Box
          sx={{
            fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.05em",
            color: "#3a3a3a",
          }}
        >
          {match.homeTeam.name.toUpperCase()}
        </Box>
        <Box
          sx={{
            fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.05em",
            color: "#3a3a3a",
            textAlign: "right",
          }}
        >
          {match.awayTeam.name.toUpperCase()}
        </Box>
      </Box>

      {/* Venue */}
      {match.venue && (
        <Box
          sx={{
            mt: 1,
            pt: 0.75,
            borderTop: `1px dashed ${accent}33`,
            fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.10em",
            color: "#3a3a3a",
          }}
        >
          {(match.city ?? match.venue).toUpperCase()}
        </Box>
      )}
    </Box>
  );
}
