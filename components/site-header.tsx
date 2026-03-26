"use client";

import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { MuiNextLink } from "@/components/mui-next-link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import type { SessionUser } from "@/lib/session";

type Props = {
  user: SessionUser | null;
};

export function SiteHeader({ user }: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
      setMobileOpen(false);
    }
  }

  const authedLinks = (
    <>
      {user?.isAdmin ? (
        <Button component={MuiNextLink} href="/admin" color="warning" variant="outlined" size="small" sx={{ opacity: 1 }}>
          Admin
        </Button>
      ) : null}
      <Button component={MuiNextLink} href="/intakes" color="inherit" sx={{ opacity: 0.9 }}>
        Intakes
      </Button>
      <Button component={MuiNextLink} href="/intakes/new" variant="outlined" color="inherit" size="small">
        New intake
      </Button>
      <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", md: "block" }, maxWidth: 160 }} noWrap title={user?.email}>
        {user?.name}
      </Typography>
      <Button color="inherit" size="small" disabled={loggingOut} onClick={() => void logout()}>
        {loggingOut ? "Signing out…" : "Log out"}
      </Button>
    </>
  );

  const guestLinks = (
    <>
      <Button component={MuiNextLink} href="/login" color="inherit" sx={{ opacity: 0.9 }}>
        Log in
      </Button>
      <Button component={MuiNextLink} href="/register" variant="outlined" color="inherit" size="small">
        Register
      </Button>
    </>
  );

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(12px)",
        bgcolor: "rgba(18,24,31,0.85)",
      }}
    >
      <Container maxWidth="md">
        <Toolbar disableGutters sx={{ gap: 2, minHeight: 64 }}>
          <Typography
            component={MuiNextLink}
            href="/"
            variant="h6"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              fontWeight: 700,
              color: "primary.main",
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            Intake triage
          </Typography>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, ml: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {user ? authedLinks : guestLinks}
          </Box>
          <IconButton
            color="inherit"
            edge="end"
            sx={{ display: { xs: "inline-flex", md: "none" }, ml: "auto" }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }} role="presentation">
          <List>
            {user ? (
              <>
                {user.isAdmin ? (
                  <ListItemButton component={MuiNextLink} href="/admin" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Admin" />
                  </ListItemButton>
                ) : null}
                <ListItemButton component={MuiNextLink} href="/intakes" onClick={() => setMobileOpen(false)}>
                  <ListItemText primary="Intakes" />
                </ListItemButton>
                <ListItemButton component={MuiNextLink} href="/intakes/new" onClick={() => setMobileOpen(false)}>
                  <ListItemText primary="New intake" />
                </ListItemButton>
                <ListItemButton disabled={loggingOut} onClick={() => void logout()}>
                  <ListItemText primary={loggingOut ? "Signing out…" : "Log out"} />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton component={MuiNextLink} href="/login" onClick={() => setMobileOpen(false)}>
                  <ListItemText primary="Log in" />
                </ListItemButton>
                <ListItemButton component={MuiNextLink} href="/register" onClick={() => setMobileOpen(false)}>
                  <ListItemText primary="Register" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
