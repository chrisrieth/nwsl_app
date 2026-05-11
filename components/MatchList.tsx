"use client";

import { Match } from "@/lib/espn";
import MatchCard from "./MatchCard";
import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";

interface Props {
  matches: Match[];
  emptyMessage?: string;
}

function findAnchorIndex(matches: Match[]): number {
  const inProgress = matches.findIndex((m) => m.status === "in");
  if (inProgress !== -1) return inProgress;

  const upcoming = matches.findIndex((m) => m.status === "pre");
  if (upcoming !== -1) return upcoming;

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
  const didInitialScrollRef = useRef(false);

  useEffect(() => {
    if (matches.length === 0 || didInitialScrollRef.current) return;
    didInitialScrollRef.current = true;
    const handle = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById("anchor-match");
        if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      });
    });
    return () => cancelAnimationFrame(handle);
  }, [matches]);

  if (matches.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
          fontSize: "0.75rem",
          letterSpacing: "0.10em",
          color: "#444",
        }}
      >
        {emptyMessage.toUpperCase()}
      </Box>
    );
  }

  const anchorIndex = findAnchorIndex(matches);

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
      {groups.map((group) => {
        const isSpecial = group.label === "Today" || group.label === "Tomorrow" || group.label === "Yesterday";
        return (
          <Box key={group.label}>
            <Box
              sx={{
                px: 2,
                pt: 2,
                pb: 0.75,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderTop: "7px solid transparent",
                  borderBottom: "7px solid transparent",
                  borderLeft: `10px solid ${isSpecial ? "#FF2D55" : "#333"}`,
                  flexShrink: 0,
                }}
              />
              <Box
                sx={{
                  fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.10em",
                  color: isSpecial ? "#FF2D55" : "#555",
                  transform: "skewX(-6deg)",
                }}
              >
                {group.label.toUpperCase()}
              </Box>
              <Box sx={{ flex: 1, height: "2px", bgcolor: isSpecial ? "#FF2D5522" : "#1a1a1a" }} />
            </Box>

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
        );
      })}
    </Box>
  );
}
