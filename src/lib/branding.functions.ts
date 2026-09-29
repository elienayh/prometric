import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UpdateTenantBrandingInput = z.object({
  tenantId: z.string().uuid(),
  displayName: z.string().trim().nullable().optional(),
  primaryColor: z.string().trim().nullable().optional(),
  secondaryColor: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  logoUrl: z.string().trim().nullable().optional(),
  website: z.string().trim().nullable().optional(),
  email: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
});

export const updateTenantBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateTenantBrandingInput.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { tenantId, ...fields } = data;
    const { supabaseAdmin, checkTenantAdminPermission } = await import("./team-invitations.server");

    // Valida se o usuário autenticado é admin, owner ou está impersonando o tenant
    const canAdmin = await checkTenantAdminPermission(userId, tenantId, context.supabase);
    if (!canAdmin) {
      throw new Error("Você não tem permissão de administrador para salvar as configurações desta escola/organização.");
    }

    const patch: Record<string, unknown> = {};
    if (fields.displayName !== undefined) patch.display_name = fields.displayName || null;
    if (fields.primaryColor !== undefined) patch.primary_color = fields.primaryColor || null;
    if (fields.secondaryColor !== undefined) patch.secondary_color = fields.secondaryColor || null;
    if (fields.description !== undefined) patch.description = fields.description || null;
    if (fields.logoUrl !== undefined) patch.logo_url = fields.logoUrl || null;
    if (fields.website !== undefined) patch.website = fields.website || null;
    if (fields.email !== undefined) patch.email = fields.email || null;
    if (fields.phone !== undefined) patch.phone = fields.phone || null;

    const { error } = await supabaseAdmin
      .from("tenants")
      .update(patch)
      .eq("id", tenantId);

    if (error) {
      console.error("[updateTenantBranding] Erro ao atualizar identidade do tenant:", error);
      throw new Error(`Falha ao salvar identidade: ${error.message}`);
    }

    return { success: true };
  });
