"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getFavoriteAbbr, getFavoriteColor } from "@/lib/favorites";
import { getTeamAccent } from "@/lib/teamColors";
import { useNight } from "@/lib/useNight";
import KineticBg from "@/components/KineticBg";
import KineticBadge from "@/components/KineticBadge";
import KineticBanner from "@/components/KineticBanner";
import KineticBurst from "@/components/KineticBurst";

interface MatchTeam {
  id: string;
  name: string;
  abbr: string;
  color: string;
  logo: string;
  score?: string;
}

interface MatchEvent {
  clock: string;
  text: string;
  typeId: string;
  teamId: string;
  teamAbbr: string;
  isGoal: boolean;
  participant: string;
}

interface MatchDetail {
  id: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  venue?: string;
  city?: string;
  status: "pre" | "in" | "post";
  statusText: string;
  clock?: string;
  period?: number;
  completed: boolean;
  events: MatchEvent[];
}

function EventIcon({ event, accent, night }: { event: MatchEvent; accent: string; night: boolean }) {
  if (event.isGoal) {
    return (
      <div style={{
        width: 22, height: 22, background: accent, color: "#0a0a0a",
        display: "grid", placeItems: "center",
        fontSize: 11, fontWeight: 900,
        boxShadow: night ? `0 0 12px ${accent}88` : "none",
      }}>⚽</div>
    );
  }
  const typeId = event.typeId.toLowerCase();
  const text = event.text.toLowerCase();
  if (typeId.includes("yellow") || text.includes("yellow")) {
    return <div style={{ width: 14, height: 18, background: "#FFD60A" }} />;
  }
  if (typeId.includes("red") || text.includes("red card")) {
    return <div style={{ width: 14, height: 18, background: "#FF3B30" }} />;
  }
  if (typeId.includes("sub") || text.includes("substitut")) {
    return (
      <div style={{
        width: 22, height: 22,
        border: `1.5px solid ${accent}`,
        display: "grid", placeItems: "center",
        fontSize: 10, color: accent,
      }}>↑↓</div>
    );
  }
  return null;
}

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const night = useNight();
  const router = useRouter();

  const abbr = getFavoriteAbbr();
  const color = getFavoriteColor();
  const defaultAccent = abbr && color ? getTeamAccent(abbr, color, night) : night ? "#FF2D55" : "#B0102B";

  const homeAccent = match ? getTeamAccent(match.homeTeam.abbr, match.homeTeam.color, night) : defaultAccent;
  const accent = match ? homeAccent : defaultAccent;

  const load = useCallback(() => {
    fetch(`/api/match/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setMatch(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Poll every 20s when live
  useEffect(() => {
    if (!match || match.status !== "in") return;
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [match, load]);

  const isLive = match?.status === "in";
  const isFinal = match?.status === "post";
  const period = match?.period === 1 ? "1ST HALF" : match?.period === 2 ? "2ND HALF" : match?.period === 3 ? "ET" : "";

  if (loading) {
    return (
      <KineticBg accent={defaultAccent} night={night}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60dvh" }}>
          <div style={{
            width: 36, height: 36, border: "3px solid #333",
            borderTop: `3px solid ${defaultAccent}`, borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </KineticBg>
    );
  }

  if (error || !match) {
    return (
      <KineticBg accent={defaultAccent} night={night}>
        <div style={{ padding: "20px 18px" }}>
          <button onClick={() => router.back()} style={{ color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: "0.08em", fontFamily: "inherit" }}>◄ BACK</button>
          <div style={{ textAlign: "center", padding: "40px 0", opacity: 0.5 }}>
            <div style={{ fontSize: 13 }}>MATCH NOT FOUND</div>
            <div style={{ fontSize: 10, marginTop: 8, opacity: 0.6 }}>{error}</div>
          </div>
        </div>
      </KineticBg>
    );
  }

  return (
    <KineticBg accent={accent} night={night}>
      {/* Back nav */}
      <div style={{ padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => router.back()}
          style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >◄ BACK</button>
        <div style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.10em" }}>
          {(match.venue ?? match.city ?? "").toUpperCase()}
        </div>
      </div>

      {/* Status banner */}
      <div style={{ padding: "0 14px 0" }}>
        <KineticBanner accent={accent}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, letterSpacing: "0.10em" }}>
            {isLive ? (
              <>
                <span>● LIVE · {period}</span>
                <span style={{ fontSize: 22, transform: "skew(-8deg)", display: "inline-block" }}>
                  {match.clock ?? ""}
                </span>
              </>
            ) : isFinal ? (
              <span style={{ fontSize: 14, letterSpacing: "0.12em" }}>FULL TIME</span>
            ) : (
              <span>{match.statusText || "UPCOMING"}</span>
            )}
          </div>
        </KineticBanner>
      </div>

      {/* Score arena */}
      <div style={{ padding: "10px 14px 0", position: "relative" }}>
        <div style={{
          background: "#0a0a0a", color: "#fff", padding: "20px 14px 18px",
          clipPath: "polygon(0 14px, 100% 0, 100% calc(100% - 14px), 0 100%)",
          position: "relative", overflow: "hidden",
          boxShadow: night && isLive ? `0 0 32px ${accent}55` : "none",
        }}>
          {/* Burst */}
          {isLive && (
            <div style={{ position: "absolute", top: -10, left: "44%", pointerEvents: "none" }}>
              <KineticBurst size={66} color={accent} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: isLive ? 18 : 8 }}>
            {/* Home */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <KineticBadge abbr={match.homeTeam.abbr} accent={`#${match.homeTeam.color}`} size={56} rotate={-8} night={night} />
              <div style={{ fontSize: 13, textAlign: "center" }}>{match.homeTeam.name.toUpperCase()}</div>
              <div style={{
                fontSize: 96, lineHeight: 0.82,
                color: isLive ? accent : "#fff",
                transform: "skew(-6deg)",
              }}>{match.homeTeam.score ?? (isFinal ? "0" : "—")}</div>
            </div>
            {/* Away */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <KineticBadge abbr={match.awayTeam.abbr} accent={`#${match.awayTeam.color}`} size={56} rotate={8} night={night} />
              <div style={{ fontSize: 13, textAlign: "center" }}>{match.awayTeam.name.toUpperCase()}</div>
              <div style={{
                fontSize: 96, lineHeight: 0.82,
                color: "#fff", opacity: 0.6,
                transform: "skew(-6deg)",
              }}>{match.awayTeam.score ?? (isFinal ? "0" : "—")}</div>
            </div>
          </div>

          <div style={{
            marginTop: 14, paddingTop: 10,
            borderTop: `2px dashed ${accent}66`,
            display: "flex", justifyContent: "space-between",
            fontSize: 9, letterSpacing: "0.12em", opacity: 0.7,
          }}>
            <span>{(match.venue ?? match.city ?? "").toUpperCase()}</span>
            <span>{match.statusText.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Event log */}
      <div style={{ padding: "16px 18px 6px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderLeft: `12px solid ${accent}` }} />
        <div style={{ fontSize: 16, color: "var(--ink)", transform: "skew(-7deg)" }}>EVENT LOG</div>
        <div style={{ flex: 1, height: 3, background: "var(--ink)" }} />
        {isLive && (
          <div style={{
            background: "var(--ink)", color: accent,
            padding: "3px 10px", fontSize: 9, letterSpacing: "0.10em",
            clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
          }}>LIVE FEED</div>
        )}
      </div>

      <div style={{ padding: "4px 14px 20px" }}>
        {match.events.length === 0 ? (
          <div style={{
            padding: "16px 14px", marginBottom: 6,
            background: "#0a0a0a", color: "#fff",
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
            fontSize: 11, opacity: 0.5, letterSpacing: "0.10em",
            textAlign: "center",
          }}>
            {isLive ? "LIVE EVENTS LOADING…" : isFinal ? "NO EVENT DATA AVAILABLE" : "MATCH HAS NOT STARTED"}
          </div>
        ) : (
          match.events.map((e, i) => {
            const isHome = e.teamId === match.homeTeam.id || e.teamAbbr === match.homeTeam.abbr;
            const evAccent = isHome ? `#${match.homeTeam.color}` : `#${match.awayTeam.color}`;
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: isHome ? "auto 40px 1fr" : "1fr 40px auto",
                  alignItems: "center", gap: 10,
                  padding: "8px 12px", marginBottom: 5,
                  background: "#0a0a0a", color: "#fff",
                  clipPath: isHome
                    ? "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)"
                    : "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                  border: e.isGoal ? `1px solid ${evAccent}` : "none",
                  boxShadow: e.isGoal && night ? `0 0 16px ${evAccent}55` : "none",
                }}
              >
                {isHome ? (
                  <>
                    <EventIcon event={e} accent={evAccent} night={night} />
                    <div style={{
                      textAlign: "center", padding: "3px 4px",
                      background: e.isGoal ? evAccent : "transparent",
                      color: e.isGoal ? "#0a0a0a" : "#fff",
                      fontSize: 11,
                      clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
                      border: e.isGoal ? "none" : "1px solid #fff",
                    }}>{e.clock}</div>
                    <div>
                      <div style={{ fontSize: 12, color: e.isGoal ? evAccent : "#fff" }}>
                        {e.participant.toUpperCase() || e.text.toUpperCase()}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: e.isGoal ? evAccent : "#fff" }}>
                        {e.participant.toUpperCase() || e.text.toUpperCase()}
                      </div>
                    </div>
                    <div style={{
                      textAlign: "center", padding: "3px 4px",
                      background: e.isGoal ? evAccent : "transparent",
                      color: e.isGoal ? "#0a0a0a" : "#fff",
                      fontSize: 11,
                      clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
                      border: e.isGoal ? "none" : "1px solid #fff",
                    }}>{e.clock}</div>
                    <EventIcon event={e} accent={evAccent} night={night} />
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </KineticBg>
  );
}
