"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";

export function NewIntakeForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [industry, setIndustry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, budgetRange, timeline, industry }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      await router.push("/?created=1");
    } catch {
      setError("Could not complete request. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Use the floating assistant (bottom-right) if you want help drafting text before you submit.
        </Typography>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
          disabled={saving}
          placeholder="Short name for this intake"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={5}
          disabled={saving}
          placeholder="Goals, scope, and context"
        />
        <TextField
          label="Budget range"
          value={budgetRange}
          onChange={(e) => setBudgetRange(e.target.value)}
          fullWidth
          disabled={saving}
          placeholder="e.g. $10k–$25k"
        />
        <TextField
          label="Timeline"
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          fullWidth
          disabled={saving}
          placeholder="e.g. Q2 2025"
        />
        <TextField
          label="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          fullWidth
          disabled={saving}
          placeholder="e.g. Healthcare, Fintech"
        />
        {error ? <Alert severity="error">{error}</Alert> : null}
        {saving ? (
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ color: "text.secondary" }}>
            <CircularProgress size={22} thickness={5} aria-hidden />
            <Typography variant="body2">Saving your intake…</Typography>
          </Stack>
        ) : null}
        <Button type="submit" variant="contained" size="large" disabled={saving}>
          Create intake
        </Button>
      </Stack>
    </Box>
  );
}
