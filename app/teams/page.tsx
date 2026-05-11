"use client";

import { useEffect, useState } from "react";
import { Team } from "@/lib/espn";
import AppBar from "@/components/AppBar";
import { Box, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data: Team[]) => {
        setTeams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <AppBar title="Teams" />
      <Box sx={{ px: 2, py: 2 }}>
        {loading ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            {[...Array(12)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  height: 100,
                  clipPath: "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
                  overflow: "hidden",
                }}
              >
                <Skeleton variant="rectangular" height={100} sx={{ bgcolor: "#1a1a1a" }} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            {teams.map((team) => {
              const accent = `#${team.color || "FF2D55"}`;
              return (
                <Box
                  key={team.id}
                  onClick={() => router.push(`/teams/${team.id}`)}
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
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: `0 0 16px ${accent}44`,
                    },
                    "&:active": {
                      opacity: 0.85,
                    },
                  }}
                >
                  {/* Team color wedge on right */}
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
                      sx={{ width: 48, height: 48, objectFit: "contain", position: "relative", zIndex: 1 }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
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
                      fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                      color: "#fff",
                      textAlign: "center",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {team.shortName.toUpperCase()}
                  </Box>
                  {/* Accent bottom bar */}
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
        )}
      </Box>
    </>
  );
}
