"use client";

import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { MuiNextLink } from "@/components/mui-next-link";

export type IntakeListRow = {
  id: string;
  title: string;
  industry: string;
  createdAt: string;
};

export function IntakesList({ intakes }: { intakes: IntakeListRow[] }) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Intakes
        </Typography>
        <Button component={MuiNextLink} href="/intakes/new" variant="contained">
          New intake
        </Button>
      </Stack>
      <Paper variant="outlined">
        {intakes.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              No intakes yet
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 2, maxWidth: 360, mx: "auto" }}>
              When you create an intake, it will show up here. You can add details, budget, timeline, and get AI
              summaries on the detail page.
            </Typography>
            <Button component={MuiNextLink} href="/intakes/new" variant="contained">
              Create your first intake
            </Button>
          </Box>
        ) : (
          <List disablePadding>
            {intakes.map((i) => (
              <ListItemButton
                key={i.id}
                component={MuiNextLink}
                href={`/intakes/${i.id}`}
                alignItems="flex-start"
                divider
              >
                <ListItemText
                  primary={i.title}
                  secondary={
                    i.industry
                      ? `${i.industry} · ${new Date(i.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}`
                      : new Date(i.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                  }
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ variant: "body2" }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>
    </Stack>
  );
}
