// Camada server-only — resolve o provedor + modelo + chave da IA para um tenant.
// Se o tenant não tiver credencial ativa, faz fallback para Lovable AI.
// NUNCA importar deste arquivo a partir de código de browser.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProviderId } from "./providers-catalog";
import { DEFAULT_MODELS } from "./providers-catalog";

export type ResolvedModel = {
  provider: ProviderId;
  model: string;
  apiKey: string; // chave em claro (válida apenas no escopo desta requisição)
  source: "tenant" | "fallback";
  promptVersion: string;
};

export async function resolveTenantModel(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<ResolvedModel> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: cred } = await supabaseAdmin
    .from("tenant_ai_credentials" as never)
    .select(
      "provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version",
    )
    .eq("tenant_id" as never, tenantId)
    .maybeSingle();

  void supabase; // mantido para futura validação cruzada

  const row = cred as
    | null
    | {
        provider: ProviderId;
        model: string;
        is_active: boolean;
        api_key_ciphertext: string | null;
        api_key_iv: string | null;
        api_key_tag: string | null;
        prompt_version: string | null;
      };

  if (row?.is_active && row.provider !== "lovable" && row.api_key_ciphertext) {
    const { decryptApiKey } = await import("./crypto.server");
    const apiKey = decryptApiKey({
      ciphertext: row.api_key_ciphertext,
      iv: row.api_key_iv!,
      tag: row.api_key_tag!,
    });
    return {
      provider: row.provider,
      model: row.model,
      apiKey,
      source: "tenant",
      promptVersion: row.prompt_version ?? "v1.0.0",
    };
  }

  // Fallback: Lovable AI
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY ausente no servidor");
  return {
    provider: "lovable",
    model: row?.is_active && row.provider === "lovable" ? row.model : DEFAULT_MODELS.lovable,
    apiKey: lovableKey,
    source: "fallback",
    promptVersion: row?.prompt_version ?? "v1.0.0",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Geração unificada — recebe system + user prompt e devolve JSON parseado.
// Todos os provedores são instruídos a retornar JSON válido.
// ─────────────────────────────────────────────────────────────────────────────

export async function generateJSON(
  resolved: ResolvedModel,
  systemPrompt: string,
  userPrompt: string,
): Promise<unknown> {
  const { provider, model, apiKey } = resolved;
  const text = await callProvider(provider, apiKey, model, systemPrompt, userPrompt);
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
    // Tenta extrair primeiro bloco { ... }
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

async function callProvider(
  provider: ProviderId,
  apiKey: string,
  model: string,
  system: string,
  user: string,
): Promise<string> {
  switch (provider) {
    case "openai":
      return callOpenAICompatible(
        "https://api.openai.com/v1/chat/completions",
        { Authorization: `Bearer ${apiKey}` },
        model,
        system,
        user,
      );
    case "xai":
      return callOpenAICompatible(
        "https://api.x.ai/v1/chat/completions",
        { Authorization: `Bearer ${apiKey}` },
        model,
        system,
        user,
      );
    case "lovable":
      return callOpenAICompatible(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        { "Lovable-API-Key": apiKey },
        model,
        system,
        user,
      );
    case "google":
      return callGoogle(apiKey, model, system, user);
    case "anthropic":
      return callAnthropic(apiKey, model, system, user);
  }
}

async function callOpenAICompatible(
  url: string,
  authHeaders: Record<string, string>,
  model: string,
  system: string,
  user: string,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
  if (res.status === 402) throw new Error("Créditos de IA esgotados.");
  if (!res.ok) throw new Error(`Falha na IA (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json?.choices?.[0]?.message?.content ?? "{}";
}

async function callGoogle(apiKey: string, model: string, system: string, user: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`Falha na IA Google (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
}

async function callAnthropic(apiKey: string, model: string, system: string, user: string): Promise<string> {
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
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Falha na IA Anthropic (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { content?: Array<{ text?: string }> };
  return json?.content?.[0]?.text ?? "{}";
}
