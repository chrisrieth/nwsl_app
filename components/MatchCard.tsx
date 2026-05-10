"use client";

import { Match } from "@/lib/espn";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Typography,
} from "@mui/material";
import { differenceInCalendarDays, format, parseISO } from "date-fns";

interface Props {
  match: Match;
  anchor?: boolean;
}

function isToday(dateStr: string) {
  return differenceInCalendarDays(parseISO(dateStr), new Date()) === 0;
}

function isYesterday(dateStr: string) {
  return differenceInCalendarDays(parseISO(dateStr), new Date()) === -1;
}

function isTomorrow(dateStr: string) {
  return differenceInCalendarDays(parseISO(dateStr), new Date()) === 1;
}

function formatMatchDate(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(dateStr)) return format(d, "h:mm a");
  if (isYesterday(dateStr)) return `Yesterday · ${format(d, "h:mm a")}`;
  if (isTomorrow(dateStr)) return `Tomorrow · ${format(d, "h:mm a")}`;
  return format(d, "EEE, MMM d · h:mm a");
}

function StatusChip({ match }: { match: Match }) {
  if (match.status === "in") {
    return (
      <Chip
        label={match.statusText}
        size="small"
        sx={{
          bgcolor: "#e53935",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.7rem",
          animation: "pulse 1.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.6 },
          },
        }}
      />
    );
  }
  if (match.status === "post") {
    return (
      <Chip
        label="Final"
        size="small"
        sx={{ bgcolor: "grey.200", color: "text.secondary", fontWeight: 600, fontSize: "0.7rem" }}
      />
    );
  }
  return null;
}

function TeamRow({
  team,
  score,
  isWinner,
  status,
}: {
  team: Match["homeTeam"];
  score?: string;
  isWinner: boolean;
  status: Match["status"];
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
      {team.logo ? (
        <Box
          component="img"
          src={team.logo}
          alt={team.abbr}
          sx={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }}
        />
      ) : (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: `#${team.color}`,
            flexShrink: 0,
          }}
        />
      )}
      <Typography
        variant="body1"
        sx={{
          flex: 1,
          fontWeight: isWinner ? 700 : 400,
          color: status === "post" && !isWinner ? "text.secondary" : "text.primary",
        }}
      >
        {team.name}
      </Typography>
      {score !== undefined && (
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontWeight: isWinner ? 700 : 400,
            minWidth: 28,
            textAlign: "right",
            color: status === "post" && !isWinner ? "text.secondary" : "text.primary",
          }}
        >
          {score}
        </Typography>
      )}
    </Box>
  );
}

export default function MatchCard({ match, anchor }: Props) {
  const homeScore = match.homeTeam.score !== undefined ? parseInt(match.homeTeam.score) : null;
  const awayScore = match.awayTeam.score !== undefined ? parseInt(match.awayTeam.score) : null;

  const homeWins =
    match.status === "post" && homeScore !== null && awayScore !== null && homeScore > awayScore;
  const awayWins =
    match.status === "post" && homeScore !== null && awayScore !== null && awayScore > homeScore;

  const gameDayHighlight = isToday(match.date) || isYesterday(match.date) || isTomorrow(match.date);

  return (
    <Card
      id={anchor ? "anchor-match" : undefined}
      sx={{
        mb: 1.5,
        border: anchor ? "2px solid" : "none",
        borderColor: anchor ? "primary.main" : "transparent",
        bgcolor: match.status === "in" ? "rgba(229,57,53,0.04)" : gameDayHighlight ? "rgba(26,26,46,0.03)" : "background.paper",
      }}
    >
      <CardActionArea sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatMatchDate(match.date)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {gameDayHighlight && match.status === "pre" && isToday(match.date) && (
              <Chip label="TODAY" size="small" color="primary" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
            )}
            <StatusChip match={match} />
          </Box>
        </Box>

        <TeamRow
          team={match.awayTeam}
          score={match.awayTeam.score}
          isWinner={awayWins}
          status={match.status}
        />
        <TeamRow
          team={match.homeTeam}
          score={match.homeTeam.score}
          isWinner={homeWins}
          status={match.status}
        />

        {match.venue && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
            {match.city ?? match.venue}
          </Typography>
        )}
      </CardActionArea>
    </Card>
  );
}
