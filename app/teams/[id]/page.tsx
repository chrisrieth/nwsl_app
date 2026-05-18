"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Match, Team } from "@/lib/espn";
import { getFavoriteTeam, setFavoriteTeam, setFavoriteMeta } from "@/lib/favorites";
import { getTeamAccent } from "@/lib/teamColors";
import { useNight } from "@/lib/useNight";
import KineticBg from "@/components/KineticBg";
import KineticBadge from "@/components/KineticBadge";
import { format, parseISO } from "date-fns";

function formatResult(m: Match, teamId: string): { label: string; won: boolean; lost: boolean } {
  const isHome = m.homeTeam.id === teamId;
  const myScore = parseInt(isHome ? m.homeTeam.score ?? "0" : m.awayTeam.score ?? "0");
  const oppScore = parseInt(isHome ? m.awayTeam.score ?? "0" : m.homeTeam.score ?? "0");
  if (m.status !== "post") return { label: "UP", won: false, lost: false };
  if (myScore > oppScore) return { label: "W", won: true, lost: false };
  if (myScore < oppScore) return { label: "L", won: false, lost: true };
  return { label: "D", won: false, lost: false };
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [team, setTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const night = useNight();
  const router = useRouter();

  const accent = team ? getTeamAccent(team.abbr, team.color, night) : night ? "#FF2D55" : "#B0102B";

  useEffect(() => {
    setIsFav(getFavoriteTeam() === id);

    fetch("/api/teams")
      .then((r) => r.json())
      .then((data: Team[]) => {
        if (!Array.isArray(data)) return;
        const found = data.find((t) => t.id === id);
        if (found) setTeam(found);
      })
      .catch(console.error);

    fetch(`/api/schedule/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function handleSetFavorite() {
    if (!team || isFav) return;
    setFavoriteTeam(team.id);
    setFavoriteMeta(team.abbr, team.color);
    setIsFav(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  const nameParts = team?.name.split(" ") ?? ["NWSL"];
  const bigWord = nameParts[0].toUpperCase();
  const restWords = nameParts.slice(1).join(" ").toUpperCase();

  const recentFinished = matches.filter((m) => m.status === "post").slice(-5);
  const upcoming = matches.filter((m) => m.status === "pre");
  const live = matches.find((m) => m.status === "in");
  const displayMatches = live
    ? [live, ...upcoming.slice(0, 4)]
    : upcoming.slice(0, 5);

  // Compute form from last 8 finished
  const form = matches
    .filter((m) => m.status === "post")
    .slice(-8)
    .map((m) => formatResult(m, id).label);

  return (
    <KineticBg accent={accent} night={night}>
      {/* Back + fav */}
      <div style={{ padding: "12px 18px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => router.back()}
          style={{
            fontFamily: "var(--font-archivo), system-ui, sans-serif",
            fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.08em",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >◄ TEAMS</button>
        {!isFav ? (
          <button
            onClick={handleSetFavorite}
            style={{
              background: accent, color: "#0a0a0a",
              padding: "4px 14px", fontSize: 10, letterSpacing: "0.10em",
              clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
              border: "none", cursor: "pointer",
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
            }}
          >SET FAVORITE ★</button>
        ) : (
          <div style={{
            background: "#333", color: "#aaa",
            padding: "4px 14px", fontSize: 10, letterSpacing: "0.10em",
            clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
          }}>FAVORITE ★</div>
        )}
      </div>

      {/* Hero slab */}
      {team && (
        <div style={{ padding: "0 14px" }}>
          <div style={{
            position: "relative",
            background: "#0a0a0a", color: "#fff",
            padding: "22px 16px 22px",
            clipPath: "polygon(0 12px, 100% 0, 100% calc(100% - 12px), 0 100%)",
            overflow: "hidden",
          }}>
            {/* Accent wedge */}
            <div style={{
              position: "absolute", top: 0, right: -40, width: 240, height: "100%",
              background: accent,
              clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)",
              opacity: night ? 0.85 : 1,
            }} />
            {/* Halftone over wedge */}
            <div style={{
              position: "absolute", top: 0, right: -40, width: 240, height: "100%",
              backgroundImage: "radial-gradient(#0a0a0a 1.3px, transparent 1.5px)",
              backgroundSize: "8px 8px",
              clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)",
              opacity: 0.4,
            }} />

            {/* Name + badge */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
              <KineticBadge abbr={team.abbr} accent={accent} size={76} rotate={-10} night={night} />
              <div style={{ marginLeft: 4 }}>
                <div style={{
                  fontSize: 36, lineHeight: 0.85,
                  color: "#fff", transform: "skew(-7deg)", display: "inline-block",
                }}>{bigWord}</div>
                <div style={{ fontSize: 18, lineHeight: 1, marginTop: 4, color: "#0a0a0a", letterSpacing: "0.03em" }}>
                  {restWords || "FC"}
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div style={{ position: "relative", marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {[
                [String(recentFinished.filter((m) => formatResult(m, id).won).length), "W"],
                [String(recentFinished.filter((m) => !formatResult(m, id).won && !formatResult(m, id).lost).length), "D"],
                [String(recentFinished.filter((m) => formatResult(m, id).lost).length), "L"],
              ].map(([v, k], i) => (
                <div key={k} style={{
                  background: i % 2 ? "#fff" : accent, color: "#0a0a0a",
                  padding: "6px 4px", textAlign: "center",
                  clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                  transform: `rotate(${i % 2 ? 1 : -1}deg)`,
                }}>
                  <div style={{ fontSize: 18, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", opacity: 0.7 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form strip */}
      {form.length > 0 && (
        <div style={{ padding: "16px 18px 4px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 14, color: "var(--ink)", transform: "skew(-7deg)" }}>FORM ►</div>
          <div style={{ display: "flex", gap: 4 }}>
            {form.map((r, i) => {
              const bg = r === "W" ? accent : r === "D" ? (night ? "#555" : "#0a0a0a") : (night ? "#2a2a2a" : "#ccc");
              return (
                <div key={i} style={{
                  width: 24, height: 24, display: "grid", placeItems: "center",
                  fontSize: 11,
                  background: bg,
                  color: r === "W" ? "#0a0a0a" : "#fff",
                  clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
                  transform: `rotate(${i % 2 ? -2 : 2}deg)`,
                }}>{r}</div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fixtures */}
      <div style={{ padding: "10px 14px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 14, transform: "skew(-7deg)", color: "var(--ink)" }}>FIXTURES ►</div>
          <div style={{ flex: 1, height: 2, background: "var(--ink)" }} />
        </div>

        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{
              height: 56, marginBottom: 6, background: "#0a0a0a",
              clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
              opacity: 0.15,
            }} />
          ))
        ) : (
          displayMatches.map((m) => {
            const isLive = m.status === "in";
            const isFinal = m.status === "post";
            const isHome = m.homeTeam.id === id;
            const opp = isHome ? m.awayTeam : m.homeTeam;
            const result = formatResult(m, id);
            const tagBg = result.won ? accent : result.lost ? "#333" : isLive ? accent : "#0a0a0a";
            const tagFg = result.won ? "#0a0a0a" : "#fff";

            return (
              <div
                key={m.id}
                onClick={() => router.push(`/match/${m.id}`)}
                style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 6,
                  background: "#0a0a0a", color: "#fff",
                  clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  padding: "3px 8px", background: tagBg, color: tagFg,
                  fontSize: 9, letterSpacing: "0.10em",
                  clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)",
                }}>
                  {isLive ? "LIVE" : result.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <KineticBadge abbr={opp.abbr} accent={`#${opp.color}`} size={22} rotate={-6} night={night} />
                  <span style={{ fontSize: 12 }}>
                    {isHome ? "VS " : "@ "}{opp.name.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 15, color: accent, transform: "skew(-6deg)" }}>
                  {(isFinal || isLive)
                    ? `${m.homeTeam.score ?? "0"}–${m.awayTeam.score ?? "0"}`
                    : format(parseISO(m.date), "MMM d").toUpperCase()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: accent, color: "#0a0a0a",
          padding: "10px 20px", fontSize: 12, letterSpacing: "0.10em",
          clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
          zIndex: 2000,
        }}>
          {team?.shortName?.toUpperCase() ?? "TEAM"} SET AS FAVORITE
        </div>
      )}
    </KineticBg>
  );
}
