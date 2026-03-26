import { aiConfig } from "@/lib/ai-config";
import { isRetriableHttpStatus, retryDelayMs, sleep } from "@/lib/openai-retry";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const MAX_ATTEMPTS_PER_MODEL = 3;
const BASE_DELAY_MS = 600;
const MAX_DELAY_MS = 8000;

const SYSTEM_PROMPT =
  "You help with project intake triage. Give short, practical suggestions: bullet points or a brief paragraph. No preamble.";

type OpenAIChatResponse = {
  choices?: { message?: { content?: string | null } }[];
  error?: { message?: string };
};

type FetchOutcome =
  | { ok: true; data: OpenAIChatResponse }
  | { ok: false; status: number; message: string; retriable: boolean };

async function fetchChatCompletionOnce(body: object): Promise<FetchOutcome> {
  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as OpenAIChatResponse;

    if (res.ok) {
      return { ok: true, data };
    }

    const message = data.error?.message || res.statusText || `HTTP ${res.status}`;
    const retriable = isRetriableHttpStatus(res.status);
    return { ok: false, status: res.status, message, retriable };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network request failed";
    return { ok: false, status: 0, message, retriable: true };
  }
}

/**
 * Retries transient failures, then optionally tries fallback model (if different from primary).
 */
async function completeWithModelChain(buildBody: (model: string) => object): Promise<OpenAIChatResponse> {
  const models = [aiConfig.model];
  if (aiConfig.fallbackModel !== aiConfig.model) {
    models.push(aiConfig.fallbackModel);
  }

  const errors: string[] = [];

  for (let m = 0; m < models.length; m++) {
    const model = models[m];
    let lastMessage = "OpenAI request failed";

    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
      if (attempt > 0) {
        await sleep(retryDelayMs(attempt - 1, BASE_DELAY_MS, MAX_DELAY_MS));
      }

      const outcome = await fetchChatCompletionOnce(buildBody(model));

      if (outcome.ok) {
        return outcome.data;
      }

      lastMessage = outcome.message;
      if (!outcome.retriable) {
        errors.push(`${model}: ${lastMessage}`);
        break;
      }
      if (attempt === MAX_ATTEMPTS_PER_MODEL - 1) {
        errors.push(`${model}: ${lastMessage} (after ${MAX_ATTEMPTS_PER_MODEL} attempts)`);
      }
    }
  }

  throw new Error(errors.length ? errors.join(" → ") : "OpenAI request failed");
}

export async function completeUserPrompt(userPrompt: string): Promise<string> {
  const data = await completeWithModelChain((model) => ({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 512,
    temperature: 0.5,
  }));

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty response from model");
  }

  return text;
}

const JSON_SYSTEM_PREFIX =
  "You must respond with a single valid JSON object only, no markdown or code fences.";

export async function completeJsonObject(systemPrompt: string, userPrompt: string): Promise<string> {
  const data = await completeWithModelChain((model) => ({
    model,
    messages: [
      { role: "system", content: `${JSON_SYSTEM_PREFIX}\n\n${systemPrompt}` },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 700,
    temperature: 0.4,
    response_format: { type: "json_object" },
  }));

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty JSON response from model");
  }

  return text;
}
