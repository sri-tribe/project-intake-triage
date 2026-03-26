"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "@/lib/mui-theme";
import { SiteHeader } from "@/components/site-header";
import { AiChatBot } from "@/components/ai-chat-bot";
import { Box, Container } from "@mui/material";
import type { SessionUser } from "@/lib/session";

export function AppProviders({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser | null;
}) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            bgcolor: "background.default",
          }}
        >
          <SiteHeader user={user} />
          <Container component="main" maxWidth="md" sx={{ py: 4, flex: 1 }}>
            {children}
          </Container>
          <AiChatBot />
        </Box>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
