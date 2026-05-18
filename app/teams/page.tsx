"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Team } from "@/lib/espn";
import { getFavoriteAbbr, getFavoriteColor } from "@/lib/favorites";
import { getTeamAccent } from "@/lib/teamColors";
import { useNight } from "@/lib/useNight";
import KineticBg from "@/components/KineticBg";
import KineticBadge from "@/components/KineticBadge";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const night = useNight();
  const router = useRouter();

  const abbr = getFavoriteAbbr();
  const color = getFavoriteColor();
  const accent = abbr && color ? getTeamAccent(abbr, color, night) : night ? "#FF2D55" : "#B0102B";

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => {
        setTeams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <KineticBg accent={accent} night={night}>
      {/* Header */}
      <div style={{ padding: "14px 18px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 28, transform: "skew(-8deg)", color: "var(--ink)" }}>TEAMS</div>
        <div style={{
          background: accent, color: "#0a0a0a",
          padding: "4px 14px", fontSize: 10, letterSpacing: "0.10em",
          clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
        }}>14 CLUBS</div>
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          [...Array(10)].map((_, i) => (
            <div key={i} style={{
              height: 64, background: "#0a0a0a",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
              opacity: 0.15 + i * 0.02,
            }} />
          ))
        ) : (
          teams.map((team, i) => {
            const a = getTeamAccent(team.abbr, team.color, night);
            return (
              <button
                key={team.id}
                onClick={() => router.push(`/teams/${team.id}`)}
                style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center", gap: 14,
                  padding: "12px 16px",
                  background: "#0a0a0a", color: "#fff",
                  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
                  border: "none", cursor: "pointer", textAlign: "left",
                  transform: `rotate(${i % 2 === 0 ? 0 : 0}deg)`,
                }}
              >
                <KineticBadge abbr={team.abbr} accent={a} size={42} rotate={-6} night={night} />
                <div>
                  <div style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: 15 }}>
                    {team.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: "0.08em", marginTop: 2 }}>
                    {team.abbr}
                  </div>
                </div>
                <div style={{ color: a, fontSize: 16, opacity: 0.6 }}>▶</div>
              </button>
            );
          })
        )}
      </div>
    </KineticBg>
  );
}
