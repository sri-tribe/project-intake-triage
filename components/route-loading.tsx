"use client";

import { Box, Paper, Skeleton, Stack } from "@mui/material";

/** Shown by `app/intakes/loading.tsx` while the intakes list loads. */
export function IntakesListLoading() {
  return (
    <Stack spacing={3} aria-busy="true" aria-label="Loading intakes">
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Skeleton variant="text" sx={{ fontSize: "2.125rem", width: 140 }} />
        <Skeleton variant="rounded" width={120} height={40} />
      </Stack>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Box key={i} sx={{ px: 2, py: 2, borderBottom: 1, borderColor: "divider" }}>
            <Skeleton width="55%" height={26} sx={{ mb: 0.75 }} />
            <Skeleton width="35%" height={20} />
          </Box>
        ))}
      </Paper>
    </Stack>
  );
}

/** Shown by `app/intakes/[id]/loading.tsx` while intake detail loads. */
export function IntakeDetailLoading() {
  return (
    <Stack spacing={3} aria-busy="true" aria-label="Loading intake">
      <Skeleton variant="text" width={280} height={24} />
      <Skeleton variant="text" sx={{ fontSize: "2rem", width: "min(100%, 420px)" }} />
      <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
        <Box sx={{ flex: { lg: "0 0 240px" } }}>
          <Skeleton width={80} height={16} sx={{ mb: 1 }} />
          <Skeleton width={200} height={24} />
          <Skeleton width={100} height={28} sx={{ mt: 2 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rounded" height={160} sx={{ mb: 2 }} />
        </Box>
      </Stack>
      <Skeleton variant="rounded" height={220} />
    </Stack>
  );
}

/** Shown by `app/admin/loading.tsx` for admin routes. */
export function AdminPageLoading() {
  return (
    <Stack spacing={2} aria-busy="true" aria-label="Loading admin data">
      <Skeleton variant="text" sx={{ fontSize: "2rem", width: 220 }} />
      <Skeleton variant="text" width="min(100%, 400px)" height={22} />
      <Stack direction="row" justifyContent="flex-end">
        <Skeleton variant="rounded" width={120} height={36} />
      </Stack>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" spacing={4}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width={80} height={20} />
            ))}
          </Stack>
        </Box>
        {[1, 2, 3, 4, 5].map((row) => (
          <Box key={row} sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" spacing={4} alignItems="center">
              <Skeleton width="28%" height={22} />
              <Skeleton width="18%" height={22} />
              <Skeleton width="22%" height={22} />
              <Skeleton width={72} height={22} />
              <Skeleton width={100} height={22} />
            </Stack>
          </Box>
        ))}
      </Paper>
    </Stack>
  );
}

/** Shown by `app/login/loading.tsx` and `app/register/loading.tsx`. */
export function AuthFormLoading() {
  return (
    <Stack spacing={3} maxWidth={440} sx={{ mx: "auto" }} aria-busy="true" aria-label="Loading">
      <Box>
        <Skeleton variant="text" sx={{ fontSize: "2rem", width: 200, mb: 1 }} />
        <Skeleton variant="text" width="100%" height={22} />
      </Box>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
          <Skeleton variant="rounded" height={48} />
        </Stack>
      </Paper>
    </Stack>
  );
}

/** Shown by `app/intakes/new/loading.tsx`. */
export function NewIntakeLoading() {
  return (
    <Stack spacing={3} aria-busy="true" aria-label="Loading new intake form">
      <Skeleton variant="text" width={260} height={24} />
      <Box>
        <Skeleton variant="text" sx={{ fontSize: "2rem", width: 200, mb: 1 }} />
        <Skeleton variant="text" width={320} height={22} />
      </Box>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Skeleton variant="text" width="100%" height={20} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={i === 2 ? 120 : 56} />
          ))}
          <Skeleton variant="rounded" height={48} />
        </Stack>
      </Paper>
    </Stack>
  );
}
