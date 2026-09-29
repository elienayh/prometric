import { supabaseAdmin } from "@/integrations/supabase/client.server";

export { supabaseAdmin };

/**
 * Garante que todo tenant possua ao menos um administrador registrado em tenant_members.
 * Se o tenant tiver owner_id, o owner é cadastrado como admin.
 * Se ainda não houver admin, busca o perfil que utiliza o tenant e o promove a admin.
 */
export async function ensureTenantAdminEnrolled(tenantId: string, userClient?: any): Promise<string | null> {
  try {
    const client = userClient ?? supabaseAdmin;
    let tenant: any = null;
    const { data: cTenant } = await client
      .from("tenants")
      .select("id, name, display_name, owner_id")
      .eq("id", tenantId)
      .maybeSingle();

    if (cTenant) {
      tenant = cTenant;
    } else {
      const { data: aTenant } = await supabaseAdmin
        .from("tenants")
        .select("id, name, display_name, owner_id")
        .eq("id", tenantId)
        .maybeSingle();
      if (aTenant) tenant = aTenant;
    }

    if (!tenant) return null;

    // 1. Se o tenant possui owner_id, garante que ele está em tenant_members como 'admin'
    if (tenant.owner_id) {
      await supabaseAdmin.from("tenant_members").upsert(
        {
          tenant_id: tenantId,
          user_id: tenant.owner_id,
          role: "admin",
        },
        { onConflict: "tenant_id,user_id" }
      );
      return tenant.owner_id;
    }

    // 2. Verificar se já existe algum admin em tenant_members
    const { data: existingAdmin } = await supabaseAdmin
      .from("tenant_members")
      .select("user_id")
      .eq("tenant_id", tenantId)
      .eq("role", "admin")
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      if (!tenant.owner_id) {
        await supabaseAdmin
          .from("tenants")
          .update({ owner_id: existingAdmin[0].user_id })
          .eq("id", tenantId);
      }
      return existingAdmin[0].user_id;
    }

    // 3. Procura primeiro perfil cujo current_tenant_id é este tenant
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("current_tenant_id", tenantId)
      .order("created_at", { ascending: true })
      .limit(1);

    if (profiles && profiles.length > 0) {
      const firstUser = profiles[0];
      await supabaseAdmin.from("tenant_members").upsert(
        {
          tenant_id: tenantId,
          user_id: firstUser.id,
          role: "admin",
        },
        { onConflict: "tenant_id,user_id" }
      );
      await supabaseAdmin
        .from("tenants")
        .update({ owner_id: firstUser.id })
        .eq("id", tenantId);
      return firstUser.id;
    }

    // 4. Procura por nome do tenant (ex: se tenant.name for "Prof Hugo", procura perfil com "Hugo")
    const cleanName = (tenant.name || "").replace(/^(Prof\.?|Professor|Professora)\s+/i, "").trim();
    if (cleanName.length >= 3) {
      const { data: matchedProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .or(`full_name.ilike.%${cleanName}%,email.ilike.%${cleanName}%`)
        .limit(1);

      if (matchedProfiles && matchedProfiles.length > 0) {
        const found = matchedProfiles[0];
        await supabaseAdmin.from("tenant_members").upsert(
          {
            tenant_id: tenantId,
            user_id: found.id,
            role: "admin",
          },
          { onConflict: "tenant_id,user_id" }
        );
        await supabaseAdmin
          .from("tenants")
          .update({ owner_id: found.id })
          .eq("id", tenantId);
        return found.id;
      }
    }

    // 5. Procura por avaliador de turmas/avaliações deste tenant
    const { data: evalRecord } = await supabaseAdmin
      .from("evaluations")
      .select("evaluator_id")
      .eq("tenant_id", tenantId)
      .not("evaluator_id", "is", null)
      .limit(1);

    if (evalRecord && evalRecord.length > 0 && evalRecord[0].evaluator_id) {
      const foundId = evalRecord[0].evaluator_id;
      await supabaseAdmin.from("tenant_members").upsert(
        {
          tenant_id: tenantId,
          user_id: foundId,
          role: "admin",
        },
        { onConflict: "tenant_id,user_id" }
      );
      await supabaseAdmin.from("tenants").update({ owner_id: foundId }).eq("id", tenantId);
      return foundId;
    }

    return null;
  } catch (err) {
    console.warn("[ensureTenantAdminEnrolled] Aviso ao verificar admin:", err);
    return null;
  }
}

/**
 * Validação rigorosa e flexível de permissão administrativa sobre um tenant:
 * Permite se for:
 * 1) RPC is_tenant_admin no banco (quando executando no contexto do usuário)
 * 2) Membro com cargo 'admin' em tenant_members
 * 3) Owner_id do tenant
 * 4) Super admin da plataforma (admin_roles)
 * 5) Administrador em modo impersonação deste tenant (profiles.impersonating_tenant_id)
 */
export async function checkTenantAdminPermission(
  userId: string,
  tenantId: string,
  userClient?: any
): Promise<boolean> {
  if (!userId || !tenantId) return false;

  // 1. Tenta primeiro executar a função SQL public.is_tenant_admin como verificação principal
  // Executa com o cliente do usuário quando disponível (ou fallback para supabaseAdmin)
  try {
    const caller = userClient ?? supabaseAdmin;
    const { data: isAdmin, error: rpcErr } = await caller.rpc("is_tenant_admin" as never, {
      _tenant: tenantId,
    } as never);
    if (!rpcErr && isAdmin === true) {
      return true;
    }
  } catch (rpcErr) {
    // Se falhar ou se executado a partir do service role (onde auth.uid() é nulo),
    // prossegue para os fallbacks
    console.warn("[checkTenantAdminPermission] RPC is_tenant_admin fallback:", rpcErr);
  }

  // 2. Fallbacks a partir do service role para tenants legados
  const [memberRes, tenantRes, adminRoleRes, profileRes] = await Promise.all([
    supabaseAdmin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabaseAdmin
      .from("tenants")
      .select("owner_id")
      .eq("id", tenantId)
      .maybeSingle(),
    supabaseAdmin
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle(),
    supabaseAdmin
      .from("profiles")
      .select("impersonating_tenant_id")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  if (memberRes.data?.role === "admin") return true;
  if (tenantRes.data?.owner_id === userId) return true;
  if (adminRoleRes.data) return true;
  if (profileRes.data?.impersonating_tenant_id === tenantId) return true;

  // 3. Fallback preventivo caso o tenant seja legado e não possua admin cadastrado
  const autoEnrolledId = await ensureTenantAdminEnrolled(tenantId, caller);
  if (autoEnrolledId === userId) return true;

  return false;
}
