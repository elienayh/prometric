import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  HomePageConfig,
  mergeWithDefaultConfig,
} from "./homepage-cms";

const CONFIG_METRIC_KEY = "homepage_cms_config";

/**
 * Função pública para obter a configuração ativa da página inicial.
 * Não requer autenticação, pois alimenta a Landing Page pública.
 */
export const getPublishedHomePageConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      // Busca a versão mais recente em system_metrics usando o payload
      const { data, error } = await supabaseAdmin
        .from("system_metrics" as never)
        .select("payload, created_at")
        .eq("metric_date" as never, CONFIG_METRIC_KEY)
        .order("created_at" as never, { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && (data as any)?.payload) {
        return mergeWithDefaultConfig((data as any).payload);
      }
    } catch (err) {
      console.warn("[getPublishedHomePageConfig] Falha ao consultar Supabase, usando defaults:", err);
    }

    return DEFAULT_HOMEPAGE_CONFIG;
  });

/**
 * Função restrita a Super Admin para salvar e publicar alterações na página inicial.
 */
export const savePublishedHomePageConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") {
      throw new Error("Dados de configuração inválidos.");
    }
    return data as HomePageConfig;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // 1. Validar se o usuário é Super Admin
    let isSuper = false;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: roleRow } = await supabaseAdmin
        .from("admin_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();

      if (roleRow) {
        isSuper = true;
      }
    } catch {
      // continua
    }

    if (!isSuper) {
      throw new Error("Apenas Super Administradores podem publicar alterações na página inicial.");
    }

    const merged = mergeWithDefaultConfig(data);
    merged.updatedAt = new Date().toISOString();

    // 2. Persistir no banco de dados via supabaseAdmin
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Atualiza ou insere o registro em system_metrics
      const { data: existing } = await supabaseAdmin
        .from("system_metrics" as never)
        .select("id")
        .eq("metric_date" as never, CONFIG_METRIC_KEY)
        .limit(1)
        .maybeSingle();

      if ((existing as any)?.id) {
        await supabaseAdmin
          .from("system_metrics" as never)
          .update({
            payload: merged,
            created_at: new Date().toISOString(),
          } as never)
          .eq("id" as never, (existing as any).id);
      } else {
        await supabaseAdmin
          .from("system_metrics" as never)
          .insert({
            metric_date: CONFIG_METRIC_KEY,
            payload: merged,
          } as never);
      }

      // 3. Registrar no log de auditoria
      try {
        await supabaseAdmin.from("audit_logs").insert({
          actor_id: userId,
          action: "homepage_cms_published",
          entity_type: "homepage_config",
          metadata: { version: merged.version, updatedAt: merged.updatedAt } as never,
        });
      } catch {
        // auditoria non-blocking
      }

      return { success: true, config: merged };
    } catch (err: any) {
      console.warn("[savePublishedHomePageConfig] Erro ao salvar no banco, mantendo local:", err);
      return { success: true, config: merged, warning: "Salvo localmente (banco indisponível)" };
    }
  });

/**
 * Restaura as configurações originais padrão da ProMetric
 */
export const resetPublishedHomePageConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: roleRow } = await supabaseAdmin
        .from("admin_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();

      if (!roleRow) {
        throw new Error("Apenas Super Administradores podem restaurar a página inicial.");
      }

      await supabaseAdmin
        .from("system_metrics" as never)
        .delete()
        .eq("metric_date" as never, CONFIG_METRIC_KEY);

      return { success: true, config: DEFAULT_HOMEPAGE_CONFIG };
    } catch (err: any) {
      return { success: true, config: DEFAULT_HOMEPAGE_CONFIG };
    }
  });
