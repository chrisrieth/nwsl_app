"use client";

import { useEffect, useState, useCallback } from "react";
import { Match, Team } from "@/lib/espn";
import { getFavoriteTeam, setFavoriteTeam } from "@/lib/favorites";
import MatchList from "@/components/MatchList";
import TeamPicker from "@/components/TeamPicker";
import AppBar from "@/components/AppBar";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Skeleton,
  Typography,
} from "@mui/material";

type Phase = "loading" | "pick" | "home";

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const fav = getFavoriteTeam();
    if (fav) {
      setFavoriteId(fav);
      setPhase("home");
    } else {
      setPhase("pick");
    }
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => setTeams(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load teams", err));
  }, []);

  async function fetchSchedule(teamId: string): Promise<Match[]> {
    const r = await fetch(`/api/schedule/${teamId}`);
    if (!r.ok) throw new Error(`API returned ${r.status}`);
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error("Unexpected response shape");
    return data as Match[];
  }

  const loadSchedule = useCallback((teamId: string) => {
    setMatchesLoading(true);
    setMatchesError(null);
    fetchSchedule(teamId)
      .then((data) => {
        setMatches(data);
        setMatchesLoading(false);
      })
      .catch((err) => {
        setMatches([]);
        setMatchesError(err instanceof Error ? err.message : "Failed to load schedule");
        setMatchesLoading(false);
      });
  }, []);

  const refreshSchedule = useCallback((teamId: string) => {
    fetchSchedule(teamId)
      .then(setMatches)
      .catch((err) => console.error("Schedule refresh failed", err));
  }, []);

  useEffect(() => {
    if (phase === "home" && favoriteId) loadSchedule(favoriteId);
  }, [phase, favoriteId, loadSchedule]);

  useEffect(() => {
    if (phase !== "home" || !favoriteId) return;
    const hasLive = matches.some((m) => m.status === "in");
    if (!hasLive) return;
    const id = setInterval(() => refreshSchedule(favoriteId), 20000);
    return () => clearInterval(id);
  }, [phase, favoriteId, matches, refreshSchedule]);

  function handleTeamSelect(teamId: string) {
    setFavoriteTeam(teamId);
    setFavoriteId(teamId);
    setPickerOpen(false);
    setPhase("home");
  }

  const favoriteTeam = teams.find((t) => t.id === favoriteId);
  const accent = favoriteTeam?.color ? `#${favoriteTeam.color}` : "#FF2D55";

  if (phase === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress sx={{ color: "#FF2D55" }} />
      </Box>
    );
  }

  if (phase === "pick") {
    return (
      <>
        <AppBar title="NWSL" subtitle="Pick your team" />
        {teams.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            {[...Array(6)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  height: 52,
                  mb: 1.5,
                  clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                  overflow: "hidden",
                }}
              >
                <Skeleton variant="rectangular" height={52} sx={{ bgcolor: "#1a1a1a" }} />
              </Box>
            ))}
          </Box>
        ) : (
          <TeamPicker teams={teams} onSelect={handleTeamSelect} />
        )}
      </>
    );
  }

  return (
    <>
      <AppBar
        title={favoriteTeam?.shortName ?? "NWSL"}
        subtitle="Schedule & Scores"
        teamColor={favoriteTeam?.color}
        onSettingsClick={() => setPickerOpen(true)}
      />

      {matchesLoading ? (
        <Box sx={{ px: 2, py: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Box
              key={i}
              sx={{
                height: 100,
                mb: 1.5,
                clipPath: "polygon(0 14px, 100% 0, 100% calc(100% - 14px), 0 100%)",
                overflow: "hidden",
              }}
            >
              <Skeleton variant="rectangular" height={100} sx={{ bgcolor: "#1a1a1a" }} />
            </Box>
          ))}
        </Box>
      ) : matchesError ? (
        <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.10em",
              color: "#444",
              mb: 2,
            }}
          >
            COULD NOT LOAD SCHEDULE
          </Typography>
          <Button
            onClick={() => favoriteId && loadSchedule(favoriteId)}
            sx={{
              fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.10em",
              bgcolor: accent,
              color: "#0a0a0a",
              px: 3,
              py: 1,
              borderRadius: 0,
              clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
              "&:hover": { bgcolor: accent, opacity: 0.85 },
            }}
          >
            RETRY
          </Button>
        </Box>
      ) : matches.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.10em",
              color: "#444",
              mb: 2,
            }}
          >
            NO SCHEDULE DATA AVAILABLE YET
          </Typography>
          <Button
            onClick={() => favoriteId && loadSchedule(favoriteId)}
            sx={{
              fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.10em",
              border: `2px solid ${accent}`,
              color: accent,
              px: 3,
              py: 1,
              borderRadius: 0,
              "&:hover": { bgcolor: `${accent}22` },
            }}
          >
            REFRESH
          </Button>
        </Box>
      ) : (
        <MatchList matches={matches} emptyMessage="No schedule data available yet." />
      )}

      {/* Team picker dialog */}
      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} fullScreen>
        <Box
          sx={{
            bgcolor: "#0a0a0a",
            borderBottom: `3px solid ${accent}`,
            px: 2,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            onClick={() => setPickerOpen(false)}
            sx={{
              fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
              color: "#555",
              cursor: "pointer",
            }}
          >
            ◄ BACK
          </Box>
          <Box
            sx={{
              fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
              fontSize: "1.3rem",
              color: "#fff",
              transform: "skewX(-8deg)",
              display: "inline-block",
            }}
          >
            CHANGE TEAM
          </Box>
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: `9px solid ${accent}`,
              verticalAlign: "middle",
            }}
          />
        </Box>
        <DialogContent sx={{ p: 0, bgcolor: "#0a0a0a" }}>
          {teams.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#FF2D55" }} />
            </Box>
          ) : (
            <TeamPicker teams={teams} onSelect={handleTeamSelect} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
