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
    signal: AbortSignal.timeout(8000),
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
    signal: AbortSignal.timeout(8000),
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
  const tryModel = async (target: string) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(target)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    return await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PING_PROMPT }] }],
        generationConfig: { maxOutputTokens: 5 },
      }),
    });
  };

  const primaryRes = await tryModel(model);
  if (primaryRes.ok) return;

  const errText = await primaryRes.text();

  // Se a chave for comprovadamente inválida (400 ou 403), propaga o erro imediatamente
  if (primaryRes.status === 400 || primaryRes.status === 403) {
    throw new Error(`Google ${primaryRes.status}: ${errText.slice(0, 200)}`);
  }

  // Se o modelo específico estiver sofrendo sobrecarga pontual (503) ou cota por modelo (429),
  // valida se a chave funciona em modelos alternativos de alta disponibilidade
  const isOverloadedOrDemandSpike =
    primaryRes.status === 503 ||
    primaryRes.status === 429 ||
    errText.toLowerCase().includes("high demand") ||
    errText.toLowerCase().includes("overloaded") ||
    errText.toLowerCase().includes("resource_exhausted");

  if (isOverloadedOrDemandSpike) {
    const candidates = ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite"].filter((c) => c !== model);
    for (const alt of candidates) {
      try {
        const altRes = await tryModel(alt);
        if (altRes.ok) {
          // A chave é 100% válida e comunicou com o Google
          return;
        }
      } catch {
        // continua
      }
    }
  }

  throw new Error(`Google ${primaryRes.status}: ${errText.slice(0, 200)}`);
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
