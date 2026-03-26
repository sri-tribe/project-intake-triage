"use client";

import type { IntakeAiPayload } from "@/lib/intake-ai-payload";
import { IntakeAiInsight } from "@/components/intake-ai-insight";
import { IntakeDetailsPanel } from "@/components/intake-details-panel";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { Alert, Box, Chip, Paper, Stack, Typography } from "@mui/material";

type Crumb = { label: string; href?: string };

type Props = {
  id: string;
  title: string;
  createdAtIso: string;
  industry: string;
  description: string;
  budgetRange: string;
  timeline: string;
  aiPayload: IntakeAiPayload | null;
  aiGeneratedAtIso: string | null;
  modelLabel: string | null;
  showPartialBanner: boolean;
  /** Override default Home → Intakes → title breadcrumb */
  breadcrumbItems?: Crumb[];
  /** When true, intake fields are view-only (e.g. admin viewing another user's intake). */
  detailsReadOnly?: boolean;
  submitter?: { name: string; email: string };
};

export function IntakeDetailView({
  id,
  title,
  createdAtIso,
  industry,
  description,
  budgetRange,
  timeline,
  aiPayload,
  aiGeneratedAtIso,
  modelLabel,
  showPartialBanner,
  breadcrumbItems,
  detailsReadOnly,
  submitter,
}: Props) {
  const createdAt = new Date(createdAtIso);
  const aiGeneratedAt = aiGeneratedAtIso ? new Date(aiGeneratedAtIso) : null;
  const crumbs =
    breadcrumbItems ?? [
      { label: "Home", href: "/" },
      { label: "Intakes", href: "/intakes" },
      { label: title },
    ];

  return (
    <Stack spacing={3}>
      <PageBreadcrumb items={crumbs} />

      {submitter ? (
        <Alert severity="info" variant="outlined">
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Submitted by
          </Typography>
          <Typography variant="body2">
            {submitter.name} ({submitter.email})
          </Typography>
        </Alert>
      ) : null}

      {showPartialBanner ? (
        <Alert severity="warning">
          Intake was saved earlier without full AI enrichment. Check your API key or wait and refresh.
        </Alert>
      ) : null}

      <Typography variant="h4" component="h1" fontWeight={700}>
        {title}
      </Typography>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="flex-start">
        <Box sx={{ flex: { lg: "0 0 280px" } }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Created
          </Typography>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="body2">
              {createdAt.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Typography>
            {aiPayload ? <Chip label="Auto" size="small" variant="outlined" /> : null}
          </Stack>
          {industry ? (
            <Box mt={1.5}>
              <Chip label={industry} size="small" color="secondary" variant="outlined" />
            </Box>
          ) : null}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
          {aiPayload && aiGeneratedAt ? (
            <IntakeAiInsight
              payload={aiPayload}
              generatedAt={aiGeneratedAt}
              modelLabel={modelLabel ?? undefined}
            />
          ) : (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No AI insight for this intake yet. It may still be generating—refresh in a moment—or your API
                key may not be configured.
              </Typography>
            </Paper>
          )}
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <IntakeDetailsPanel
          id={id}
          initialTitle={title}
          initialDescription={description}
          initialBudgetRange={budgetRange}
          initialTimeline={timeline}
          initialIndustry={industry}
          readOnly={detailsReadOnly}
        />
      </Paper>
    </Stack>
  );
}
