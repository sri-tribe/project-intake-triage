"use client";

import type { IntakeAiPayload } from "@/lib/intake-ai-payload";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

type Props = {
  payload: IntakeAiPayload;
  generatedAt: Date;
  modelLabel?: string;
};

export function IntakeAiInsight({ payload, generatedAt, modelLabel }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
          <Typography variant="overline" color="text.secondary" letterSpacing={1}>
            Summary &amp; risks
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Insight generated{" "}
            {generatedAt.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            {modelLabel ? ` · ${modelLabel}` : ""}
          </Typography>
        </Stack>
        <Typography variant="body2">{payload.summary}</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {payload.tags.map((tag, i) => (
            <Chip key={`${i}-${tag}`} label={tag} size="small" color="primary" variant="outlined" />
          ))}
        </Stack>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
            Risk checklist
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {payload.riskChecklist.map((item, i) => (
              <Typography key={`${i}-${item}`} component="li" variant="body2" sx={{ mb: 0.5 }}>
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
