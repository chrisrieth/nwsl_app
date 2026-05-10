"use client";

import { useEffect, useState } from "react";
import { StandingRow } from "@/lib/espn";
import AppBar from "@/components/AppBar";
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function StandingsPage() {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/standings")
      .then((r) => r.json())
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load standings", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <AppBar title="Standings" />

      {loading ? (
        <Box sx={{ px: 2, py: 2 }}>
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No standings data available.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mx: 0, mt: 1, borderRadius: 0 }} elevation={0}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, pl: 2 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>GP</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>W</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>D</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>L</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>GD</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "primary.main" }}>PTS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow
                  key={row.team.id}
                  sx={{ "&:last-child td": { border: 0 } }}
                >
                  <TableCell sx={{ color: "text.secondary", pl: 2 }}>{idx + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {row.team.logo && (
                        <Box
                          component="img"
                          src={row.team.logo}
                          alt={row.team.abbr}
                          sx={{ width: 22, height: 22, objectFit: "contain" }}
                        />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {row.team.abbr}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{row.gp}</TableCell>
                  <TableCell align="center">{row.w}</TableCell>
                  <TableCell align="center">{row.d}</TableCell>
                  <TableCell align="center">{row.l}</TableCell>
                  <TableCell align="center">{row.gd > 0 ? `+${row.gd}` : row.gd}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{row.pts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
