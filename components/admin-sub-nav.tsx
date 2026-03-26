"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { MuiNextLink } from "@/components/mui-next-link";

export function AdminSubNav() {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", pb: 2 }}>
      <Typography variant="overline" color="warning.main" fontWeight={700} letterSpacing="0.08em">
        Admin area
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Staff-only views. All routes require an admin account.
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} mt={2} alignItems="center">
        <Button component={MuiNextLink} href="/admin" variant="text" size="small" color="inherit">
          All intakes
        </Button>
        <Button component={MuiNextLink} href="/admin/users" variant="text" size="small" color="inherit">
          Users
        </Button>
        <Button component={MuiNextLink} href="/intakes" variant="outlined" size="small">
          Back to app
        </Button>
      </Stack>
    </Box>
  );
}
