"use client";

import { Team } from "@/lib/espn";
import { setFavoriteTeam } from "@/lib/favorites";
import { Box } from "@mui/material";

interface Props {
  teams: Team[];
  onSelect: (teamId: string) => void;
}

export default function TeamPicker({ teams, onSelect }: Props) {
  function handleSelect(teamId: string) {
    setFavoriteTeam(teamId);
    onSelect(teamId);
  }

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Box
        sx={{
          fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
          fontSize: "0.65rem",
          letterSpacing: "0.10em",
          color: "#555",
          mb: 2,
        }}
      >
        YOUR HOME SCREEN WILL SHOW THEIR SCHEDULE AND SCORES.
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        {teams.map((team) => {
          const accent = `#${team.color || "FF2D55"}`;
          return (
            <Box
              key={team.id}
              onClick={() => handleSelect(team.id)}
              sx={{
                position: "relative",
                cursor: "pointer",
                clipPath: "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
                bgcolor: "#111111",
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                minHeight: 100,
                overflow: "hidden",
                WebkitTapHighlightColor: "transparent",
                "&:active": { opacity: 0.8 },
              }}
            >
              {/* Team color wedge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: -20,
                  width: "55%",
                  height: "100%",
                  bgcolor: accent,
                  clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)",
                  opacity: 0.15,
                }}
              />
              {team.logo ? (
                <Box
                  component="img"
                  src={team.logo}
                  alt={team.name}
                  sx={{ width: 46, height: 46, objectFit: "contain", position: "relative", zIndex: 1 }}
                />
              ) : (
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    bgcolor: accent,
                    clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
                    display: "grid",
                    placeItems: "center",
                    position: "relative",
                    zIndex: 1,
                    fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                    fontSize: "0.9rem",
                    color: "#0a0a0a",
                  }}
                >
                  {team.abbr}
                </Box>
              )}
              <Box
                sx={{
                  fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.08em",
                  color: "#fff",
                  textAlign: "center",
                  position: "relative",
                  zIndex: 1,
                  lineHeight: 1.2,
                }}
              >
                {team.shortName.toUpperCase()}
              </Box>
              {/* Accent bottom stripe */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: accent,
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
