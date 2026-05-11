"use client";

import { Box } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { label: "HOME", icon: "◆", path: "/" },
  { label: "TABLE", icon: "■", path: "/standings" },
  { label: "TEAMS", icon: "▲", path: "/teams" },
];

const ACCENT = "#FF2D55";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeIdx = pathname.startsWith("/standings")
    ? 1
    : pathname.startsWith("/teams")
    ? 2
    : 0;

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 1200,
        bgcolor: "#0a0a0a",
        borderTop: `3px solid ${ACCENT}`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        pb: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((tab, i) => {
        const active = activeIdx === i;
        return (
          <Box
            key={tab.label}
            onClick={() => router.push(tab.path)}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              cursor: "pointer",
              color: active ? ACCENT : "#555",
              fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.10em",
              transform: active ? "skewX(-6deg)" : "none",
              transition: "color 0.15s, transform 0.15s",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Box sx={{ fontSize: "0.85rem", lineHeight: 1 }}>{tab.icon}</Box>
            <Box>{tab.label}</Box>
          </Box>
        );
      })}
    </Box>
  );
}
