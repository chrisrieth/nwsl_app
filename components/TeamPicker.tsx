"use client";

import { Team } from "@/lib/espn";
import { setFavoriteTeam } from "@/lib/favorites";
import {
  Box,
  Card,
  CardActionArea,
  Typography,
  Grid,
} from "@mui/material";

interface Props {
  teams: Team[];
  onSelect: (teamId: string) => void;
}

export default function TeamPicker({ teams, onSelect }: Props) {
  function handleSelect(teamId: string) {
    setFavoriteTeam(teamId);
    onSelect(teamId);
  }

  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Choose your team
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your home screen will show their schedule and scores.
      </Typography>
      <Grid container spacing={1.5}>
        {teams.map((team) => (
          <Grid size={{ xs: 6, sm: 4 }} key={team.id}>
            <Card>
              <CardActionArea
                onClick={() => handleSelect(team.id)}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  minHeight: 100,
                }}
              >
                {team.logo ? (
                  <Box
                    component="img"
                    src={team.logo}
                    alt={team.name}
                    sx={{ width: 48, height: 48, objectFit: "contain" }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: `#${team.color}`,
                    }}
                  />
                )}
                <Typography variant="caption" align="center" sx={{ fontWeight: 600 }}>
                  {team.shortName}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
