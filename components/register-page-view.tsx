"use client";

import { RegisterForm } from "@/components/register-form";
import { Box, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";

export function RegisterPageView() {
  return (
    <Stack spacing={3} maxWidth={440} sx={{ mx: "auto" }}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Create account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your name, email, and a password (at least 8 characters).
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <RegisterForm />
      </Paper>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already have an account?{" "}
        <Link href="/login" style={{ color: "inherit", fontWeight: 600 }}>
          Log in
        </Link>
      </Typography>
    </Stack>
  );
}
