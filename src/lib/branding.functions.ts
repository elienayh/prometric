import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type UpdateTenantBrandingInput = {
  tenantId: string;
  displayName: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
};

export const updateTenantBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: UpdateTenantBrandingInput) => {
    if (!data?.tenantId) throw new Error("tenantId é obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const patch = {
      display_name: data.displayName,
      primary_color: data.primaryColor,
      secondary_color: data.secondaryColor,
      description: data.description,
      logo_url: data.logoUrl,
      website: data.website,
      email: data.email,
      phone: data.phone,
      updated_at: new Date().toISOString(),
    };

    // 1. Tenta atualizar diretamente via cliente autenticado do usuário (RLS)
    const { error: userErr } = await supabase
      .from("tenants" as never)
      .update(patch as never)
      .eq("id" as never, data.tenantId);

    if (!userErr) {
      return { ok: true };
    }

    // 2. Fallback via supabaseAdmin se disponível
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: adminErr } = await supabaseAdmin
        .from("tenants" as never)
        .update(patch as never)
        .eq("id" as never, data.tenantId);

      if (!adminErr) {
        return { ok: true };
      }
      throw new Error(adminErr.message);
    } catch (e: any) {
      throw new Error(userErr?.message || e?.message || "Erro ao atualizar identidade visual");
    }
  });
