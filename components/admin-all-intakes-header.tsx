"use client";

import DownloadIcon from "@mui/icons-material/Download";
import { buildAdminIntakesCsv, type AdminIntakeCsvRow } from "@/lib/admin-intakes-csv";
import { Button, Stack, Typography } from "@mui/material";

function downloadCsvFile(content: string, filename: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type Props = { intakes: AdminIntakeCsvRow[] };

export function AdminAllIntakesHeader({ intakes }: Props) {
  function exportCsv() {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsvFile(buildAdminIntakesCsv(intakes), `intakes-export-${stamp}.csv`);
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "flex-start" }}
    >
      <div>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          All intakes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Every intake in the system, with the user who submitted it.
        </Typography>
      </div>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={exportCsv}
        sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, flexShrink: 0 }}
      >
        Export CSV
      </Button>
    </Stack>
  );
}
