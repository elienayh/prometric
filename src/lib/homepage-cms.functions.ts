import { createServerFn } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SUPER_ADMIN_EMAILS } from "@/hooks/use-admin";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  HomePageConfig,
  mergeWithDefaultConfig,
} from "./homepage-cms";

const CONFIG_METRIC_DATE = "1970-01-01";

/**
 * Função pública para obter a configuração ativa da página inicial.
 * Não requer autenticação, pois alimenta a Landing Page pública.
 */
export const getPublishedHomePageConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      // Busca a versão mais recente em system_metrics usando o payload com data sentinela
      const { data, error } = await supabaseAdmin
        .from("system_metrics" as never)
        .select("payload, created_at")
        .eq("metric_date" as never, CONFIG_METRIC_DATE)
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
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") {
      throw new Error("Dados de configuração inválidos.");
    }
    return data as HomePageConfig;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // 1. Validar se o usuário é Super Admin (por tabela ou email oficial de proprietário)
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
      } else {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const email = userData?.user?.email?.toLowerCase();
        if (email && SUPER_ADMIN_EMAILS.includes(email)) {
          isSuper = true;
          await supabaseAdmin.from("admin_roles").upsert(
            { user_id: userId, role: "super_admin" as never },
            { onConflict: "user_id,role" }
          );
        }
      }
    } catch (e) {
      console.warn("[savePublishedHomePageConfig] Verificação de super_admin:", e);
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
      const { data: existing, error: findError } = await supabaseAdmin
        .from("system_metrics" as never)
        .select("id")
        .eq("metric_date" as never, CONFIG_METRIC_DATE)
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error("[savePublishedHomePageConfig] Erro ao buscar registro existente:", findError);
        throw new Error(`Falha ao acessar banco de dados: ${findError.message}`);
      }

      if ((existing as any)?.id) {
        const { error: updateError } = await supabaseAdmin
          .from("system_metrics" as never)
          .update({
            payload: merged,
            created_at: new Date().toISOString(),
          } as never)
          .eq("id" as never, (existing as any).id);

        if (updateError) {
          console.error("[savePublishedHomePageConfig] Erro ao atualizar no banco:", updateError);
          throw new Error(`Falha ao atualizar página inicial no banco: ${updateError.message}`);
        }
      } else {
        const { error: insertError } = await supabaseAdmin
          .from("system_metrics" as never)
          .insert({
            metric_date: CONFIG_METRIC_DATE,
            payload: merged,
          } as never);

        if (insertError) {
          console.error("[savePublishedHomePageConfig] Erro ao inserir no banco:", insertError);
          throw new Error(`Falha ao inserir página inicial no banco: ${insertError.message}`);
        }
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
      console.error("[savePublishedHomePageConfig] Falha crítica ao salvar no banco:", err);
      throw new Error(err?.message || "Erro desconhecido ao salvar página inicial no banco.");
    }
  });

/**
 * Restaura as configurações originais padrão da ProMetric
 */
export const resetPublishedHomePageConfig = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      let isSuper = false;
      const { data: roleRow } = await supabaseAdmin
        .from("admin_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();

      if (roleRow) {
        isSuper = true;
      } else {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const email = userData?.user?.email?.toLowerCase();
        if (email && SUPER_ADMIN_EMAILS.includes(email)) {
          isSuper = true;
        }
      }

      if (!isSuper) {
        throw new Error("Apenas Super Administradores podem restaurar a página inicial.");
      }

      const { error: delError } = await supabaseAdmin
        .from("system_metrics" as never)
        .delete()
        .eq("metric_date" as never, CONFIG_METRIC_DATE);

      if (delError) {
        console.error("[resetPublishedHomePageConfig] Erro ao deletar do banco:", delError);
        throw new Error(`Falha ao restaurar padrão no banco: ${delError.message}`);
      }

      return { success: true, config: DEFAULT_HOMEPAGE_CONFIG };
    } catch (err: any) {
      console.error("[resetPublishedHomePageConfig] Erro ao restaurar:", err);
      throw new Error(err?.message || "Erro ao restaurar configurações no banco.");
    }
  });
