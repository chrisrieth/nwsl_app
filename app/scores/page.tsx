"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Match } from "@/lib/espn";
import { getFavoriteAbbr, getFavoriteColor } from "@/lib/favorites";
import { getTeamAccent } from "@/lib/teamColors";
import { useNight } from "@/lib/useNight";
import KineticBg from "@/components/KineticBg";
import KineticBadge from "@/components/KineticBadge";
import KineticBanner from "@/components/KineticBanner";
import { format, parseISO } from "date-fns";

function groupByDay(matches: Match[]): { label: string; matches: Match[] }[] {
  const map = new Map<string, Match[]>();
  for (const m of matches) {
    const key = format(parseISO(m.date), "yyyy-MM-dd");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return [...map.entries()].map(([key, ms]) => ({
    label: format(parseISO(key), "EEE · MMM d").toUpperCase(),
    matches: ms,
  }));
}

function formatTime(dateStr: string) {
  return format(parseISO(dateStr), "h:mm a").replace(":00", "");
}

export default function ScoresPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const night = useNight();
  const router = useRouter();

  const abbr = getFavoriteAbbr();
  const color = getFavoriteColor();
  const accent = abbr && color ? getTeamAccent(abbr, color, night) : night ? "#FF2D55" : "#B0102B";

  const load = useCallback((showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setError(null);
    fetch("/api/scoreboard")
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed");
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(true); }, [load]);

  useEffect(() => {
    const hasLive = matches.some((m) => m.status === "in");
    if (!hasLive) return;
    const id = setInterval(() => load(), 20000);
    return () => clearInterval(id);
  }, [matches, load]);

  const groups = groupByDay(matches);
  const today = format(new Date(), "yyyy-MM-dd");
  const todayGroup = groups.find((g) => g.matches[0] && format(parseISO(g.matches[0].date), "yyyy-MM-dd") === today);

  return (
    <KineticBg accent={accent} night={night}>
      {/* Header */}
      <div style={{ padding: "14px 18px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 28, transform: "skew(-8deg)", color: "var(--ink)" }}>SCORES</div>
        <div style={{
          background: accent, color: "#0a0a0a",
          padding: "4px 14px", fontSize: 10, letterSpacing: "0.10em",
          clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
        }}>NWSL</div>
      </div>

      {/* Today banner if there are today's matches */}
      {todayGroup && (
        <div style={{ padding: "8px 14px 4px" }}>
          <KineticBanner accent={accent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, letterSpacing: "0.10em" }}>
              <span>TODAY · {format(new Date(), "MMM d").toUpperCase()}</span>
              <span style={{ fontSize: 11, opacity: 0.85 }}>{todayGroup.matches.length} MATCHES</span>
            </div>
          </KineticBanner>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              height: 80, background: "#0a0a0a",
              clipPath: "polygon(0 14px, 100% 0, 100% calc(100% - 14px), 0 100%)",
              opacity: 0.15 + i * 0.04,
            }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: "40px 18px", textAlign: "center" }}>
          <div style={{ opacity: 0.6, fontSize: 13, marginBottom: 16 }}>COULD NOT LOAD SCORES</div>
          <button
            onClick={() => load(true)}
            style={{
              padding: "8px 20px", background: accent, color: "#0a0a0a",
              border: "none", cursor: "pointer",
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
              fontSize: 12, letterSpacing: "0.10em",
              clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
            }}
          >RETRY</button>
        </div>
      ) : matches.length === 0 ? (
        <div style={{ padding: "40px 18px", textAlign: "center", opacity: 0.6 }}>NO MATCHES SCHEDULED</div>
      ) : (
        <div style={{ padding: "8px 14px 16px" }}>
          {groups.map((group) => (
            <div key={group.label}>
              <div style={{
                padding: "8px 0 4px",
                fontSize: 10, letterSpacing: "0.14em",
                color: "var(--ink-muted)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                {group.label}
                <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>

              {group.matches.map((m) => {
                const isLive = m.status === "in";
                const isFinal = m.status === "post";
                const homeColor = `#${m.homeTeam.color}`;
                return (
                  <div
                    key={m.id}
                    onClick={() => router.push(`/match/${m.id}`)}
                    style={{
                      marginBottom: 10, padding: "16px 14px",
                      background: "#0a0a0a", color: "#fff",
                      clipPath: "polygon(0 14px, 100% 0, 100% calc(100% - 14px), 0 100%)",
                      position: "relative", cursor: "pointer",
                      boxShadow: isLive && night ? `0 0 24px ${accent}55` : "none",
                    }}
                  >
                    {isLive && (
                      <div style={{
                        position: "absolute", top: -2, right: 18, zIndex: 2,
                        padding: "3px 10px",
                        background: accent, color: "#0a0a0a",
                        fontSize: 10, letterSpacing: "0.10em",
                        clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
                        transform: "rotate(-4deg)",
                      }}>
                        ● LIVE{m.clock ? ` · ${m.clock}` : ""}
                      </div>
                    )}

                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr auto 1fr",
                      alignItems: "center", gap: 8,
                      marginTop: isLive ? 8 : 0,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <KineticBadge abbr={m.homeTeam.abbr} accent={homeColor} size={32} rotate={-7} night={night} />
                        <span style={{ fontSize: 13 }}>{m.homeTeam.name.toUpperCase()}</span>
                      </div>

                      {isLive || isFinal ? (
                        <div style={{
                          fontSize: 28, color: accent, transform: "skew(-6deg)", lineHeight: 1,
                        }}>
                          {m.homeTeam.score ?? "0"}–{m.awayTeam.score ?? "0"}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, opacity: 0.6, textAlign: "center" }}>
                          {formatTime(m.date)}
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                        <span style={{ fontSize: 13, textAlign: "right" }}>{m.awayTeam.name.toUpperCase()}</span>
                        <KineticBadge abbr={m.awayTeam.abbr} accent={`#${m.awayTeam.color}`} size={32} rotate={7} night={night} />
                      </div>
                    </div>

                    <div style={{
                      marginTop: 10, paddingTop: 8,
                      borderTop: `1px dashed ${accent}55`,
                      fontSize: 9, letterSpacing: "0.12em", opacity: 0.6,
                    }}>
                      {isFinal ? "FULL TIME · " : ""}{m.venue?.toUpperCase() ?? m.city?.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </KineticBg>
  );
}
