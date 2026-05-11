"use client";

import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onSettingsClick?: () => void;
  teamColor?: string;
}

export default function AppBar({ title, subtitle, showBack, onSettingsClick, teamColor }: Props) {
  const router = useRouter();
  const accent = teamColor ? `#${teamColor}` : "#FF2D55";

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        bgcolor: "#0a0a0a",
        borderBottom: `3px solid ${accent}`,
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      {showBack && (
        <IconButton
          onClick={() => router.back()}
          size="small"
          sx={{ color: accent, mr: 0.5, p: 0.5 }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
            fontSize: "1.5rem",
            lineHeight: 1,
            color: "#fff",
            transform: "skewX(-8deg)",
            display: "inline-block",
            letterSpacing: "-0.02em",
          }}
        >
          {title.toUpperCase()}
        </Box>
        {/* Accent triangle beside title */}
        <Box
          component="span"
          sx={{
            display: "inline-block",
            ml: 1,
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderLeft: `10px solid ${accent}`,
            verticalAlign: "middle",
          }}
        />
        {subtitle && (
          <Box
            sx={{
              fontFamily: "var(--font-archivo-black), 'Archivo Black', system-ui, sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.10em",
              color: accent,
              mt: 0.25,
            }}
          >
            {subtitle.toUpperCase()}
          </Box>
        )}
      </Box>

      {onSettingsClick && (
        <IconButton onClick={onSettingsClick} size="small" sx={{ color: "#555" }}>
          <SettingsIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
