"use client";

import { NewIntakeForm } from "@/components/new-intake-form";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { Box, Paper, Stack, Typography } from "@mui/material";

export function NewIntakePage() {
  return (
    <Stack spacing={3}>
      <PageBreadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Intakes", href: "/intakes" }, { label: "New" }]}
      />
      <Box>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          New intake
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new project intake for triage.
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <NewIntakeForm />
      </Paper>
    </Stack>
  );
}
