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

    // Verifica permissão de admin no tenant
    const { data: isAdmin } = await supabase.rpc("is_tenant_admin" as never, {
      _tenant: data.tenantId,
    } as never);
    const { data: isPlatform } = await supabase.rpc("is_platform_admin" as never, {
      _user: userId,
    } as never);
    if (!isAdmin && !isPlatform) throw new Error("Sem permissão para gerenciar IA deste espaço");

    let encrypted: { ciphertext: string; iv: string; tag: string; fingerprint: string } | null = null;

    if (data.apiKey && data.apiKey.trim().length > 0) {
      const { encryptApiKey } = await import("@/lib/ai/crypto.server");
      encrypted = encryptApiKey(data.apiKey.trim());
    }

    // Carrega credencial existente para preservar a chave caso o usuário só tenha alterado provedor/modelo/ativo
    let existing: {
      id?: string;
      api_key_ciphertext?: string | null;
      api_key_iv?: string | null;
      api_key_tag?: string | null;
      api_key_fingerprint?: string | null;
    } | null = null;

    const { data: exUser } = await supabase
      .from("tenant_ai_credentials" as never)
      .select("id, api_key_ciphertext, api_key_iv, api_key_tag, api_key_fingerprint")
      .eq("tenant_id" as never, data.tenantId)
      .maybeSingle();

    if (exUser) {
      existing = exUser as typeof existing;
    } else {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: exAdmin } = await supabaseAdmin
          .from("tenant_ai_credentials" as never)
          .select("id, api_key_ciphertext, api_key_iv, api_key_tag, api_key_fingerprint")
          .eq("tenant_id" as never, data.tenantId)
          .maybeSingle();
        if (exAdmin) existing = exAdmin as typeof existing;
      } catch {
        // ignora fallback de leitura
      }
    }

    const row = {
      tenant_id: data.tenantId,
      provider: data.provider,
      model: data.model,
      is_active: data.isActive ?? true,
      prompt_version: PROMETRIC_PROMPT_VERSION,
      ...(encrypted
        ? {
            api_key_ciphertext: encrypted.ciphertext,
            api_key_iv: encrypted.iv,
            api_key_tag: encrypted.tag,
            api_key_fingerprint: encrypted.fingerprint,
          }
        : existing?.api_key_ciphertext
        ? {
            api_key_ciphertext: existing.api_key_ciphertext,
            api_key_iv: existing.api_key_iv,
            api_key_tag: existing.api_key_tag,
            api_key_fingerprint: existing.api_key_fingerprint,
          }
        : {}),
      created_by: userId,
    };

    // Salva preferencialmente usando o cliente autenticado do usuário (context.supabase),
    // que atende às políticas de RLS (is_tenant_admin / is_platform_admin).
    const { error: userSaveErr } = await supabase
      .from("tenant_ai_credentials" as never)
      .upsert(row as never, { onConflict: "tenant_id" });

    if (userSaveErr) {
      console.warn("[tenant-ai] Tentativa com context.supabase falhou, tentando admin:", userSaveErr.message);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: adminSaveErr } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .upsert(row as never, { onConflict: "tenant_id" });
      if (adminSaveErr) {
        throw new Error(userSaveErr.message || adminSaveErr.message);
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
    const { data: isAdmin } = await supabase.rpc("is_tenant_admin" as never, {
      _tenant: data.tenantId,
    } as never);
    const { data: isPlatform } = await supabase.rpc("is_platform_admin" as never, {
      _user: userId,
    } as never);
    if (!isAdmin && !isPlatform) throw new Error("Sem permissão");

    // Lê registro existente (via supabase autenticado ou supabaseAdmin)
    let row: {
      provider: ProviderId;
      model: string;
      api_key_ciphertext: string | null;
      api_key_iv: string | null;
      api_key_tag: string | null;
    } | null = null;

    const { data: credUser } = await supabase
      .from("tenant_ai_credentials" as never)
      .select("provider, model, api_key_ciphertext, api_key_iv, api_key_tag")
      .eq("tenant_id" as never, data.tenantId)
      .maybeSingle();

    if (credUser) {
      row = credUser as typeof row;
    } else {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: credAdmin } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .select("provider, model, api_key_ciphertext, api_key_iv, api_key_tag")
        .eq("tenant_id" as never, data.tenantId)
        .maybeSingle();
      if (credAdmin) row = credAdmin as typeof row;
    }

    let apiKey = data.overrideApiKey ? data.overrideApiKey.trim() : "";
    const providerToTest = data.provider || row?.provider || "google";
    const modelToTest = data.model || row?.model || "gemini-3.8-flash";

    if (!apiKey) {
      if (!row || !row.api_key_ciphertext || !row.api_key_iv || !row.api_key_tag) {
        throw new Error("Chave de API não cadastrada para este espaço. Digite sua chave ou salve antes de testar.");
      }
      const { decryptApiKey } = await import("@/lib/ai/crypto.server");
      apiKey = decryptApiKey({
        ciphertext: row.api_key_ciphertext,
        iv: row.api_key_iv,
        tag: row.api_key_tag,
      });
    }

    const { pingProvider } = await import("@/lib/ai/providers.server");
    const result = await pingProvider(providerToTest, apiKey, modelToTest);

    // Persiste resultado do teste se o registro já existir no banco
    if (row) {
      const updateData = {
        last_tested_at: new Date().toISOString(),
        last_test_ok: result.ok,
        last_test_error: result.ok ? null : (result.error ?? "Erro desconhecido"),
        last_test_latency_ms: result.latencyMs,
      };

      const { error: updErr } = await supabase
        .from("tenant_ai_credentials" as never)
        .update(updateData as never)
        .eq("tenant_id" as never, data.tenantId);

      if (updErr) {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin
            .from("tenant_ai_credentials" as never)
            .update(updateData as never)
            .eq("tenant_id" as never, data.tenantId);
        } catch {
          // ignora
        }
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
    const { data: isAdmin } = await supabase.rpc("is_tenant_admin" as never, {
      _tenant: data.tenantId,
    } as never);
    const { data: isPlatform } = await supabase.rpc("is_platform_admin" as never, {
      _user: userId,
    } as never);
    if (!isAdmin && !isPlatform) throw new Error("Sem permissão");

    const { error: delErr } = await supabase
      .from("tenant_ai_credentials" as never)
      .delete()
      .eq("tenant_id" as never, data.tenantId);

    if (delErr) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: adminDelErr } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .delete()
        .eq("tenant_id" as never, data.tenantId);
      if (adminDelErr) throw new Error(delErr.message || adminDelErr.message);
    }

    return { ok: true };
  });
