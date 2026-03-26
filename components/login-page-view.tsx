"use client";

import { LoginForm } from "@/components/login-form";
import { Box, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";

export function LoginPageView() {
  return (
    <Stack spacing={3} maxWidth={440} sx={{ mx: "auto" }}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Log in
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to view and create intakes.
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <LoginForm />
      </Paper>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        No account?{" "}
        <Link href="/register" style={{ color: "inherit", fontWeight: 600 }}>
          Create one
        </Link>
      </Typography>
    </Stack>
  );
}
