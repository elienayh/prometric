// Multimodal (vision) generation across the same provider set used for text.
// SERVER-ONLY. Mirrors unified-generate.server.ts but accepts one image input
// and instructs the model to return strict JSON.

import type { ResolvedModel } from "./unified-generate.server";

export type ImageInput = {
  base64: string; // raw base64 (no data: prefix)
  mime: "image/jpeg" | "image/png" | "image/webp";
};

export async function generateMultimodalJSON(
  resolved: ResolvedModel,
  systemPrompt: string,
  userPrompt: string,
  image: ImageInput,
): Promise<unknown> {
  const text = await callVisionProvider(resolved, systemPrompt, userPrompt, image);
  return safeParseJSON(text);
}

function safeParseJSON(raw: string): unknown {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // ignore
      }
    }
    throw new Error("Resposta da IA não é JSON válido");
  }
}

async function callVisionProvider(
  resolved: ResolvedModel,
  system: string,
  user: string,
  image: ImageInput,
): Promise<string> {
  const { provider, model, apiKey } = resolved;
  switch (provider) {
    case "openai":
      return callOpenAICompatibleVision(
        "https://api.openai.com/v1/chat/completions",
        { Authorization: `Bearer ${apiKey}` },
        model,
        system,
        user,
        image,
      );
    case "xai":
      return callOpenAICompatibleVision(
        "https://api.x.ai/v1/chat/completions",
        { Authorization: `Bearer ${apiKey}` },
        model,
        system,
        user,
        image,
      );
    case "google":
      return callGoogleVision(apiKey, model, system, user, image);
    case "anthropic":
      return callAnthropicVision(apiKey, model, system, user, image);
  }
}

async function callOpenAICompatibleVision(
  url: string,
  authHeaders: Record<string, string>,
  model: string,
  system: string,
  user: string,
  image: ImageInput,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: user },
            {
              type: "image_url",
              image_url: { url: `data:${image.mime};base64,${image.base64}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
  if (res.status === 402) throw new Error("Créditos de IA esgotados.");
  if (!res.ok) throw new Error(`Falha na IA de visão (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json?.choices?.[0]?.message?.content ?? "{}";
}

async function callGoogleVision(
  apiKey: string,
  model: string,
  system: string,
  user: string,
  image: ImageInput,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [
        {
          role: "user",
          parts: [
            { text: user },
            { inline_data: { mime_type: image.mime, data: image.base64 } },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    }),
  });
  if (!res.ok) throw new Error(`Falha na IA Google (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
}

async function callAnthropicVision(
  apiKey: string,
  model: string,
  system: string,
  user: string,
  image: ImageInput,
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: system + "\n\nIMPORTANTE: responda EXCLUSIVAMENTE em JSON válido, sem markdown.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: image.mime, data: image.base64 },
            },
            { type: "text", text: user },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Falha na IA Anthropic (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { content?: Array<{ text?: string }> };
  return json?.content?.[0]?.text ?? "{}";
}
