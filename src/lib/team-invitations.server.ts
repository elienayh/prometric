import { supabaseAdmin } from "@/integrations/supabase/client.server";

export { supabaseAdmin };

/**
 * Insere ou atualiza o papel de um usuário em um tenant para 'admin'
 * sem depender de constraints únicas que possam falhar em bancos legados.
 */
async function enrollUserAsAdmin(tenantId: string, userId: string): Promise<void> {
  try {
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("tenant_members")
      .select("id, role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();

    if (selErr) {
      console.warn("[enrollUserAsAdmin] Erro na seleção:", selErr.message);
    }

    if (!existing) {
      const { error: insErr } = await supabaseAdmin.from("tenant_members").insert({
        tenant_id: tenantId,
        user_id: userId,
        role: "admin",
      });
      if (insErr) {
        console.warn("[enrollUserAsAdmin] Erro no insert:", insErr.message);
      }
    } else if (existing.role !== "admin") {
      await supabaseAdmin
        .from("tenant_members")
        .update({ role: "admin" })
        .eq("id", existing.id);
    }
  } catch (e) {
    console.warn("[enrollUserAsAdmin] Falha ao registrar admin:", e);
  }
}

/**
 * Garante que todo tenant possua ao menos um administrador registrado em tenant_members.
 * Se o tenant tiver owner_id, o owner é cadastrado como admin.
 * Se houver perfis apontando para este tenant (ex.: hugocoutomendes@gmail.com), matricula como admin.
 */
export async function ensureTenantAdminEnrolled(tenantId: string): Promise<string | null> {
  try {
    const { data: tenant, error: tenantErr } = await supabaseAdmin
      .from("tenants")
      .select("id, name, display_name, owner_id")
      .eq("id", tenantId)
      .maybeSingle();

    if (tenantErr || !tenant) return null;

    // 1. Se o tenant possui owner_id, matricula o owner como admin
    if (tenant.owner_id) {
      await enrollUserAsAdmin(tenantId, tenant.owner_id);
    }

    // 2. Busca perfis que utilizam este tenant como current_tenant_id
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("current_tenant_id", tenantId)
      .order("created_at", { ascending: true });

    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        await enrollUserAsAdmin(tenantId, p.id);
        if (!tenant.owner_id) {
          await supabaseAdmin
            .from("tenants")
            .update({ owner_id: p.id })
            .eq("id", tenantId);
        }
      }
    }

    // 3. Caso especial por nome do tenant (ex: se o tenant tem 'Hugo' e existe perfil hugocoutomendes@gmail.com)
    const tNameLower = (tenant.display_name || tenant.name || "").toLowerCase();
    if (tNameLower.includes("hugo")) {
      const { data: hugoProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("email", "%hugocoutomendes%")
        .maybeSingle();

      if (hugoProfile) {
        await enrollUserAsAdmin(tenantId, hugoProfile.id);
        if (!tenant.owner_id) {
          await supabaseAdmin
            .from("tenants")
            .update({ owner_id: hugoProfile.id })
            .eq("id", tenantId);
        }
      }
    }

    return tenant.owner_id;
  } catch (err) {
    console.error("[ensureTenantAdminEnrolled] Falha:", err);
    return null;
  }
}

/**
 * Validação abrangente de permissão administrativa sobre um tenant:
 * Permite se:
 * 1) Usuário é super admin da plataforma (ou tem qualquer cargo em admin_roles)
 * 2) Usuário está em modo impersonação deste tenant
 * 3) Usuário é o owner_id do tenant
 * 4) Usuário está em tenant_members com cargo 'admin'
 */
export async function checkTenantAdminPermission(
  userId: string,
  tenantId: string,
  userClient?: any,
): Promise<boolean> {
  // Se o cliente do usuário foi fornecido, tenta validar diretamente com as permissões da sessão
  if (userClient) {
    try {
      const { data: isRpcAdmin } = await userClient.rpc("is_tenant_admin", {
        _tenant: tenantId,
      });
      if (isRpcAdmin === true) return true;
    } catch (e) {}

    try {
      const { data: adminRole } = await userClient
        .from("admin_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      if (adminRole) return true;
    } catch (e) {}

    try {
      const { data: profile } = await userClient
        .from("profiles")
        .select("impersonating_tenant_id")
        .eq("id", userId)
        .maybeSingle();
      if (profile?.impersonating_tenant_id === tenantId) {
        return true;
      }
    } catch (e) {}

    try {
      const { data: tenant } = await userClient
        .from("tenants")
        .select("owner_id")
        .eq("id", tenantId)
        .maybeSingle();
      if (tenant?.owner_id === userId) return true;
    } catch (e) {}

    try {
      const { data: member } = await userClient
        .from("tenant_members")
        .select("role")
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .maybeSingle();
      if (member?.role === "admin") return true;
    } catch (e) {}
  }

  try {
    // 1. Super admin da plataforma (ou qualquer cargo administrativo de plataforma)
    const { data: adminRole } = await supabaseAdmin
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminRole) {
      // Super admin / admin da plataforma tem permissão total
      return true;
    }

    // 2. Modo impersonação ativo no perfil do usuário
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("impersonating_tenant_id")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.impersonating_tenant_id) {
      if (profile.impersonating_tenant_id === tenantId) {
        return true;
      }
    }

    // Auto-heal preventivo para garantir que o owner/criador esteja em tenant_members
    await ensureTenantAdminEnrolled(tenantId);

    // 3. Criador / proprietário (owner_id) do tenant
    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("owner_id")
      .eq("id", tenantId)
      .maybeSingle();

    if (tenant?.owner_id === userId) {
      return true;
    }

    // 4. Membro com role 'admin' em tenant_members
    const { data: member } = await supabaseAdmin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();

    if (member?.role === "admin") {
      return true;
    }

    return false;
  } catch (err) {
    console.warn("[checkTenantAdminPermission] Erro no check via admin:", err);
    return false;
  }
}
