"use client";

import { MuiNextLink } from "@/components/mui-next-link";
import type { AdminIntakeCsvRow } from "@/lib/admin-intakes-csv";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

export type AdminIntakeRow = AdminIntakeCsvRow;

export function AdminAllIntakesTable({ intakes }: { intakes: AdminIntakeRow[] }) {
  if (intakes.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          No intakes in the system
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto" }}>
          Intakes from all users will appear in this table. None exist yet — create one from the app as a normal user,
          or run the database seed script if you use demo data.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Submitted by</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Industry</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {intakes.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography
                  component={MuiNextLink}
                  href={`/admin/intakes/${row.id}`}
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  {row.title}
                </Typography>
              </TableCell>
              <TableCell>{row.user.name}</TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                  {row.user.email}
                </Typography>
              </TableCell>
              <TableCell>{row.industry || "—"}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {new Date(row.createdAtIso).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
