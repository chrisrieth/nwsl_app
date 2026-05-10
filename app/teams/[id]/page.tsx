"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Match, Team } from "@/lib/espn";
import { getFavoriteTeam, setFavoriteTeam } from "@/lib/favorites";
import MatchList from "@/components/MatchList";
import AppBar from "@/components/AppBar";
import { Box, Button, Skeleton, Snackbar } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [matches, setMatches] = useState<Match[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    setIsFav(getFavoriteTeam() === id);

    fetch("/api/teams")
      .then((r) => r.json())
      .then((teams) => {
        if (!Array.isArray(teams)) return;
        const found = teams.find((t: Team) => t.id === id);
        if (found) setTeam(found);
      })
      .catch(console.error);

    fetch(`/api/schedule/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load team schedule", err);
        setLoading(false);
      });
  }, [id]);

  function toggleFavorite() {
    if (isFav) return;
    setFavoriteTeam(id);
    setIsFav(true);
    setSnackOpen(true);
  }

  return (
    <>
      <AppBar
        title={team?.shortName ?? "Team"}
        subtitle={team?.name}
        showBack
        teamColor={team?.color}
      />

      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Button
          size="small"
          variant={isFav ? "contained" : "outlined"}
          startIcon={isFav ? <StarIcon /> : <StarBorderIcon />}
          onClick={toggleFavorite}
          disabled={isFav}
          sx={{ borderRadius: 20 }}
        >
          {isFav ? "Your Favorite Team" : "Set as Favorite"}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ px: 2, py: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 1.5, borderRadius: 2 }} />
          ))}
        </Box>
      ) : (
        <MatchList matches={matches} emptyMessage="No schedule data available." />
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message={`${team?.shortName ?? "Team"} set as your favorite`}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: "56px" }}
      />
    </>
  );
}
