"use client";

import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import GroupsIcon from "@mui/icons-material/Groups";
import { usePathname, useRouter } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const value = pathname.startsWith("/scores")
    ? 1
    : pathname.startsWith("/standings")
    ? 2
    : pathname.startsWith("/teams")
    ? 3
    : 0;

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1200 }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={(_, v) => {
          if (v === 0) router.push("/");
          if (v === 1) router.push("/scores");
          if (v === 2) router.push("/standings");
          if (v === 3) router.push("/teams");
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Scores" icon={<SportsSoccerIcon />} />
        <BottomNavigationAction label="Standings" icon={<LeaderboardIcon />} />
        <BottomNavigationAction label="Teams" icon={<GroupsIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
