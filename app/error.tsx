"use client";

import { MuiNextLink } from "@/components/mui-next-link";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useEffect } from "react";

/**
 * User-visible error boundary for route segments (loading failures, render errors, etc.).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  const message =
    error.message?.trim() ||
    "Something unexpected happened. Try again, or return home if the problem continues.";

  return (
    <Stack spacing={2} sx={{ py: 2, maxWidth: 520 }} role="alert">
      <Alert severity="error" variant="outlined">
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body2" component="p" sx={{ mb: 0 }}>
          {message}
        </Typography>
        {error.digest ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            Error reference: {error.digest}
          </Typography>
        ) : null}
      </Alert>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Button variant="contained" onClick={() => reset()}>
          Try again
        </Button>
        <Button variant="outlined" component={MuiNextLink} href="/">
          Home
        </Button>
      </Stack>
    </Stack>
  );
}
