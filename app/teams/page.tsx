"use client";

import { useEffect, useState } from "react";
import { Team } from "@/lib/espn";
import AppBar from "@/components/AppBar";
import { Box, Card, CardActionArea, Grid, Skeleton, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data: Team[]) => {
        setTeams(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <AppBar title="Teams" />
      <Box sx={{ px: 2, py: 2 }}>
        {loading ? (
          <Grid container spacing={1.5}>
            {[...Array(12)].map((_, i) => (
              <Grid size={{ xs: 6, sm: 4 }} key={i}>
                <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={1.5}>
            {teams.map((team) => (
              <Grid size={{ xs: 6, sm: 4 }} key={team.id}>
                <Card>
                  <CardActionArea
                    onClick={() => router.push(`/teams/${team.id}`)}
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                      minHeight: 110,
                    }}
                  >
                    {team.logo ? (
                      <Box
                        component="img"
                        src={team.logo}
                        alt={team.name}
                        sx={{ width: 52, height: 52, objectFit: "contain" }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
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
        )}
      </Box>
    </>
  );
}
