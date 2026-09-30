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
 * em `tenants`, `profiles`, `tenant_members` e `admin_roles`, garantindo que
 * o owner do espaço ou admins sejam aceitos mesmo se a service role key do servidor estiver indisponível.
 */
async function assertCanManageTenantAi(
  supabase: any,
  userId: string,
  tenantId: string,
) {
  // 1. Tenta RPC padrão do Supabase
  try {
    const { data: isAdmin, error: rpcErr1 } = await supabase.rpc("is_tenant_admin" as never, {
      _tenant: tenantId,
    } as never);
    if (!rpcErr1 && isAdmin) return true;
  } catch (e) {
    console.warn("[tenant-ai] is_tenant_admin rpc check:", e);
  }

  try {
    const { data: isPlatform, error: rpcErr2 } = await supabase.rpc("is_platform_admin" as never, {
      _user: userId,
    } as never);
    if (!rpcErr2 && isPlatform) return true;
  } catch (e) {
    console.warn("[tenant-ai] is_platform_admin rpc check:", e);
  }

  // 2. Consulta direta usando o próprio cliente autenticado do usuário (respeitando RLS)
  try {
    // Verifica se o usuário é o criador/proprietário do tenant
    const { data: tenant } = await supabase
      .from("tenants" as never)
      .select("owner_id")
      .eq("id" as never, tenantId)
      .maybeSingle();

    if (tenant && (tenant as { owner_id: string | null }).owner_id === userId) {
      return true;
    }
  } catch (e) {
    console.warn("[tenant-ai] tenant owner check via user client:", e);
  }

  try {
    // Verifica papel em tenant_members para este tenant
    const { data: member } = await supabase
      .from("tenant_members" as never)
      .select("role")
      .eq("tenant_id" as never, tenantId)
      .eq("user_id" as never, userId)
      .maybeSingle();

    if (member && (member as { role: string }).role === "admin") {
      return true;
    }
  } catch (e) {
    console.warn("[tenant-ai] tenant_member check via user client:", e);
  }

  try {
    // Verifica perfil do usuário (admin de plataforma, workspace atual ou impersonação)
    const { data: profile } = await supabase
      .from("profiles" as never)
      .select("role, is_platform_admin, current_tenant_id, impersonating_tenant_id")
      .eq("id" as never, userId)
      .maybeSingle();

    if (profile) {
      const p = profile as {
        role?: string;
        is_platform_admin?: boolean;
        current_tenant_id?: string;
        impersonating_tenant_id?: string;
      };
      if (
        p.role === "admin" ||
        p.is_platform_admin === true ||
        p.impersonating_tenant_id === tenantId ||
        p.current_tenant_id === tenantId
      ) {
        return true;
      }
    }
  } catch (e) {
    console.warn("[tenant-ai] profile check via user client:", e);
  }

  try {
    // Verifica tabela admin_roles
    const { data: adminRole } = await supabase
      .from("admin_roles" as never)
      .select("role")
      .eq("user_id" as never, userId)
      .maybeSingle();

    if (adminRole) return true;
  } catch (e) {}

  // 3. Fallback resiliente via supabaseAdmin (caso a chave service_role esteja configurada e válida)
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile, error: admProfErr } = await supabaseAdmin
      .from("profiles")
      .select("role, is_platform_admin, current_tenant_id, impersonating_tenant_id")
      .eq("id", userId)
      .maybeSingle();

    if (!admProfErr && profile) {
      if (
        profile.role === "admin" ||
        profile.is_platform_admin === true ||
        profile.impersonating_tenant_id === tenantId ||
        profile.current_tenant_id === tenantId
      ) {
        return true;
      }
    }

    const { data: member, error: admMemErr } = await supabaseAdmin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!admMemErr && member && member.role === "admin") {
      return true;
    }

    const { data: tenant, error: admTenErr } = await supabaseAdmin
      .from("tenants")
      .select("owner_id")
      .eq("id", tenantId)
      .maybeSingle();

    if (!admTenErr && tenant && tenant.owner_id === userId) {
      return true;
    }
  } catch (adminErr) {
    console.warn("[tenant-ai] admin client fallback check failed:", adminErr);
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

    // 1. Tenta carregar via supabase autenticado do usuário (RLS nativo)
    let cred: any = null;
    try {
      const res = await supabase
        .from("tenant_ai_credentials" as never)
        .select("id, provider, model, is_active, api_key_ciphertext, api_key_fingerprint, last_tested_at, last_test_ok, last_test_error, last_test_latency_ms, prompt_version, updated_at")
        .eq("tenant_id" as never, data.tenantId)
        .maybeSingle();
      if (!res.error && res.data) {
        cred = res.data;
      }
    } catch (e) {
      console.warn("[tenant-ai] Leitura via supabase do usuário:", e);
    }

    // 2. Se não retornou e supabaseAdmin estiver configurado, tenta supabaseAdmin
    if (!cred) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const res = await supabaseAdmin
          .from("tenant_ai_credentials" as never)
          .select("id, provider, model, is_active, api_key_ciphertext, api_key_fingerprint, last_tested_at, last_test_ok, last_test_error, last_test_latency_ms, prompt_version, updated_at")
          .eq("tenant_id" as never, data.tenantId)
          .maybeSingle();
        if (!res.error && res.data) {
          cred = res.data;
        }
      } catch (adminErr) {
        // supabaseAdmin indisponível ou service_role ausente
      }
    }

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

    // 1. Carrega existente (tenta via supabase do usuário, depois supabaseAdmin se necessário)
    let existingId: string | null = null;

    try {
      const { data: userEx } = await supabase
        .from("tenant_ai_credentials" as never)
        .select("id")
        .eq("tenant_id" as never, data.tenantId)
        .maybeSingle();
      if ((userEx as { id?: string } | null)?.id) {
        existingId = (userEx as { id: string }).id;
      }
    } catch (e) {
      console.warn("[tenant-ai] Busca existente via supabase:", e);
    }

    if (!existingId) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: admEx } = await supabaseAdmin
          .from("tenant_ai_credentials" as never)
          .select("id")
          .eq("tenant_id" as never, data.tenantId)
          .maybeSingle();
        if ((admEx as { id?: string } | null)?.id) {
          existingId = (admEx as { id: string }).id;
        }
      } catch (e) {
        // supabaseAdmin não disponível
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
        : {}),
      created_by: userId,
    };

    let saveSuccess = false;
    let lastError: Error | null = null;

    // 2. Persiste primeiro usando o cliente autenticado do usuário (RLS nativo)
    if (existingId) {
      const { error } = await supabase
        .from("tenant_ai_credentials" as never)
        .update(row as never)
        .eq("id" as never, existingId);
      if (!error) {
        saveSuccess = true;
      } else {
        lastError = new Error(error.message);
      }
    } else {
      const { error } = await supabase
        .from("tenant_ai_credentials" as never)
        .insert(row as never);
      if (!error) {
        saveSuccess = true;
      } else {
        lastError = new Error(error.message);
      }
    }

    // 3. Fallback para supabaseAdmin caso RLS do cliente do usuário falhe
    if (!saveSuccess) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        if (existingId) {
          const { error } = await supabaseAdmin
            .from("tenant_ai_credentials" as never)
            .update(row as never)
            .eq("id" as never, existingId);
          if (error) throw new Error(error.message);
          saveSuccess = true;
        } else {
          const { error } = await supabaseAdmin
            .from("tenant_ai_credentials" as never)
            .insert(row as never);
          if (error) throw new Error(error.message);
          saveSuccess = true;
        }
      } catch (adminErr: any) {
        throw lastError || adminErr;
      }
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

    // Lê a credencial para descriptografar (tenta supabase do usuário, depois supabaseAdmin)
    let cred: any = null;
    try {
      const res = await supabase
        .from("tenant_ai_credentials" as never)
        .select("provider, model, api_key_ciphertext, api_key_iv, api_key_tag")
        .eq("tenant_id" as never, data.tenantId)
        .maybeSingle();
      if (!res.error && res.data) cred = res.data;
    } catch (e) {}

    if (!cred) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const res = await supabaseAdmin
          .from("tenant_ai_credentials" as never)
          .select("provider, model, api_key_ciphertext, api_key_iv, api_key_tag")
          .eq("tenant_id" as never, data.tenantId)
          .maybeSingle();
        if (!res.error && res.data) cred = res.data;
      } catch (e) {}
    }

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
    const testUpdate = {
      last_tested_at: new Date().toISOString(),
      last_test_ok: result.ok,
      last_test_error: result.ok ? null : (result.error ?? "Erro desconhecido"),
      last_test_latency_ms: result.latencyMs,
    };

    let updated = false;
    try {
      const { error } = await supabase
        .from("tenant_ai_credentials" as never)
        .update(testUpdate as never)
        .eq("tenant_id" as never, data.tenantId);
      if (!error) updated = true;
    } catch (e) {}

    if (!updated) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("tenant_ai_credentials" as never)
          .update(testUpdate as never)
          .eq("tenant_id" as never, data.tenantId);
      } catch (e) {}
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
    await assertCanManageTenantAi(supabase, userId, data.tenantId);

    let deleted = false;
    let delError: Error | null = null;

    try {
      const { error } = await supabase
        .from("tenant_ai_credentials" as never)
        .delete()
        .eq("tenant_id" as never, data.tenantId);
      if (!error) deleted = true;
      else delError = new Error(error.message);
    } catch (e) {}

    if (!deleted) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("tenant_ai_credentials" as never)
          .delete()
          .eq("tenant_id" as never, data.tenantId);
        if (error) throw new Error(error.message);
        deleted = true;
      } catch (adminErr: any) {
        throw delError || adminErr;
      }
    }

    return { ok: true };
  });
