"use client";

import { useEffect, useState, useCallback } from "react";
import { Match } from "@/lib/espn";
import AppBar from "@/components/AppBar";
import MatchList from "@/components/MatchList";
import { Box, Button, CircularProgress, Skeleton, Typography } from "@mui/material";

export default function ScoresPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setError(null);
    fetch("/api/scoreboard")
      .then((r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load scoreboard", err);
        setError(err instanceof Error ? err.message : "Failed to load scores");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  // Poll every 20s while any match is live.
  useEffect(() => {
    const hasLive = matches.some((m) => m.status === "in");
    if (!hasLive) return;
    const id = setInterval(() => load(), 20000);
    return () => clearInterval(id);
  }, [matches, load]);

  return (
    <>
      <AppBar title="Scores" subtitle="NWSL" />

      {loading ? (
        <Box sx={{ px: 2, py: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 1.5, borderRadius: 2 }} />
          ))}
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
          <Typography variant="body1" gutterBottom>
            Could not load scores.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => load(true)}>
            Retry
          </Button>
        </Box>
      ) : matches.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
          <Typography variant="body1" gutterBottom>
            No matches scheduled right now.
          </Typography>
          <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => load(true)}>
            Refresh
          </Button>
        </Box>
      ) : (
        <MatchList matches={matches} emptyMessage="No matches scheduled right now." />
      )}
    </>
  );
}
