import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PROMETRIC_PROMPT_VERSION } from "@/lib/ai/prometric-system-prompt";

type ProviderId = "openai" | "google" | "anthropic" | "xai";

const VALID_PROVIDERS: ReadonlyArray<ProviderId> = [
  "google",
  "openai",
  "anthropic",
  "xai",
];

// ─────────────────────────────────────────────────────────────────────────────
// GET — config segura (sem ciphertext)
// ─────────────────────────────────────────────────────────────────────────────
export const getTenantAiConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tenantId: string }) => {
    if (!data?.tenantId) throw new Error("tenantId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: cfg, error } = await supabase.rpc("get_tenant_ai_config" as never, {
      _tenant: data.tenantId,
    } as never);
    if (error) throw new Error(error.message);
    return cfg as unknown as null | {
      id: string;
      provider: ProviderId;
      model: string;
      is_active: boolean;
      has_key: boolean;
      fingerprint: string | null;
      last_tested_at: string | null;
      last_test_ok: boolean | null;
      last_test_error: string | null;
      last_test_latency_ms: number | null;
      prompt_version: string;
      updated_at: string;
    };
  });

// ─────────────────────────────────────────────────────────────────────────────
// SAVE — cria/atualiza credencial (criptografa server-side)
// ─────────────────────────────────────────────────────────────────────────────
type SaveInput = {
  tenantId: string;
  provider: ProviderId;
  model: string;
  apiKey?: string; // opcional: se ausente, atualiza apenas provider/model
  isActive?: boolean;
};

export const saveTenantAiCredential = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SaveInput) => {
    if (!data?.tenantId) throw new Error("tenantId obrigatório");
    if (!VALID_PROVIDERS.includes(data.provider)) throw new Error("Provedor inválido");
    if (!data.model || data.model.length < 2) throw new Error("Modelo obrigatório");
    if (data.apiKey !== undefined && data.apiKey.length > 0 && data.apiKey.length < 8) {
      throw new Error("Chave de API muito curta");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verifica permissão: platform admin (super_admin, inclusive em impersonação) ou admin do tenant
    const { data: isPlatform } = await supabase.rpc("is_platform_admin" as never, {
      _user: userId,
    } as never);
    let isAdmin = false;
    if (!isPlatform) {
      const { data: isTenantAdmin } = await supabase.rpc("is_tenant_admin" as never, {
        _tenant: data.tenantId,
      } as never);
      isAdmin = Boolean(isTenantAdmin);
    }
    if (!isPlatform && !isAdmin) throw new Error("Sem permissão para gerenciar IA deste espaço");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Carrega credencial existente (tenta admin primeiro, fallback para context)
    let existing: {
      id: string;
      api_key_ciphertext: string | null;
      api_key_iv: string | null;
      api_key_tag: string | null;
      api_key_fingerprint: string | null;
    } | null = null;

    try {
      const { data: adminExisting } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .select("id, api_key_ciphertext, api_key_iv, api_key_tag, api_key_fingerprint")
        .eq("tenant_id" as never, data.tenantId)
        .maybeSingle();
      if (adminExisting) existing = adminExisting as typeof existing;
    } catch {
      // fallback
    }

    if (!existing) {
      const { data: userExisting } = await supabase
        .from("tenant_ai_credentials" as never)
        .select("id, api_key_ciphertext, api_key_iv, api_key_tag, api_key_fingerprint")
        .eq("tenant_id" as never, data.tenantId)
        .maybeSingle();
      if (userExisting) existing = userExisting as typeof existing;
    }

    let encrypted: { ciphertext: string; iv: string; tag: string; fingerprint: string } | null = null;

    if (data.apiKey && data.apiKey.trim().length > 0) {
      const { encryptApiKey } = await import("@/lib/ai/crypto.server");
      encrypted = encryptApiKey(data.apiKey.trim());
    } else if (!existing || !existing.api_key_ciphertext) {
      throw new Error("Informe a chave de API para configurar a Inteligência Artificial deste espaço.");
    }

    const row = {
      tenant_id: data.tenantId,
      provider: data.provider,
      model: data.model,
      is_active: data.isActive ?? true,
      prompt_version: PROMETRIC_PROMPT_VERSION,
      api_key_ciphertext: encrypted?.ciphertext ?? existing?.api_key_ciphertext ?? null,
      api_key_iv: encrypted?.iv ?? existing?.api_key_iv ?? null,
      api_key_tag: encrypted?.tag ?? existing?.api_key_tag ?? null,
      api_key_fingerprint: encrypted?.fingerprint ?? existing?.api_key_fingerprint ?? null,
      created_by: userId,
      updated_at: new Date().toISOString(),
    };

    // Tenta persistir com supabaseAdmin (ignora RLS se chave de serviço estiver disponível)
    let saveSuccess = false;
    let lastError: Error | null = null;

    try {
      const { error: adminErr } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .upsert(row as never, { onConflict: "tenant_id" });
      if (!adminErr) {
        saveSuccess = true;
      } else {
        lastError = new Error(adminErr.message);
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    // Se falhou (ex: ambiente com fallback de credencial), tenta salvar com context.supabase autenticado
    if (!saveSuccess) {
      const { error: userErr } = await supabase
        .from("tenant_ai_credentials" as never)
        .upsert(row as never, { onConflict: "tenant_id" });
      if (userErr) {
        throw new Error(lastError?.message || userErr.message);
      }
    }

    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────────────────────
// TEST — testa conexão com o provedor (descriptografa server-side e faz ping)
// ─────────────────────────────────────────────────────────────────────────────
export const testTenantAiCredential = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      tenantId: string;
      overrideApiKey?: string;
      provider?: ProviderId;
      model?: string;
    }) => {
      if (!data?.tenantId) throw new Error("tenantId obrigatório");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isPlatform } = await supabase.rpc("is_platform_admin" as never, {
      _user: userId,
    } as never);
    let isAdmin = false;
    if (!isPlatform) {
      const { data: isTenantAdmin } = await supabase.rpc("is_tenant_admin" as never, {
        _tenant: data.tenantId,
      } as never);
      isAdmin = Boolean(isTenantAdmin);
    }
    if (!isPlatform && !isAdmin) throw new Error("Sem permissão");

    // Server-side lê a credencial
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let cred: {
      provider: ProviderId;
      model: string;
      api_key_ciphertext: string | null;
      api_key_iv: string | null;
      api_key_tag: string | null;
    } | null = null;

    try {
      const { data: adminCred } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .select("provider, model, api_key_ciphertext, api_key_iv, api_key_tag")
        .eq("tenant_id" as never, data.tenantId)
        .maybeSingle();
      if (adminCred) cred = adminCred as typeof cred;
    } catch {}

    if (!cred) {
      const { data: userCred } = await supabase
        .from("tenant_ai_credentials" as never)
        .select("provider, model, api_key_ciphertext, api_key_iv, api_key_tag")
        .eq("tenant_id" as never, data.tenantId)
        .maybeSingle();
      if (userCred) cred = userCred as typeof cred;
    }

    let apiKey = data.overrideApiKey ?? "";
    const targetProvider: ProviderId =
      data.provider ?? cred?.provider ?? "google";
    const targetModel: string =
      data.model ?? cred?.model ?? "gemini-3.1-flash-lite";

    if (!apiKey) {
      if (!cred || !cred.api_key_ciphertext || !cred.api_key_iv || !cred.api_key_tag) {
        throw new Error("Nenhuma chave informada ou cadastrada para testar");
      }
      const { decryptApiKey } = await import("@/lib/ai/crypto.server");
      apiKey = decryptApiKey({
        ciphertext: cred.api_key_ciphertext,
        iv: cred.api_key_iv,
        tag: cred.api_key_tag,
      });
    }

    const { pingProvider } = await import("@/lib/ai/providers.server");
    const result = await pingProvider(targetProvider, apiKey, targetModel);

    // Se houver registro no banco, persiste resultado do teste (tenta admin, fallback para context)
    if (cred) {
      const updatePayload = {
        last_tested_at: new Date().toISOString(),
        last_test_ok: result.ok,
        last_test_error: result.ok ? null : (result.error ?? "Erro desconhecido"),
        last_test_latency_ms: result.latencyMs,
      };

      const { error: adminUpdateErr } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .update(updatePayload as never)
        .eq("tenant_id" as never, data.tenantId);

      if (adminUpdateErr) {
        await supabase
          .from("tenant_ai_credentials" as never)
          .update(updatePayload as never)
          .eq("tenant_id" as never, data.tenantId);
      }
    }

    return result;
  });

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTenantAiCredential = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tenantId: string }) => {
    if (!data?.tenantId) throw new Error("tenantId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isPlatform } = await supabase.rpc("is_platform_admin" as never, {
      _user: userId,
    } as never);
    let isAdmin = false;
    if (!isPlatform) {
      const { data: isTenantAdmin } = await supabase.rpc("is_tenant_admin" as never, {
        _tenant: data.tenantId,
      } as never);
      isAdmin = Boolean(isTenantAdmin);
    }
    if (!isPlatform && !isAdmin) throw new Error("Sem permissão");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: adminDelErr } = await supabaseAdmin
      .from("tenant_ai_credentials" as never)
      .delete()
      .eq("tenant_id" as never, data.tenantId);

    if (adminDelErr) {
      const { error: userDelErr } = await supabase
        .from("tenant_ai_credentials" as never)
        .delete()
        .eq("tenant_id" as never, data.tenantId);
      if (userDelErr) throw new Error(userDelErr.message);
    }

    return { ok: true };
  });
