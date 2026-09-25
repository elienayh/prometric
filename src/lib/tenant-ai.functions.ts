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

/**
 * Valida se o usuário tem permissão para gerenciar a IA do tenant.
 * Dá suporte nativo à impersonação por admins da plataforma e validação cruzada
 * em `profiles` e `tenant_members`, garantindo que ações de admin no tenant
 * ou em modo impersonado sejam aceitas sem bloqueio indevido.
 */
async function assertCanManageTenantAi(
  supabase: any,
  userId: string,
  tenantId: string,
) {
  // 1. Tenta RPC padrão
  try {
    const { data: isAdmin } = await supabase.rpc("is_tenant_admin" as never, {
      _tenant: tenantId,
    } as never);
    if (isAdmin) return true;
  } catch (e) {
    console.warn("[tenant-ai] is_tenant_admin rpc check failed:", e);
  }

  try {
    const { data: isPlatform } = await supabase.rpc("is_platform_admin" as never, {
      _user: userId,
    } as never);
    if (isPlatform) return true;
  } catch (e) {
    console.warn("[tenant-ai] is_platform_admin rpc check failed:", e);
  }

  // 2. Fallback resiliente via supabaseAdmin verificando perfil (role e impersonação) ou membro admin
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, is_platform_admin, current_tenant_id, impersonating_tenant_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile) {
    if (
      profile.role === "admin" ||
      profile.is_platform_admin === true ||
      profile.impersonating_tenant_id === tenantId ||
      profile.current_tenant_id === tenantId
    ) {
      return true;
    }
  }

  const { data: member } = await supabaseAdmin
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (member && member.role === "admin") {
    return true;
  }

  throw new Error("Sem permissão para gerenciar IA deste espaço");
}

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
    const { supabase, userId } = context;

    // Garante autorização ampla incluindo impersonação
    await assertCanManageTenantAi(supabase, userId, data.tenantId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cred, error } = await supabaseAdmin
      .from("tenant_ai_credentials" as never)
      .select("id, provider, model, is_active, api_key_ciphertext, api_key_fingerprint, last_tested_at, last_test_ok, last_test_error, last_test_latency_ms, prompt_version, updated_at")
      .eq("tenant_id" as never, data.tenantId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!cred) return null;

    const row = cred as {
      id: string;
      provider: ProviderId;
      model: string;
      is_active: boolean;
      api_key_ciphertext: string | null;
      api_key_fingerprint: string | null;
      last_tested_at: string | null;
      last_test_ok: boolean | null;
      last_test_error: string | null;
      last_test_latency_ms: number | null;
      prompt_version: string;
      updated_at: string;
    };

    return {
      id: row.id,
      provider: row.provider,
      model: row.model,
      is_active: row.is_active,
      has_key: !!row.api_key_ciphertext,
      fingerprint: row.api_key_fingerprint,
      last_tested_at: row.last_tested_at,
      last_test_ok: row.last_test_ok,
      last_test_error: row.last_test_error,
      last_test_latency_ms: row.last_test_latency_ms,
      prompt_version: row.prompt_version,
      updated_at: row.updated_at,
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

    // Verifica permissão de admin no tenant (com suporte a impersonação por admin)
    await assertCanManageTenantAi(supabase, userId, data.tenantId);

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
    await assertCanManageTenantAi(supabase, userId, data.tenantId);

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
    await assertCanManageTenantAi(supabase, userId, data.tenantId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("tenant_ai_credentials" as never)
      .delete()
      .eq("tenant_id" as never, data.tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
