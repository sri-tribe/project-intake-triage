"use client";

import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Box,
  Drawer,
  Fab,
  IconButton,
  List,
  ListItem,
  TextField,
  Toolbar,
  Typography,
  CircularProgress,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const WELCOME =
  "Hi — I can help you draft intake wording, think through risks, or summarize ideas. What do you need?";

export function AiChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: WELCOME }]);
  const listRef = useRef<HTMLUListElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, scrollToBottom]);

  async function send() {
    const prompt = input.trim();
    if (!prompt || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setLoading(true);
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json().catch(() => ({}));
      const text =
        res.ok && typeof data.suggestion === "string"
          ? data.suggestion
          : typeof data.error === "string"
            ? `Error: ${data.error}`
            : "Something went wrong.";
      setMessages((m) => [...m, { role: "assistant", text }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Network error." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Fab
        color="primary"
        aria-label="Open AI assistant"
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <SmartToyIcon />
      </Fab>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            maxWidth: "100vw",
            bgcolor: "background.paper",
            borderLeft: 1,
            borderColor: "divider",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Toolbar
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            gap: 1,
            minHeight: 56,
          }}
        >
          <SmartToyIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
            Assistant
          </Typography>
          <IconButton edge="end" onClick={() => setOpen(false)} aria-label="Close chat">
            <CloseIcon />
          </IconButton>
        </Toolbar>

        <List
          ref={listRef}
          dense
          sx={{
            flex: "1 1 auto",
            overflowY: "auto",
            px: 1.5,
            py: 1,
            minHeight: 0,
          }}
        >
          {messages.map((msg, i) => (
            <ListItem
              key={`${i}-${msg.role}`}
              sx={{
                display: "block",
                py: 1,
                alignItems: "flex-start",
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {msg.role === "user" ? "You" : "Assistant"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  bgcolor: msg.role === "user" ? "action.hover" : "transparent",
                  borderRadius: 1,
                  p: msg.role === "user" ? 1 : 0,
                }}
              >
                {msg.text}
              </Typography>
            </ListItem>
          ))}
          {loading ? (
            <ListItem sx={{ justifyContent: "center", py: 2 }}>
              <CircularProgress size={28} />
            </ListItem>
          ) : null}
        </List>

        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            gap: 1,
            alignItems: "flex-end",
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={() => void send()}
            disabled={loading || !input.trim()}
            sx={{ minWidth: 48, px: 1 }}
            aria-label="Send"
          >
            <SendIcon />
          </Button>
        </Box>
        </Box>
      </Drawer>
    </>
  );
}
