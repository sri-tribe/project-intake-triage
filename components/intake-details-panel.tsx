"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

type Props = {
  id: string;
  initialTitle: string;
  initialDescription: string;
  initialBudgetRange: string;
  initialTimeline: string;
  initialIndustry: string;
  readOnly?: boolean;
};

function emptyLabel(value: string) {
  const t = value.trim();
  return t ? t : "—";
}

export function IntakeDetailsPanel({
  id,
  initialTitle,
  initialDescription,
  initialBudgetRange,
  initialTimeline,
  initialIndustry,
  readOnly,
}: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [budgetRange, setBudgetRange] = useState(initialBudgetRange);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [industry, setIndustry] = useState(initialIndustry);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setBudgetRange(initialBudgetRange);
    setTimeline(initialTimeline);
    setIndustry(initialIndustry);
  }, [initialTitle, initialDescription, initialBudgetRange, initialTimeline, initialIndustry]);

  function cancelEdit() {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setBudgetRange(initialBudgetRange);
    setTimeline(initialTimeline);
    setIndustry(initialIndustry);
    setError(null);
    setIsEditing(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/intakes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, budgetRange, timeline, industry }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      await router.push("/?updated=1");
    } catch {
      setError("Could not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this intake?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/intakes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Delete failed");
        return;
      }
      await router.push("/intakes");
    } catch {
      setError("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (!isEditing) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
          <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
            Intake details
          </Typography>
          {readOnly ? null : (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="outlined" color="error" size="small" onClick={remove} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </Stack>
          )}
        </Stack>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Description
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {emptyLabel(description)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Budget
            </Typography>
            <Typography variant="body2">{emptyLabel(budgetRange)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Timeline
            </Typography>
            <Typography variant="body2">{emptyLabel(timeline)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Industry
            </Typography>
            <Typography variant="body2">{emptyLabel(industry)}</Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={save}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
          Edit intake
        </Typography>
        <Button variant="text" size="small" onClick={cancelEdit} disabled={saving}>
          Cancel
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tip: open the assistant (floating button) to refine wording before you save.
      </Typography>
      <Stack spacing={2.5}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={6}
        />
        <TextField label="Budget range" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} fullWidth />
        <TextField label="Timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)} fullWidth />
        <TextField label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} fullWidth />
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Typography variant="caption" color="text.secondary">
          After you save, you&apos;ll return home while AI insight refreshes in the background.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="outlined" color="error" onClick={remove} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
