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

    if (data.apiKey && data.apiKey.length > 0) {
      const { encryptApiKey } = await import("@/lib/ai/crypto.server");
      encrypted = encryptApiKey(data.apiKey);
    }

    // Persiste usando supabaseAdmin para evitar falhas de RLS/service role no servidor
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Carrega existente
    const { data: existing } = await supabaseAdmin
      .from("tenant_ai_credentials" as never)
      .select("id, api_key_ciphertext, api_key_iv, api_key_tag, api_key_fingerprint")
      .eq("tenant_id" as never, data.tenantId)
      .maybeSingle();

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
        : {}),
      created_by: userId,
    };

    if (existing) {
      const { error } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .update(row as never)
        .eq("id" as never, (existing as { id: string }).id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("tenant_ai_credentials" as never)
        .insert(row as never);
      if (error) throw new Error(error.message);
    }

    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────────────────────
// TEST — testa conexão com o provedor (descriptografa server-side e faz ping)
// ─────────────────────────────────────────────────────────────────────────────
export const testTenantAiCredential = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tenantId: string; overrideApiKey?: string }) => {
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

    // Server-side lê a credencial completa via service role para descriptografar
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cred, error: credErr } = await supabaseAdmin
      .from("tenant_ai_credentials" as never)
      .select("provider, model, api_key_ciphertext, api_key_iv, api_key_tag")
      .eq("tenant_id" as never, data.tenantId)
      .maybeSingle();
    if (credErr) throw new Error(credErr.message);
    if (!cred) throw new Error("Nenhuma credencial cadastrada — salve antes de testar");

    const row = cred as {
      provider: ProviderId;
      model: string;
      api_key_ciphertext: string | null;
      api_key_iv: string | null;
      api_key_tag: string | null;
    };

    let apiKey = data.overrideApiKey ?? "";
    if (!apiKey) {
      if (!row.api_key_ciphertext || !row.api_key_iv || !row.api_key_tag) {
        throw new Error("Chave de API não cadastrada para este provedor");
      }
      const { decryptApiKey } = await import("@/lib/ai/crypto.server");
      apiKey = decryptApiKey({
        ciphertext: row.api_key_ciphertext,
        iv: row.api_key_iv,
        tag: row.api_key_tag,
      });
    }

    const { pingProvider } = await import("@/lib/ai/providers.server");
    const result = await pingProvider(row.provider, apiKey, row.model);

    // Persiste resultado do teste
    await supabaseAdmin
      .from("tenant_ai_credentials" as never)
      .update({
        last_tested_at: new Date().toISOString(),
        last_test_ok: result.ok,
        last_test_error: result.ok ? null : (result.error ?? "Erro desconhecido"),
        last_test_latency_ms: result.latencyMs,
      } as never)
      .eq("tenant_id" as never, data.tenantId);

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

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("tenant_ai_credentials" as never)
      .delete()
      .eq("tenant_id" as never, data.tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
