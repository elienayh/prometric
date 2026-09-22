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
  supabase?: SupabaseClient,
  tenantId?: string | null,
  userId?: string | null,
): Promise<ResolvedModel> {
  const { decryptApiKey } = await import("./crypto.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  type CredRow = {
    provider: ProviderId;
    model: string;
    is_active: boolean;
    api_key_ciphertext: string | null;
    api_key_iv: string | null;
    api_key_tag: string | null;
    prompt_version: string | null;
  };

  const tryResolveRow = (row: CredRow | null): ResolvedModel | null => {
    if (!row?.is_active || !row.api_key_ciphertext || !row.api_key_iv || !row.api_key_tag) {
      return null;
    }
    try {
      const apiKey = decryptApiKey({
        ciphertext: row.api_key_ciphertext,
        iv: row.api_key_iv,
        tag: row.api_key_tag,
      });
      if (apiKey && apiKey.trim().length > 5) {
        let chosenModel = row.model;
        if (row.provider === "google") {
          if (
            chosenModel.includes("2.5-flash-lite") ||
            chosenModel.includes("2.0-flash") ||
            chosenModel.includes("1.5-flash") ||
            chosenModel === "gemini-flash-lite"
          ) {
            chosenModel = "gemini-3.5-flash-lite";
          } else if (
            chosenModel.includes("2.5-flash") ||
            chosenModel.includes("2.0") ||
            chosenModel === "gemini-flash"
          ) {
            chosenModel = "gemini-3.8-flash";
          }
        }

        return {
          provider: row.provider,
          model: chosenModel,
          apiKey: apiKey.trim(),
          source: "tenant",
          promptVersion: row.prompt_version ?? "v1.0.0",
        };
      }
    } catch (cryptoErr) {
      console.warn("[unified-generate] Falha ao descriptografar credencial candidata:", cryptoErr);
    }
    return null;
  };

  // 1) Prioridade máxima: Chave do tenant solicitado (cada tenant tem a sua)
  if (tenantId) {
    try {
      const { data: cred } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .select("provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version")
        .eq("tenant_id" as never, tenantId)
        .maybeSingle();

      const resolved = tryResolveRow(cred as CredRow);
      if (resolved) return resolved;
    } catch (err) {
      console.warn("[unified-generate] Erro ao buscar credencial do tenant via admin:", err);
    }

    if (supabase) {
      try {
        const { data: credUser } = await supabase
          .from("tenant_ai_credentials" as never)
          .select("provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version")
          .eq("tenant_id" as never, tenantId)
          .maybeSingle();

        const resolved = tryResolveRow(credUser as CredRow);
        if (resolved) return resolved;
      } catch {
        // ignora
      }
    }
  }

  // 2) Segunda prioridade: Workspace ativo do usuário logado (se diferente do tenantId)
  if (userId) {
    try {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("current_tenant_id, impersonating_tenant_id")
        .eq("id", userId)
        .maybeSingle();

      const userTenantId = (prof as any)?.current_tenant_id || (prof as any)?.impersonating_tenant_id;
      if (userTenantId && userTenantId !== tenantId) {
        const { data: credUserTenant } = await supabaseAdmin
          .from("tenant_ai_credentials" as never)
          .select("provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version")
          .eq("tenant_id" as never, userTenantId)
          .maybeSingle();

        const resolved = tryResolveRow(credUserTenant as CredRow);
        if (resolved) return resolved;
      }
    } catch (err) {
      console.warn("[unified-generate] Erro ao buscar credencial do tenant do usuário:", err);
    }
  }

  // 3) Terceira prioridade: Qualquer credencial válida e ativa cadastrada no sistema
  try {
    const { data: allActive } = await supabaseAdmin
      .from("tenant_ai_credentials" as never)
      .select("provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version")
      .eq("is_active" as never, true)
      .not("api_key_ciphertext" as never, "is", null)
      .order("last_tested_at" as never, { ascending: false });

    if (allActive && Array.isArray(allActive)) {
      for (const cand of allActive) {
        const resolved = tryResolveRow(cand as CredRow);
        if (resolved) {
          console.info("[unified-generate] Utilizando credencial de IA ativa compartilhada no sistema.");
          return resolved;
        }
      }
    }
  } catch (err) {
    console.warn("[unified-generate] Erro ao buscar credenciais ativas do sistema:", err);
  }

  // 4) Fallback: Google Gemini do sistema (.env se configurado)
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (geminiKey && geminiKey.trim().length > 5) {
    return {
      provider: "google",
      model: DEFAULT_MODELS.google,
      apiKey: geminiKey.trim(),
      source: "fallback",
      promptVersion: "v1.0.0",
    };
  }

  throw new Error(
    "Nenhuma chave de IA configurada para este espaço. Acesse Configurações > Inteligência Artificial para cadastrar sua chave da API do Google Gemini."
  );
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
  const { GoogleGenAI } = await import("@google/genai");

  let chosenModel = model || "gemini-3.5-flash-lite";
  if (
    chosenModel.includes("2.5-flash-lite") ||
    chosenModel.includes("2.0-flash") ||
    chosenModel.includes("1.5-flash")
  ) {
    chosenModel = "gemini-3.5-flash-lite";
  } else if (chosenModel.includes("2.5-flash") || chosenModel.includes("pro")) {
    chosenModel = "gemini-3.8-flash";
  }

  const ai = new GoogleGenAI({ apiKey });

  const candidateModels = [
    chosenModel,
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError: unknown = null;

  for (const m of candidateModels) {
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: user,
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      if (res.text && res.text.trim().length > 0) {
        return res.text;
      }
    } catch (err: unknown) {
      lastError = err;
      console.warn(`[unified-generate] Modelo Google ${m} falhou (${err instanceof Error ? err.message : String(err)}). Tentando próximo modelo...`);
    }
  }

  throw new Error(`Falha na IA Google: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
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
