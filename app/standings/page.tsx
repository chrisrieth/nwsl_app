"use client";

import { useEffect, useState } from "react";
import { StandingRow } from "@/lib/espn";
import AppBar from "@/components/AppBar";
import { Box, Skeleton } from "@mui/material";
import { getFavoriteTeam } from "@/lib/favorites";

const ACCENT = "#FF2D55";

export default function StandingsPage() {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const favId = typeof window !== "undefined" ? getFavoriteTeam() : null;

  useEffect(() => {
    fetch("/api/standings")
      .then((r) => r.json())
      .then((data: StandingRow[]) => {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <AppBar title="Table" />

      <Box sx={{ px: 2, pt: 1.5 }}>
        {loading ? (
          <>
            {[...Array(12)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  height: 44,
                  mb: 1,
                  bgcolor: "#111111",
                  clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                <Skeleton variant="rectangular" height={44} sx={{ bgcolor: "#1a1a1a" }} />
              </Box>
            ))}
          </>
        ) : rows.length === 0 ? (
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
            NO STANDINGS DATA AVAILABLE
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "20px 28px 1fr 28px 28px 28px 36px 36px",
                gap: "4px",
                px: 1,
                pb: 1,
                fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.10em",
                color: "#444",
                borderBottom: "2px solid #fff",
              }}
            >
              <span />
              <span>#</span>
              <span>CLUB</span>
              <span style={{ textAlign: "right" }}>W</span>
              <span style={{ textAlign: "right" }}>D</span>
              <span style={{ textAlign: "right" }}>L</span>
              <span style={{ textAlign: "right" }}>GD</span>
              <span style={{ textAlign: "right" }}>PTS</span>
            </Box>

            {rows.map((row, idx) => {
              const rank = idx + 1;
              const isFav = row.team.id === favId;
              // tier: top 6 playoffs, 7-8 play-in, rest out
              const tier = rank <= 6 ? "P" : rank <= 8 ? "I" : "O";
              const tierColor = tier === "P" ? ACCENT : tier === "I" ? "#fff" : "#2a2a2a";

              return (
                <Box
                  key={row.team.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "20px 28px 1fr 28px 28px 28px 36px 36px",
                    gap: "4px",
                    alignItems: "center",
                    px: 1,
                    py: "7px",
                    borderBottom: "1px solid #1a1a1a",
                    bgcolor: isFav ? "#1a1a1a" : "transparent",
                    clipPath: isFav ? "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)" : "none",
                    fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                    fontSize: "0.7rem",
                    color: "#fff",
                  }}
                >
                  {/* Tier indicator */}
                  <Box
                    sx={{
                      width: 5,
                      height: 20,
                      bgcolor: tierColor,
                      clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
                    }}
                  />

                  {/* Rank */}
                  <Box
                    sx={{
                      transform: "skewX(-6deg)",
                      fontSize: "0.85rem",
                      color: isFav ? ACCENT : "#fff",
                    }}
                  >
                    {rank}
                  </Box>

                  {/* Club */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    {row.team.logo && (
                      <Box
                        component="img"
                        src={row.team.logo}
                        alt={row.team.abbr}
                        sx={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }}
                      />
                    )}
                    <Box
                      sx={{
                        fontSize: "0.65rem",
                        letterSpacing: "0.05em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: isFav ? "#fff" : "#aaa",
                      }}
                    >
                      {row.team.abbr.toUpperCase()}
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "right", color: "#aaa" }}>{row.w}</Box>
                  <Box sx={{ textAlign: "right", color: "#aaa" }}>{row.d}</Box>
                  <Box sx={{ textAlign: "right", color: "#aaa" }}>{row.l}</Box>
                  <Box sx={{ textAlign: "right", color: "#aaa" }}>
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </Box>
                  <Box
                    sx={{
                      textAlign: "right",
                      fontSize: "0.85rem",
                      color: isFav ? ACCENT : "#fff",
                      transform: "skewX(-6deg)",
                    }}
                  >
                    {row.pts}
                  </Box>
                </Box>
              );
            })}

            {/* Legend */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 2,
                mb: 1,
                fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
              }}
            >
              {[
                { color: ACCENT, label: "PLAYOFFS" },
                { color: "#fff", label: "PLAY-IN" },
                { color: "#2a2a2a", label: "OUT" },
              ].map(({ color, label }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#555" }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      bgcolor: color,
                      clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
                    }}
                  />
                  {label}
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
