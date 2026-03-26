"use client";

import { Alert, Button, Link as MuiLink, Stack, Typography } from "@mui/material";
import { MuiNextLink } from "@/components/mui-next-link";
import { useRouter } from "next/navigation";

type Props = {
  showIntakeCreated?: boolean;
  showIntakeUpdated?: boolean;
  isLoggedIn?: boolean;
};

export function HomeContent({ showIntakeCreated, showIntakeUpdated, isLoggedIn }: Props) {
  const router = useRouter();

  return (
    <Stack spacing={4}>
      {showIntakeCreated ? (
        <Alert
          severity="success"
          action={
            <Button color="inherit" size="small" onClick={() => router.replace("/")}>
              Dismiss
            </Button>
          }
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Intake saved
          </Typography>
          <Typography variant="body2">
            AI summary, tags, and risk checklist are generating in the background. Open{" "}
            <MuiLink component={MuiNextLink} href="/intakes" underline="hover">
              Intakes
            </MuiLink>{" "}
            in a few seconds to see them.
          </Typography>
        </Alert>
      ) : null}
      {showIntakeUpdated ? (
        <Alert
          severity="success"
          action={
            <Button color="inherit" size="small" onClick={() => router.replace("/")}>
              Dismiss
            </Button>
          }
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Intake updated
          </Typography>
          <Typography variant="body2">
            Your changes are saved. AI insight is refreshing in the background. Check{" "}
            <MuiLink component={MuiNextLink} href="/intakes" underline="hover">
              Intakes
            </MuiLink>{" "}
            shortly.
          </Typography>
        </Alert>
      ) : null}
      <div>
        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
          Intake triage
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
          Capture and review project intakes in one place.
        </Typography>
      </div>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
        {isLoggedIn ? (
          <>
            <Button component={MuiNextLink} href="/intakes" variant="contained" size="large">
              View intakes
            </Button>
            <Button component={MuiNextLink} href="/intakes/new" variant="outlined" size="large">
              New intake
            </Button>
          </>
        ) : (
          <>
            <Button component={MuiNextLink} href="/login" variant="contained" size="large">
              Log in
            </Button>
            <Button component={MuiNextLink} href="/register" variant="outlined" size="large">
              Create account
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
}
