"use client";

import { useEffect, useState, useCallback } from "react";
import { Match, Team } from "@/lib/espn";
import { getFavoriteTeam, setFavoriteTeam } from "@/lib/favorites";
import MatchList from "@/components/MatchList";
import TeamPicker from "@/components/TeamPicker";
import AppBar from "@/components/AppBar";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Skeleton,
} from "@mui/material";

type Phase = "loading" | "pick" | "home";

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
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
      .then(setTeams)
      .catch(console.error);
  }, []);

  const loadSchedule = useCallback((teamId: string) => {
    setMatchesLoading(true);
    fetch(`/api/schedule/${teamId}`)
      .then((r) => r.json())
      .then((data: Match[]) => {
        setMatches(data);
        setMatchesLoading(false);
      })
      .catch(() => setMatchesLoading(false));
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
