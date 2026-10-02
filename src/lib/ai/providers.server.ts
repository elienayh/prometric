// Camada server-only — ping aos provedores de IA.
// NUNCA importar deste arquivo a partir de código de browser.

import type { ProviderId } from "./providers-catalog";

export type PingResult = {
  ok: boolean;
  latencyMs: number;
  error?: string;
};

const PING_PROMPT = "ok";

async function withTimeout<T>(p: Promise<T>, ms = 12_000): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("Timeout após " + ms + "ms")), ms)),
  ]);
}

export async function pingProvider(
  provider: ProviderId,
  apiKey: string,
  model: string,
): Promise<PingResult> {
  const start = Date.now();
  try {
    switch (provider) {
      case "openai": await withTimeout(pingOpenAI(apiKey, model)); break;
      case "xai": await withTimeout(pingXai(apiKey, model)); break;
      case "google": await withTimeout(pingGoogle(apiKey, model)); break;
      case "anthropic": await withTimeout(pingAnthropic(apiKey, model)); break;
    }
    return { ok: true, latencyMs: Date.now() - start };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, latencyMs: Date.now() - start, error: message };
  }
}

async function pingOpenAI(apiKey: string, model: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: 5,
      messages: [{ role: "user", content: PING_PROMPT }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function pingXai(apiKey: string, model: string) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: 5,
      messages: [{ role: "user", content: PING_PROMPT }],
    }),
  });
  if (!res.ok) throw new Error(`xAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function pingGoogle(apiKey: string, model: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PING_PROMPT }] }],
      generationConfig: { maxOutputTokens: 5 },
    }),
  });
  if (!res.ok) throw new Error(`Google ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function pingAnthropic(apiKey: string, model: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 5,
      messages: [{ role: "user", content: PING_PROMPT }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
