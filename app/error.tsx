"use client";

import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
      <Typography variant="h6" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Could not load match data. Check your connection and try again.
      </Typography>
      <Button variant="contained" onClick={reset}>
        Try again
      </Button>
    </Box>
  );
}
