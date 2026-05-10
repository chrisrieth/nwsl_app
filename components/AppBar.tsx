"use client";

import { AppBar as MuiAppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

  return (
    <MuiAppBar
      position="sticky"
      sx={{ bgcolor: teamColor ? `#${teamColor}` : "primary.main" }}
      elevation={0}
    >
      <Toolbar>
        {showBack && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.back()}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {onSettingsClick && (
          <IconButton color="inherit" onClick={onSettingsClick}>
            <SettingsIcon />
          </IconButton>
        )}
      </Toolbar>
    </MuiAppBar>
  );
}
