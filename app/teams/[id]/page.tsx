"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Match, Team } from "@/lib/espn";
import { getFavoriteTeam, setFavoriteTeam } from "@/lib/favorites";
import MatchList from "@/components/MatchList";
import AppBar from "@/components/AppBar";
import { Box, Skeleton, Snackbar } from "@mui/material";
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
      .then((teams: Team[]) => {
        const found = teams.find((t) => t.id === id);
        if (found) setTeam(found);
      })
      .catch(console.error);

    fetch(`/api/schedule/${id}`)
      .then((r) => r.json())
      .then((data: Match[]) => {
        setMatches(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function toggleFavorite() {
    if (isFav) return;
    setFavoriteTeam(id);
    setIsFav(true);
    setSnackOpen(true);
  }

  const accent = team?.color ? `#${team.color}` : "#FF2D55";

  return (
    <>
      <AppBar
        title={team?.shortName ?? "Team"}
        showBack
        teamColor={team?.color}
      />

      {/* Team hero */}
      {team && (
        <Box
          sx={{
            mx: 2,
            mt: 1.5,
            mb: 2,
            position: "relative",
            clipPath: "polygon(0 12px, 100% 0, 100% calc(100% - 12px), 0 100%)",
            bgcolor: "#111111",
            p: "20px 16px",
            overflow: "hidden",
          }}
        >
          {/* Color wedge */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: -30,
              width: "55%",
              height: "100%",
              bgcolor: accent,
              clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)",
              opacity: 0.9,
            }}
          />
          {/* Halftone over wedge */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: -30,
              width: "55%",
              height: "100%",
              backgroundImage: "radial-gradient(#0a0a0a 1.3px, transparent 1.5px)",
              backgroundSize: "8px 8px",
              clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)",
              opacity: 0.4,
            }}
          />

          <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 2 }}>
            {team.logo ? (
              <Box
                component="img"
                src={team.logo}
                alt={team.name}
                sx={{ width: 64, height: 64, objectFit: "contain", flexShrink: 0 }}
              />
            ) : (
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: accent,
                  clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                  fontSize: "1.2rem",
                  color: "#0a0a0a",
                  flexShrink: 0,
                }}
              >
                {team.abbr}
              </Box>
            )}
            <Box>
              <Box
                sx={{
                  fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                  fontSize: "1.8rem",
                  lineHeight: 0.9,
                  color: "#fff",
                  transform: "skewX(-7deg)",
                  display: "inline-block",
                }}
              >
                {team.shortName.toUpperCase()}
              </Box>
              <Box
                sx={{
                  fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  color: "#0a0a0a",
                  mt: 0.5,
                }}
              >
                {team.name.toUpperCase()}
              </Box>
            </Box>
          </Box>

          {/* Favorite button */}
          <Box sx={{ position: "relative", mt: 2 }}>
            <Box
              onClick={toggleFavorite}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: "12px",
                py: "5px",
                bgcolor: isFav ? accent : "transparent",
                color: isFav ? "#0a0a0a" : accent,
                border: `2px solid ${accent}`,
                clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
                cursor: isFav ? "default" : "pointer",
              }}
            >
              {isFav ? <StarIcon sx={{ fontSize: 14 }} /> : <StarBorderIcon sx={{ fontSize: 14 }} />}
              {isFav ? "FAVORITE" : "SET AS FAVORITE"}
            </Box>
          </Box>
        </Box>
      )}

      {loading ? (
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
      ) : (
        <MatchList matches={matches} emptyMessage="No schedule data available." />
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message={`${team?.shortName ?? "Team"} set as your favorite`}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: "64px" }}
      />
    </>
  );
}
