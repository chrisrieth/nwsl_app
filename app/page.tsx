"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Match, Team } from "@/lib/espn";
import { getFavoriteTeam, setFavoriteTeam, setFavoriteMeta, getFavoriteAbbr, getFavoriteColor } from "@/lib/favorites";
import { getTeamAccent } from "@/lib/teamColors";
import { useNight } from "@/lib/useNight";
import KineticBg from "@/components/KineticBg";
import KineticBadge from "@/components/KineticBadge";
import KineticBanner from "@/components/KineticBanner";
import KineticBurst from "@/components/KineticBurst";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

type Phase = "loading" | "pick" | "home";

function formatKineticTime(dateStr: string) {
  return format(parseISO(dateStr), "h:mm a").replace(":00", "");
}

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scoreboard, setScoreboard] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const night = useNight();
  const router = useRouter();

  const favTeam = teams.find((t) => t.id === favoriteId);
  const accent = favTeam
    ? getTeamAccent(favTeam.abbr, favTeam.color, night)
    : (() => {
        const a = getFavoriteAbbr(), c = getFavoriteColor();
        return a && c ? getTeamAccent(a, c, night) : night ? "#FF2D55" : "#B0102B";
      })();

  useEffect(() => {
    const fav = getFavoriteTeam();
    if (fav) {
      setFavoriteId(fav);
      setPhase("home");
    } else {
      setPhase("pick");
    }
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => setTeams(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const loadSchedule = useCallback((teamId: string) => {
    setMatchesLoading(true);
    fetch(`/api/schedule/${teamId}`)
      .then((r) => r.json())
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
        setMatchesLoading(false);
      })
      .catch(() => setMatchesLoading(false));
  }, []);

  useEffect(() => {
    if (phase === "home" && favoriteId) {
      loadSchedule(favoriteId);
      fetch("/api/scoreboard")
        .then((r) => r.json())
        .then((data) => setScoreboard(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [phase, favoriteId, loadSchedule]);

  // Poll every 20s while any favorite-team match is live.
  useEffect(() => {
    const hasLive = matches.some((m) => m.status === "in");
    if (!hasLive || phase !== "home" || !favoriteId) return;
    const id = setInterval(() => {
      fetch(`/api/schedule/${favoriteId}`).then((r) => r.json()).then(setMatches).catch(console.error);
    }, 20000);
    return () => clearInterval(id);
  }, [phase, favoriteId, matches]);

  function handleTeamSelect(team: Team) {
    setFavoriteTeam(team.id);
    setFavoriteMeta(team.abbr, team.color);
    setFavoriteId(team.id);
    setPickerOpen(false);
    setPhase("home");
  }

  // --- Team Picker overlay (used for both first-time and change-team) ---
  const teamPickerOverlay = (
    <div style={{
      position: "fixed", inset: 0, background: "#0a0a0a", zIndex: 2000,
      overflowY: "auto", padding: "20px 14px 80px",
      fontFamily: "var(--font-archivo), system-ui, sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 24, color: "#fff", transform: "skew(-7deg)" }}>PICK YOUR TEAM</div>
        {phase === "home" && (
          <button
            onClick={() => setPickerOpen(false)}
            style={{ color: "#888", background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 4 }}
          >✕</button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {teams.length === 0 ? (
          [...Array(8)].map((_, i) => (
            <div key={i} style={{
              height: 56, background: "#111",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
              opacity: 0.3 + i * 0.04,
            }} />
          ))
        ) : (
          teams.map((team) => {
            const a = getTeamAccent(team.abbr, team.color, true);
            return (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                style={{
                  display: "grid", gridTemplateColumns: "auto 1fr",
                  alignItems: "center", gap: 14,
                  padding: "12px 16px",
                  background: team.id === favoriteId ? a : "#111",
                  color: "#fff",
                  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
                  border: "none", cursor: "pointer", textAlign: "left",
                }}
              >
                <KineticBadge abbr={team.abbr} accent={a} size={36} rotate={-6} night />
                <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: 14, color: "#fff" }}>
                  {team.name.toUpperCase()}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // --- Loading ---
  if (phase === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100dvh", background: "var(--bg)" }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid #333",
          borderTop: "3px solid #FF2D55",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- First-time picker ---
  if (phase === "pick") {
    return (
      <>
        <div style={{ background: "var(--bg)", minHeight: "100dvh" }} />
        {teamPickerOverlay}
      </>
    );
  }

  // --- Home ---
  const liveMatch = matches.find((m) => m.status === "in") ?? scoreboard.find((m) => m.status === "in");
  const upcoming = matches.filter((m) => m.status === "pre").slice(0, 4);

  return (
    <>
      <KineticBg accent={accent} night={night}>
        {/* Wordmark header */}
        <div style={{ padding: "14px 18px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 28, transform: "skew(-8deg)", color: "var(--ink)" }}>NWSL</div>
            <div style={{ width: 14, height: 14, background: accent, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
          </div>
          {favTeam && (
            <div style={{
              background: accent, color: "#0a0a0a",
              padding: "4px 14px", fontSize: 10, letterSpacing: "0.10em",
              clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
            }}>{favTeam.abbr.toUpperCase()}</div>
          )}
        </div>

        {/* Live game card or next match banner */}
        {liveMatch ? (
          <>
            <div style={{ padding: "0 14px", marginBottom: -6, position: "relative", zIndex: 2 }}>
              <KineticBanner accent={accent}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, letterSpacing: "0.12em" }}>
                  <span>● LIVE NOW</span>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>
                    {liveMatch.clock ? `${liveMatch.clock} · ` : ""}
                    {liveMatch.period === 1 ? "1ST" : liveMatch.period === 2 ? "2ND" : ""} HALF
                  </span>
                </div>
              </KineticBanner>
            </div>

            <div
              style={{ padding: "0 14px", cursor: "pointer" }}
              onClick={() => router.push(`/match/${liveMatch.id}`)}
            >
              <div style={{
                background: "#0a0a0a", color: "#fff", padding: "26px 16px 16px",
                marginTop: -4, position: "relative",
                clipPath: "polygon(0 18px, 100% 0, 100% calc(100% - 18px), 0 100%)",
                boxShadow: night ? `0 0 32px ${accent}55` : "none",
              }}>
                <div style={{ position: "absolute", top: 4, right: -10, pointerEvents: "none" }}>
                  <KineticBurst size={70} color={accent} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <KineticBadge abbr={liveMatch.homeTeam.abbr} accent={`#${liveMatch.homeTeam.color}`} size={48} rotate={-8} night={night} />
                    <div style={{ fontSize: 14 }}>{liveMatch.homeTeam.name.toUpperCase()}</div>
                    <div style={{ fontSize: 72, lineHeight: 0.85, color: night ? accent : "#fff", transform: "skew(-6deg)" }}>
                      {liveMatch.homeTeam.score ?? "—"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", textAlign: "right" }}>
                    <KineticBadge abbr={liveMatch.awayTeam.abbr} accent={`#${liveMatch.awayTeam.color}`} size={48} rotate={8} night={night} />
                    <div style={{ fontSize: 14 }}>{liveMatch.awayTeam.name.toUpperCase()}</div>
                    <div style={{ fontSize: 72, lineHeight: 0.85, color: "#fff", opacity: 0.55, transform: "skew(-6deg)" }}>
                      {liveMatch.awayTeam.score ?? "—"}
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: 14, paddingTop: 12, borderTop: `2px solid ${accent}`,
                  display: "flex", justifyContent: "space-between",
                  fontSize: 10, letterSpacing: "0.10em",
                }}>
                  <span style={{ opacity: 0.7 }}>{liveMatch.venue?.toUpperCase()}</span>
                  <span style={{ color: accent }}>MATCH DETAIL ➤</span>
                </div>
              </div>
            </div>
          </>
        ) : upcoming[0] ? (
          <div style={{ padding: "0 14px" }}>
            <KineticBanner accent={accent} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.12em" }}>
                NEXT · {upcoming[0].homeTeam.abbr} VS {upcoming[0].awayTeam.abbr} · {format(parseISO(upcoming[0].date), "MMM d").toUpperCase()}
              </div>
            </KineticBanner>
          </div>
        ) : matchesLoading ? (
          <div style={{ padding: "0 14px 12px" }}>
            <div style={{ height: 80, background: "#0a0a0a", clipPath: "polygon(0 14px, 100% 0, 100% calc(100% - 14px), 0 100%)", opacity: 0.2 }} />
          </div>
        ) : null}

        {/* UPCOMING section header */}
        <div style={{ padding: "20px 18px 4px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderLeft: `12px solid ${accent}` }} />
          <div style={{ fontSize: 20, color: "var(--ink)", transform: "skew(-6deg)" }}>UPCOMING</div>
          <div style={{ flex: 1, height: 3, background: "var(--ink)", marginLeft: 6 }} />
        </div>

        {/* Upcoming fixture cards */}
        <div style={{ padding: "8px 14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {matchesLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} style={{
                height: 58, background: "#0a0a0a",
                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
                opacity: 0.15 + i * 0.05,
              }} />
            ))
          ) : upcoming.length === 0 ? (
            <div style={{ padding: "20px 0", opacity: 0.5, fontSize: 13 }}>NO UPCOMING FIXTURES</div>
          ) : (
            upcoming.map((g) => {
              const diff = differenceInCalendarDays(parseISO(g.date), new Date());
              const isToday = diff === 0;
              return (
                <div
                  key={g.id}
                  onClick={() => router.push(`/match/${g.id}`)}
                  style={{
                    display: "grid", gridTemplateColumns: "58px 1fr auto", alignItems: "center", gap: 10,
                    padding: "10px 16px",
                    background: "#0a0a0a", color: "#fff",
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
                    cursor: "pointer",
                    border: isToday ? `1px solid ${accent}44` : "none",
                  }}
                >
                  <div style={{ color: accent }}>
                    <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: "0.08em" }}>
                      {format(parseISO(g.date), "EEE").toUpperCase()}
                    </div>
                    <div style={{ fontSize: 22, lineHeight: 0.9 }}>{format(parseISO(g.date), "d")}</div>
                    <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: "0.08em" }}>
                      {format(parseISO(g.date), "MMM").toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <KineticBadge abbr={g.homeTeam.abbr} accent={`#${g.homeTeam.color}`} size={26} rotate={-6} night={night} />
                    <span style={{ fontSize: 11, opacity: 0.5 }}>VS</span>
                    <KineticBadge abbr={g.awayTeam.abbr} accent={`#${g.awayTeam.color}`} size={26} rotate={6} night={night} />
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{formatKineticTime(g.date)}</div>
                </div>
              );
            })
          )}
        </div>

        {/* Change team */}
        <div style={{ padding: "0 14px 20px" }}>
          <button
            onClick={() => setPickerOpen(true)}
            style={{
              display: "block", width: "100%",
              padding: "10px 16px",
              background: "transparent",
              color: "var(--ink-muted)",
              border: "1px solid var(--border)",
              clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
              fontSize: 11, letterSpacing: "0.12em",
              cursor: "pointer",
              textAlign: "center",
            }}
          >CHANGE FAVORITE TEAM ▼</button>
        </div>
      </KineticBg>

      {pickerOpen && teamPickerOverlay}
    </>
  );
}
