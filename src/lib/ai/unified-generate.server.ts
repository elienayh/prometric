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
    tenant_id?: string;
    provider: ProviderId;
    model: string;
    is_active: boolean;
    api_key_ciphertext: string | null;
    api_key_iv: string | null;
    api_key_tag: string | null;
    prompt_version: string | null;
  };

  const normalizeGoogleModel = (model: string): string => {
    let chosen = model || "gemini-3.1-flash-lite";
    if (
      chosen.includes("lite") ||
      chosen.includes("3.5") ||
      chosen.includes("2.5") ||
      chosen.includes("2.0") ||
      chosen.includes("1.5")
    ) {
      chosen = "gemini-3.1-flash-lite";
    } else if (chosen.includes("pro")) {
      chosen = "gemini-3.1-pro-preview";
    } else if (chosen.includes("3.8")) {
      chosen = "gemini-3.8-flash";
    } else {
      chosen = "gemini-3.1-flash-lite";
    }
    return chosen;
  };

  console.info(
    `[resolveTenantModel] Iniciando resolução de IA: tenantId="${tenantId ?? "(nenhum)"}", userId="${userId ?? "(nenhum)"}"`
  );

  // 1) Prioridade máxima: Chave do tenant solicitado (cada tenant tem a sua)
  if (tenantId) {
    let cred: CredRow | null = null;
    try {
      const { data } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .select("tenant_id, provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version")
        .eq("tenant_id" as never, tenantId)
        .maybeSingle();
      cred = data as CredRow | null;
    } catch (err) {
      console.warn(`[resolveTenantModel] Erro ao buscar credencial do tenant "${tenantId}" via admin:`, err);
    }

    if (!cred && supabase) {
      try {
        const { data } = await supabase
          .from("tenant_ai_credentials" as never)
          .select("tenant_id, provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version")
          .eq("tenant_id" as never, tenantId)
          .maybeSingle();
        cred = data as CredRow | null;
      } catch (err) {
        console.warn(`[resolveTenantModel] Erro ao buscar credencial do tenant "${tenantId}" via supabase client:`, err);
      }
    }

    if (cred) {
      console.info(
        `[resolveTenantModel] Linha encontrada em tenant_ai_credentials para tenantId="${tenantId}": provider="${cred.provider}", model="${cred.model}", is_active=${cred.is_active}, has_ciphertext=${Boolean(cred.api_key_ciphertext)}`
      );

      if (!cred.is_active) {
        console.warn(`[resolveTenantModel] A chave de IA do tenant "${tenantId}" está desativada.`);
        throw new Error(
          "A chave de IA cadastrada para este espaço está desativada. Acesse Configurações > Inteligência Artificial para ativá-la."
        );
      }

      if (!cred.api_key_ciphertext || !cred.api_key_iv || !cred.api_key_tag) {
        console.warn(`[resolveTenantModel] A credencial de IA do tenant "${tenantId}" está incompleta.`);
        throw new Error(
          "A credencial de IA deste espaço está com campos incompletos no banco de dados. Acesse Configurações > Inteligência Artificial e recadastre a chave."
        );
      }

      try {
        const apiKey = decryptApiKey({
          ciphertext: cred.api_key_ciphertext,
          iv: cred.api_key_iv,
          tag: cred.api_key_tag,
        });

        if (!apiKey || apiKey.trim().length < 5) {
          throw new Error("Chave de API descriptografada vazia ou em formato inválido");
        }

        const chosenModel = cred.provider === "google" ? normalizeGoogleModel(cred.model) : cred.model;

        console.info(
          `[resolveTenantModel] Descriptografia concluída com SUCESSO. Fonte: "tenant" (${tenantId}), provider: "${cred.provider}", model: "${chosenModel}".`
        );

        return {
          provider: cred.provider,
          model: chosenModel,
          apiKey: apiKey.trim(),
          source: "tenant",
          promptVersion: cred.prompt_version ?? "v1.0.0",
        };
      } catch (decryptErr) {
        const msg = decryptErr instanceof Error ? decryptErr.message : String(decryptErr);
        console.error(`[resolveTenantModel] ERRO ao descriptografar chave do tenant "${tenantId}":`, msg);
        throw new Error(
          `Falha ao descriptografar a chave de IA cadastrada para este espaço (${msg}). Acesse Configurações > Inteligência Artificial para recadastrar sua chave.`
        );
      }
    } else {
      console.info(`[resolveTenantModel] Nenhuma linha encontrada em tenant_ai_credentials para tenantId="${tenantId}".`);
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
        console.info(`[resolveTenantModel] Verificando workspace do usuário logado: "${userTenantId}"`);
        const { data: credUserTenant } = await supabaseAdmin
          .from("tenant_ai_credentials" as never)
          .select("tenant_id, provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version")
          .eq("tenant_id" as never, userTenantId)
          .maybeSingle();

        if (credUserTenant) {
          const c = credUserTenant as CredRow;
          console.info(`[resolveTenantModel] Linha encontrada para userTenantId="${userTenantId}": is_active=${c.is_active}`);
          if (!c.is_active) {
            throw new Error(
              "A chave de IA cadastrada no seu espaço de trabalho está inativa. Acesse Configurações > Inteligência Artificial para ativá-la."
            );
          }
          try {
            const apiKey = decryptApiKey({
              ciphertext: c.api_key_ciphertext!,
              iv: c.api_key_iv!,
              tag: c.api_key_tag!,
            });
            const chosenModel = c.provider === "google" ? normalizeGoogleModel(c.model) : c.model;
            console.info(`[resolveTenantModel] Descriptografia concluída com SUCESSO. Fonte: "user-tenant" ("${userTenantId}").`);
            return {
              provider: c.provider,
              model: chosenModel,
              apiKey: apiKey.trim(),
              source: "user-tenant",
              promptVersion: c.prompt_version ?? "v1.0.0",
            };
          } catch (decryptErr) {
            const msg = decryptErr instanceof Error ? decryptErr.message : String(decryptErr);
            console.error(`[resolveTenantModel] ERRO ao descriptografar chave do user-tenant "${userTenantId}":`, msg);
            throw new Error(`Falha ao descriptografar a chave de IA do seu espaço de trabalho: ${msg}.`);
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("Falha ao descriptografar")) throw err;
      console.warn("[resolveTenantModel] Erro ao buscar credencial do tenant do usuário:", err);
    }
  }

  // 3) Terceira prioridade: Qualquer credencial válida e ativa cadastrada no sistema
  try {
    const { data: allActive } = await supabaseAdmin
      .from("tenant_ai_credentials" as never)
      .select("tenant_id, provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version")
      .eq("is_active" as never, true)
      .not("api_key_ciphertext" as never, "is", null)
      .order("last_tested_at" as never, { ascending: false });

    if (allActive && Array.isArray(allActive)) {
      for (const cand of allActive) {
        const c = cand as CredRow;
        try {
          if (c.api_key_ciphertext && c.api_key_iv && c.api_key_tag) {
            const apiKey = decryptApiKey({
              ciphertext: c.api_key_ciphertext,
              iv: c.api_key_iv,
              tag: c.api_key_tag,
            });
            if (apiKey && apiKey.trim().length > 5) {
              const chosenModel = c.provider === "google" ? normalizeGoogleModel(c.model) : c.model;
              console.info(`[resolveTenantModel] Descriptografia concluída com SUCESSO. Fonte: "shared" (tenant: "${c.tenant_id}").`);
              return {
                provider: c.provider,
                model: chosenModel,
                apiKey: apiKey.trim(),
                source: "shared",
                promptVersion: c.prompt_version ?? "v1.0.0",
              };
            }
          }
        } catch (decryptErr) {
          console.warn(`[resolveTenantModel] Ignorando credencial ativa compartilhada com falha de descriptografia (tenant "${c.tenant_id}"):`, decryptErr);
        }
      }
    }
  } catch (err) {
    console.warn("[resolveTenantModel] Erro ao buscar credenciais ativas do sistema:", err);
  }

  // 4) Fallback: Google Gemini do sistema (.env se configurado)
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (geminiKey && geminiKey.trim().length > 5) {
    console.info(`[resolveTenantModel] Utilizando chave GEMINI_API_KEY do sistema (.env). Fonte: "system-env".`);
    return {
      provider: "google",
      model: DEFAULT_MODELS.google,
      apiKey: geminiKey.trim(),
      source: "fallback",
      promptVersion: "v1.0.0",
    };
  }

  console.warn(
    `[resolveTenantModel] Nenhuma chave de IA configurada para o espaço "${tenantId ?? "(nenhum)"}".`
  );
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

export async function callProvider(
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

  let chosenModel = model || "gemini-3.1-flash-lite";
  if (
    chosenModel.includes("lite") ||
    chosenModel.includes("3.5") ||
    chosenModel.includes("2.5") ||
    chosenModel.includes("2.0") ||
    chosenModel.includes("1.5")
  ) {
    chosenModel = "gemini-3.1-flash-lite";
  } else if (chosenModel.includes("pro")) {
    chosenModel = "gemini-3.1-pro-preview";
  } else if (chosenModel.includes("3.8")) {
    chosenModel = "gemini-3.8-flash";
  }

  const ai = new GoogleGenAI({ apiKey });

  const candidateModels = [
    chosenModel,
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError: unknown = null;

  for (const m of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
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
        const msg = err instanceof Error ? err.message : String(err);
        const isTransient =
          msg.includes("503") ||
          msg.includes("429") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand");
        if (isTransient && attempt === 0) {
          console.warn(
            `[unified-generate] Modelo Google ${m} com pico de demanda temporário (503/429). Aguardando 1.5s para tentar novamente...`
          );
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        console.warn(
          `[unified-generate] Modelo Google ${m} falhou (${msg}). Tentando próximo modelo...`
        );
        break;
      }
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
