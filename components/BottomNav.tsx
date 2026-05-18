"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFavoriteAbbr, getFavoriteColor } from "@/lib/favorites";
import { getTeamAccent } from "@/lib/teamColors";
import { useNight } from "@/lib/useNight";

const TABS = [
  { label: "HOME", icon: "◆", path: "/" },
  { label: "TEAMS", icon: "▲", path: "/teams" },
  { label: "SCORES", icon: "●", path: "/scores" },
  { label: "TABLE", icon: "■", path: "/standings" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const night = useNight();
  const [accent, setAccent] = useState("#FF2D55");

  useEffect(() => {
    const abbr = getFavoriteAbbr();
    const color = getFavoriteColor();
    if (abbr && color) {
      setAccent(getTeamAccent(abbr, color, night));
    } else {
      setAccent(night ? "#FF2D55" : "#B0102B");
    }
  }, [night]);

  function active(path: string) {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  }

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "#0a0a0a",
        borderTop: `3px solid ${accent}`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        paddingBottom: 8,
        zIndex: 1200,
      }}
    >
      {TABS.map((tab) => {
        const isActive = active(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              color: isActive ? accent : "#555",
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
              fontSize: 10,
              letterSpacing: "0.10em",
              transform: isActive ? "skew(-6deg)" : "none",
              transition: "color 0.15s",
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-current={isActive ? "page" : undefined}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
