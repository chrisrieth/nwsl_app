"use client";

import { useEffect, useState } from "react";
import { StandingRow } from "@/lib/espn";
import { getFavoriteAbbr, getFavoriteColor, getFavoriteTeam } from "@/lib/favorites";
import { getTeamAccent } from "@/lib/teamColors";
import { useNight } from "@/lib/useNight";
import KineticBg from "@/components/KineticBg";
import KineticBadge from "@/components/KineticBadge";

export default function StandingsPage() {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const night = useNight();

  const abbr = getFavoriteAbbr();
  const color = getFavoriteColor();
  const accent = abbr && color ? getTeamAccent(abbr, color, night) : night ? "#FF2D55" : "#B0102B";
  const favId = getFavoriteTeam();

  useEffect(() => {
    fetch("/api/standings")
      .then((r) => r.json())
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <KineticBg accent={accent} night={night}>
      {/* Header */}
      <div style={{ padding: "14px 18px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 28, transform: "skew(-8deg)", color: "var(--ink)" }}>TABLE</div>
        <div style={{
          background: accent, color: "#0a0a0a",
          padding: "4px 14px", fontSize: 10, letterSpacing: "0.10em",
          clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
        }}>2026</div>
      </div>

      {/* Legend */}
      <div style={{ padding: "0 18px 8px", display: "flex", gap: 14, fontSize: 9, letterSpacing: "0.06em", color: "var(--ink)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, background: accent, clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)" }} />
          PLAYOFFS
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.7 }}>
          <span style={{ width: 10, height: 10, background: "var(--ink)", clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)" }} />
          PLAY-IN
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.4 }}>
          <span style={{ width: 10, height: 10, background: "var(--ink-muted)", clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)" }} />
          OUT
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "20px 28px 1fr 28px 28px 28px 36px 36px",
        gap: 4, padding: "6px 14px",
        fontSize: 9, letterSpacing: "0.10em",
        color: "var(--ink-muted)",
        borderBottom: `2px solid var(--ink)`,
      }}>
        <span />
        <span>#</span>
        <span>CLUB</span>
        <span style={{ textAlign: "right" }}>W</span>
        <span style={{ textAlign: "right" }}>D</span>
        <span style={{ textAlign: "right" }}>L</span>
        <span style={{ textAlign: "right" }}>GD</span>
        <span style={{ textAlign: "right" }}>PTS</span>
      </div>

      {loading ? (
        <div style={{ padding: "4px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ height: 38, background: "var(--ink)", opacity: 0.04 + i * 0.01 }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ padding: "40px 18px", textAlign: "center", opacity: 0.5 }}>NO DATA AVAILABLE</div>
      ) : (
        <div style={{ padding: "0 14px" }}>
          {rows.map((row, i) => {
            const rank = i + 1;
            const isFocus = row.team.id === favId;
            const tier = rank <= 6 ? "P" : rank <= 8 ? "I" : "O";
            const tierColor = tier === "P" ? accent : tier === "I" ? "var(--ink)" : "var(--ink-muted)";
            const tierOpacity = tier === "O" ? 0.35 : 1;
            const gdStr = row.gd > 0 ? `+${row.gd}` : `${row.gd}`;

            return (
              <div
                key={row.team.id}
                style={{
                  display: "grid", gridTemplateColumns: "20px 28px 1fr 28px 28px 28px 36px 36px",
                  gap: 4, alignItems: "center", padding: "5px 0",
                  borderBottom: "1px solid var(--border)",
                  background: isFocus ? "#0a0a0a" : "transparent",
                  color: isFocus ? "#fff" : "var(--ink)",
                  marginLeft: isFocus ? -14 : 0, marginRight: isFocus ? -14 : 0,
                  paddingLeft: isFocus ? 14 : 0, paddingRight: isFocus ? 14 : 0,
                  clipPath: isFocus ? "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)" : "none",
                }}
              >
                {/* Tier indicator */}
                <div style={{
                  width: 6, height: 22,
                  background: tierColor,
                  opacity: tierOpacity,
                  clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
                }} />

                {/* Rank */}
                <div style={{ fontSize: 14, transform: "skew(-6deg)", display: "inline-block" }}>{rank}</div>

                {/* Club */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <KineticBadge
                    abbr={row.team.abbr}
                    accent={`#${row.team.color}`}
                    size={20}
                    rotate={-4}
                    night={night && !isFocus}
                  />
                  <span style={{ fontSize: 11 }}>{row.team.name.toUpperCase()}</span>
                </div>

                <span style={{ textAlign: "right", fontSize: 11 }}>{row.w}</span>
                <span style={{ textAlign: "right", fontSize: 11 }}>{row.d}</span>
                <span style={{ textAlign: "right", fontSize: 11 }}>{row.l}</span>
                <span style={{ textAlign: "right", fontSize: 11, opacity: 0.7 }}>{gdStr}</span>
                <span style={{
                  textAlign: "right", fontSize: 16,
                  color: isFocus ? accent : "var(--ink)",
                  transform: "skew(-6deg)", display: "inline-block",
                }}>{row.pts}</span>
              </div>
            );
          })}
        </div>
      )}
    </KineticBg>
  );
}
