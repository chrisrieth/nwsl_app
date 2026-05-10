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
  DialogTitle,
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

  const loadSchedule = useCallback((teamId: string) => {
    setMatchesLoading(true);
    setMatchesError(null);
    fetch(`/api/schedule/${teamId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        const data = await r.json();
        if (!Array.isArray(data)) {
          console.error("Schedule API returned non-array", data);
          throw new Error("Unexpected response shape");
        }
        return data as Match[];
      })
      .then((data) => {
        setMatches(data);
        setMatchesLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load schedule", err);
        setMatches([]);
        setMatchesError(err instanceof Error ? err.message : "Failed to load schedule");
        setMatchesLoading(false);
      });
  }, []);

  useEffect(() => {
    if (phase === "home" && favoriteId) {
      loadSchedule(favoriteId);
    }
  }, [phase, favoriteId, loadSchedule]);

  function handleTeamSelect(teamId: string) {
    setFavoriteTeam(teamId);
    setFavoriteId(teamId);
    setPickerOpen(false);
    setPhase("home");
  }

  const favoriteTeam = teams.find((t) => t.id === favoriteId);

  if (phase === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (phase === "pick") {
    return (
      <>
        <AppBar title="NWSL" subtitle="Pick your team to get started" />
        {teams.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1.5, borderRadius: 2 }} />
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
            <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 1.5, borderRadius: 2 }} />
          ))}
        </Box>
      ) : matchesError ? (
        <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
          <Typography variant="body1" gutterBottom>
            Could not load schedule.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            {matchesError}
          </Typography>
          <Button variant="contained" onClick={() => favoriteId && loadSchedule(favoriteId)}>
            Retry
          </Button>
        </Box>
      ) : matches.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
          <Typography variant="body1" gutterBottom>
            No schedule data available yet.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => favoriteId && loadSchedule(favoriteId)}
          >
            Refresh
          </Button>
        </Box>
      ) : (
        <MatchList matches={matches} emptyMessage="No schedule data available yet." />
      )}

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} fullScreen>
        <DialogTitle sx={{ bgcolor: "primary.main", color: "#fff", py: 2 }}>
          Change Favorite Team
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {teams.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TeamPicker teams={teams} onSelect={handleTeamSelect} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
