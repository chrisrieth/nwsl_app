"use client";

import { Match } from "@/lib/espn";
import MatchCard from "./MatchCard";
import { Box, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";

interface Props {
  matches: Match[];
  emptyMessage?: string;
}

function findAnchorIndex(matches: Match[]): number {
  const now = new Date();

  // First: any in-progress match
  const inProgress = matches.findIndex((m) => m.status === "in");
  if (inProgress !== -1) return inProgress;

  // Next: soonest upcoming match
  const upcoming = matches.findIndex((m) => m.status === "pre");
  if (upcoming !== -1) return upcoming;

  // Fallback: last completed match
  for (let i = matches.length - 1; i >= 0; i--) {
    if (matches[i].status === "post") return i;
  }
  return 0;
}

function groupLabel(dateStr: string): string {
  const diff = differenceInCalendarDays(parseISO(dateStr), new Date());
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  const d = parseISO(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function MatchList({ matches, emptyMessage = "No matches found." }: Props) {
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.getElementById("anchor-match");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [matches]);

  if (matches.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
        <Typography>{emptyMessage}</Typography>
      </Box>
    );
  }

  const anchorIndex = findAnchorIndex(matches);

  // Group matches by date
  const groups: { label: string; matches: { match: Match; originalIndex: number }[] }[] = [];
  let lastLabel = "";
  for (let i = 0; i < matches.length; i++) {
    const label = groupLabel(matches[i].date);
    if (label !== lastLabel) {
      groups.push({ label, matches: [] });
      lastLabel = label;
    }
    groups[groups.length - 1].matches.push({ match: matches[i], originalIndex: i });
  }

  return (
    <Box>
      {groups.map((group) => (
        <Box key={group.label}>
          <Typography
            variant="overline"
            sx={{
              display: "block",
              px: 2,
              pt: 2,
              pb: 0.5,
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            {group.label}
          </Typography>
          <Box sx={{ px: 2 }}>
            {group.matches.map(({ match, originalIndex }) => (
              <MatchCard
                key={match.id}
                match={match}
                anchor={originalIndex === anchorIndex}
              />
            ))}
          </Box>
        </Box>
      ))}
      <div ref={anchorRef} />
    </Box>
  );
}
