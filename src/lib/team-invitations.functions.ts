import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InviteInput = z.object({
  tenantId: z.string().uuid(),
  fullName: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().trim().max(30).optional().nullable(),
  role: z.enum(["admin", "evaluator", "viewer"]),
  origin: z.string().url().optional(),
});

export type InviteResult = {
  success: boolean;
  token: string;
  inviteLink: string;
  emailSent: boolean;
  isExistingUser: boolean;
  message: string;
};

export const createTeamInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InviteInput.parse(d))
  .handler(async ({ data, context }): Promise<InviteResult> => {
    const { userId, supabase: userClient } = context;
    const { tenantId, fullName, email, phone, role, origin } = data;
    const cleanEmail = email.toLowerCase().trim();

    const { supabaseAdmin, checkTenantAdminPermission } = await import("./team-invitations.server");

    // 1. Validar permissão administrativa
    const canAdmin = await checkTenantAdminPermission(userId, tenantId, userClient);
    if (!canAdmin) {
      throw new Error("Você não tem permissão de administrador para convidar membros nesta escola/organização.");
    }

    const baseUrl = origin ? origin.replace(/\/$/, "") : "https://prometric.app";

    // 2. Tenta gerar via RPC SECURITY DEFINER (mais rápido, sem barreiras de RLS)
    try {
      const { data: rpcRes, error: rpcErr } = await userClient.rpc("create_team_invitation" as never, {
        _tenant: tenantId,
        _email: cleanEmail,
        _role: role,
        _full_name: fullName,
        _phone: phone || null,
      } as never);

      if (!rpcErr && Array.isArray(rpcRes) && rpcRes.length > 0) {
        const row = rpcRes[0] as any;
        const inviteLink = `${baseUrl}/invite/${row.token}`;
        if (row.is_existing_user) {
          return {
            success: true,
            token: row.token,
            inviteLink,
            emailSent: false,
            isExistingUser: true,
            message: `${fullName} (${cleanEmail}) já possui conta no ProMetric e foi vinculado(a) diretamente à sua equipe como ${role === "admin" ? "Administrador(a)" : "Avaliador(a)"}.`,
          };
        }
        return {
          success: true,
          token: row.token,
          inviteLink,
          emailSent: false,
          isExistingUser: false,
          message: `Convite gerado com sucesso para ${fullName} (${cleanEmail})! Envie o link de acesso exclusivo.`,
        };
      }
    } catch (rpcErr) {
      console.warn("[createTeamInvite] create_team_invitation RPC fallback:", rpcErr);
    }

    // 3. Fallback: Buscar dados da organização (tentando com userClient primeiro, depois supabaseAdmin)
    let tenant: { id: string; name: string; display_name: string | null } | null = null;
    const { data: clientTenant } = await userClient
      .from("tenants")
      .select("id, name, display_name")
      .eq("id", tenantId)
      .maybeSingle();

    if (clientTenant) {
      tenant = clientTenant;
    } else {
      const { data: adminTenant } = await supabaseAdmin
        .from("tenants")
        .select("id, name, display_name")
        .eq("id", tenantId)
        .maybeSingle();
      if (adminTenant) {
        tenant = adminTenant;
      }
    }

    if (!tenant) {
      throw new Error("Escola ou organização não encontrada.");
    }

    // 4. Gerar token seguro para o link de convite
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const inviteLink = `${baseUrl}/invite/${token}`;

    // 5. Salvar/atualizar em team_contacts
    const activeClient = userClient ?? supabaseAdmin;
    try {
      await activeClient
        .from("team_contacts")
        .upsert(
          {
            tenant_id: tenantId,
            full_name: fullName,
            email: cleanEmail,
            phone: phone || null,
            role,
          },
          { onConflict: "tenant_id,email" }
        );
    } catch {
      // Ignora erro se faltar constraint única ou tabela opcional
    }

    // 6. Verificar se já existe perfil cadastrado com esse e-mail
    const { data: existingProfile } = await activeClient
      .from("profiles")
      .select("id, full_name, email, current_tenant_id")
      .ilike("email", cleanEmail)
      .maybeSingle();

    let emailSent = false;
    let isExistingUser = false;

    if (existingProfile) {
      isExistingUser = true;
      // Usuário já possui conta no sistema! Vincular diretamente ao tenant_members
      const { error: memberErr } = await activeClient
        .from("tenant_members")
        .upsert(
          {
            tenant_id: tenantId,
            user_id: existingProfile.id,
            role,
            phone: phone || null,
          },
          { onConflict: "tenant_id,user_id" }
        );

      if (memberErr) {
        await supabaseAdmin
          .from("tenant_members")
          .upsert(
            {
              tenant_id: tenantId,
              user_id: existingProfile.id,
              role,
              phone: phone || null,
            },
            { onConflict: "tenant_id,user_id" }
          );
      }

      // Atualiza o current_tenant_id do usuário caso não tenha nenhum
      if (!existingProfile.current_tenant_id) {
        try {
          await activeClient
            .from("profiles")
            .update({ current_tenant_id: tenantId })
            .eq("id", existingProfile.id);
        } catch {
          // Ignora se não puder atualizar perfil
        }
      }

      // Registrar convite já aceito para rastreabilidade
      try {
        const { error: insErr } = await activeClient.from("tenant_invitations").insert({
          tenant_id: tenantId,
          email: cleanEmail,
          role,
          token,
          invited_by: userId,
          status: "accepted",
          accepted_at: new Date().toISOString(),
          accepted_by: existingProfile.id,
        });
        if (insErr) throw insErr;
      } catch {
        try {
          await supabaseAdmin.from("tenant_invitations").insert({
            tenant_id: tenantId,
            email: cleanEmail,
            role,
            token,
            invited_by: userId,
            status: "accepted",
            accepted_at: new Date().toISOString(),
            accepted_by: existingProfile.id,
          });
        } catch {
          // Ignora erro secundário de log
        }
      }

      return {
        success: true,
        token,
        inviteLink,
        emailSent: false,
        isExistingUser: true,
        message: `${fullName} (${cleanEmail}) já possui conta no ProMetric e foi vinculado(a) diretamente à sua equipe como ${role === "admin" ? "Administrador(a)" : "Avaliador(a)"}.`,
      };
    }

    // 7. Usuário novo: Criar convite pendente em tenant_invitations
    const { error: invErr } = await activeClient.from("tenant_invitations").insert({
      tenant_id: tenantId,
      email: cleanEmail,
      role,
      token,
      invited_by: userId,
      status: "pending",
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (invErr) {
      const { error: adminInvErr } = await supabaseAdmin.from("tenant_invitations").insert({
        tenant_id: tenantId,
        email: cleanEmail,
        role,
        token,
        invited_by: userId,
        status: "pending",
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (adminInvErr) {
        throw new Error(`Erro ao gerar convite: ${adminInvErr.message}`);
      }
    }

    // 7. Enviar e-mail de convite oficial pelo Supabase Auth
    try {
      const { error: authInviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
        data: {
          full_name: fullName,
          tenant_id: tenantId,
          invited_role: role,
          tenant_name: tenantName,
        },
        redirectTo: inviteLink,
      });

      if (!authInviteErr) {
        emailSent = true;
      } else {
        console.warn("[TeamInvite] Supabase inviteUserByEmail aviso:", authInviteErr.message);
        // Se o usuário já estava registrado no Auth do Supabase:
        if (
          authInviteErr.message?.toLowerCase().includes("already") ||
          authInviteErr.message?.toLowerCase().includes("registered") ||
          (authInviteErr as any).status === 422
        ) {
          try {
            const { data: userListData } = await supabaseAdmin.auth.admin.listUsers();
            const matchedUser = userListData?.users?.find(
              (u) => u.email?.toLowerCase().trim() === cleanEmail
            );
            if (matchedUser) {
              await supabaseAdmin.from("tenant_members").upsert(
                {
                  tenant_id: tenantId,
                  user_id: matchedUser.id,
                  role,
                  phone: phone || null,
                },
                { onConflict: "tenant_id,user_id" }
              );
              await supabaseAdmin
                .from("profiles")
                .upsert(
                  { id: matchedUser.id, current_tenant_id: tenantId },
                  { onConflict: "id" }
                );
              await supabaseAdmin
                .from("tenant_invitations")
                .update({
                  status: "accepted",
                  accepted_at: new Date().toISOString(),
                  accepted_by: matchedUser.id,
                })
                .eq("token", token);

              return {
                success: true,
                token,
                inviteLink,
                emailSent: false,
                isExistingUser: true,
                message: `${fullName} (${cleanEmail}) já possui conta no ProMetric e foi vinculado(a) à sua equipe como ${role === "admin" ? "Administrador(a)" : "Avaliador(a)"}.`,
              };
            }
          } catch (recoveryErr) {
            console.warn("[TeamInvite] Falha no fallback de usuário existente:", recoveryErr);
          }
        }
      }
    } catch (mailErr) {
      console.warn("[TeamInvite] Falha ao despachar e-mail via auth admin:", mailErr);
    }

    return {
      success: true,
      token,
      inviteLink,
      emailSent,
      isExistingUser: false,
      message: emailSent
        ? `Convite enviado por e-mail para ${cleanEmail}. Ao entrar na plataforma, a pessoa entrará diretamente em ${tenantName}.`
        : `Convite criado com sucesso para ${cleanEmail}. Copie o link abaixo para compartilhar diretamente.`,
    };
  });

export type InviteDetails = {
  found: boolean;
  message?: string;
  id?: string;
  tenantId?: string;
  email?: string;
  role?: "admin" | "evaluator" | "viewer";
  status?: string;
  isExpired?: boolean;
  isAccepted?: boolean;
  expiresAt?: string;
  tenant?: {
    id: string;
    name: string;
    displayName: string | null;
    logoUrl: string | null;
    type: string;
  };
};

export const getInviteDetails = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token: z.string().min(8) }).parse(d))
  .handler(async ({ data }): Promise<InviteDetails> => {
    const { token } = data;
    const { supabaseAdmin } = await import("./team-invitations.server");

    const { data: inv, error: invErr } = await supabaseAdmin
      .from("tenant_invitations")
      .select("id, tenant_id, email, role, status, expires_at, created_at")
      .eq("token", token)
      .maybeSingle();

    if (invErr || !inv) {
      return { found: false, message: "Convite não encontrado ou link inválido." };
    }

    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("id, name, display_name, logo_url, type")
      .eq("id", inv.tenant_id)
      .maybeSingle();

    const isExpired = new Date(inv.expires_at).getTime() < Date.now();
    const isAccepted = inv.status === "accepted";

    return {
      found: true,
      id: inv.id,
      tenantId: inv.tenant_id,
      email: inv.email,
      role: inv.role as "admin" | "evaluator" | "viewer",
      status: inv.status,
      isExpired,
      isAccepted,
      expiresAt: inv.expires_at,
      tenant: tenant
        ? {
            id: tenant.id,
            name: tenant.name,
            displayName: tenant.display_name,
            logoUrl: tenant.logo_url,
            type: tenant.type,
          }
        : undefined,
    };
  });

export const acceptTeamInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ token: z.string().min(8) }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { token } = data;
    const { supabaseAdmin } = await import("./team-invitations.server");

    // 1. Buscar convite no banco com bypass de RLS
    const { data: inv, error: invErr } = await supabaseAdmin
      .from("tenant_invitations")
      .select("id, tenant_id, email, role, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (invErr || !inv) {
      throw new Error("Convite não encontrado ou link inválido.");
    }

    if (inv.status === "accepted") {
      // Verificar se o usuário já é membro deste tenant
      const { data: existingMember } = await supabaseAdmin
        .from("tenant_members")
        .select("role")
        .eq("tenant_id", inv.tenant_id)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingMember) {
        // Garantir que o current_tenant_id seja atualizado
        await supabaseAdmin
          .from("profiles")
          .update({ current_tenant_id: inv.tenant_id })
          .eq("id", userId);

        return {
          success: true,
          alreadyMember: true,
          tenantId: inv.tenant_id,
          message: "Você já faz parte desta equipe. Redirecionando...",
        };
      }
      throw new Error("Este convite já foi utilizado.");
    }

    if (inv.status === "revoked") {
      throw new Error("Este convite foi revogado pelo administrador.");
    }

    const isExpired = new Date(inv.expires_at).getTime() < Date.now();
    if (isExpired) {
      await supabaseAdmin.from("tenant_invitations").update({ status: "revoked" }).eq("id", inv.id);
      throw new Error("Este convite expirou. Solicite um novo ao administrador.");
    }

    // 2. Vincular o usuário autenticado à tabela tenant_members
    const { error: memberErr } = await supabaseAdmin
      .from("tenant_members")
      .upsert(
        {
          tenant_id: inv.tenant_id,
          user_id: userId,
          role: inv.role,
        },
        { onConflict: "tenant_id,user_id" }
      );

    if (memberErr) {
      console.error("[AcceptInvite] Erro ao criar membro:", memberErr);
      throw new Error(`Falha ao vincular usuário à organização: ${memberErr.message}`);
    }

    // 3. Atualizar convite para aceito
    await supabaseAdmin
      .from("tenant_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by: userId,
      })
      .eq("id", inv.id);

    // 4. Definir este tenant como current_tenant_id no profile do usuário
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, current_tenant_id: inv.tenant_id }, { onConflict: "id" });

    // 5. Buscar dados do tenant para mensagem amigável
    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("name, display_name")
      .eq("id", inv.tenant_id)
      .maybeSingle();

    const tenantName = tenant?.display_name || tenant?.name || "a organização";

    return {
      success: true,
      tenantId: inv.tenant_id,
      tenantName,
      role: inv.role,
      message: `Bem-vindo(a)! Você agora faz parte de ${tenantName}.`,
    };
  });

export const claimPendingInvitesForUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("./team-invitations.server");

    // Buscar perfil do usuário para saber o e-mail cadastrado
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, current_tenant_id")
      .eq("id", userId)
      .maybeSingle();

    let cleanEmail = profile?.email?.toLowerCase().trim();

    if (!cleanEmail) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      cleanEmail = authUser.user?.email?.toLowerCase().trim();
    }

    if (!cleanEmail) {
      return { claimedCount: 0, tenantIds: [] };
    }

    // Buscar convites pendentes e não expirados para esse e-mail
    const { data: pendingInvites } = await supabaseAdmin
      .from("tenant_invitations")
      .select("id, tenant_id, role, expires_at")
      .ilike("email", cleanEmail)
      .eq("status", "pending");

    if (!pendingInvites || pendingInvites.length === 0) {
      return { claimedCount: 0, tenantIds: [] };
    }

    const claimedTenantIds: string[] = [];
    const now = Date.now();

    for (const inv of pendingInvites) {
      if (new Date(inv.expires_at).getTime() < now) {
        continue;
      }

      await supabaseAdmin.from("tenant_members").upsert(
        {
          tenant_id: inv.tenant_id,
          user_id: userId,
          role: inv.role,
        },
        { onConflict: "tenant_id,user_id" }
      );

      await supabaseAdmin
        .from("tenant_invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          accepted_by: userId,
        })
        .eq("id", inv.id);

      claimedTenantIds.push(inv.tenant_id);
    }

    if (claimedTenantIds.length > 0 && !profile?.current_tenant_id) {
      await supabaseAdmin
        .from("profiles")
        .upsert(
          { id: userId, current_tenant_id: claimedTenantIds[0] },
          { onConflict: "id" }
        );
    }

    return {
      claimedCount: claimedTenantIds.length,
      tenantIds: claimedTenantIds,
    };
  });

export type TeamMemberInfo = {
  userId: string;
  role: "admin" | "evaluator" | "viewer";
  createdAt: string;
  phone: string | null;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  isSelf: boolean;
};

export type PendingInviteInfo = {
  id: string;
  tenantId: string;
  email: string;
  role: "admin" | "evaluator" | "viewer";
  token: string;
  inviteLink: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
};

export const listTeamMembersAndInvites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ tenantId: z.string().uuid(), origin: z.string().url().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase: userClient, claims } = context;
    const { tenantId, origin } = data;
    const { supabaseAdmin, checkTenantAdminPermission, ensureTenantAdminEnrolled } = await import("./team-invitations.server");

    const baseUrl = origin ? origin.replace(/\/$/, "") : "https://prometric.app";
    const now = Date.now();

    // 1. Tenta primeiro a RPC get_tenant_team (SECURITY DEFINER, já traz nomes/emails integrados)
    try {
      const { data: teamRpcData, error: rpcErr } = await userClient.rpc("get_tenant_team" as never, {
        _tenant: tenantId,
      } as never);

      if (!rpcErr && Array.isArray(teamRpcData) && teamRpcData.length > 0) {
        const canAdmin = await checkTenantAdminPermission(userId, tenantId, userClient);

        // Busca convites pendentes
        const { data: invitesData } = await userClient
          .from("tenant_invitations")
          .select("id, tenant_id, email, role, token, status, expires_at, created_at")
          .eq("tenant_id", tenantId)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        const members: TeamMemberInfo[] = (teamRpcData as any[]).map((m) => {
          const isSelf = m.user_id === userId;
          const claimsEmail = (claims as any)?.email;
          const claimsName = (claims as any)?.user_metadata?.full_name || (claims as any)?.user_metadata?.name;

          return {
            userId: m.user_id,
            role: m.role as "admin" | "evaluator" | "viewer",
            createdAt: m.created_at,
            phone: m.phone,
            fullName:
              m.full_name && m.full_name !== "Membro da equipe"
                ? m.full_name
                : isSelf && claimsName
                ? claimsName
                : m.tenant_display_name || m.tenant_name || "Membro da equipe",
            email: m.email || (isSelf && claimsEmail ? claimsEmail : null),
            avatarUrl: m.avatar_url || null,
            isSelf,
          };
        });

        const invites: PendingInviteInfo[] = (invitesData || []).map((inv: any) => ({
          id: inv.id,
          tenantId: inv.tenant_id,
          email: inv.email,
          role: inv.role as "admin" | "evaluator" | "viewer",
          token: inv.token,
          inviteLink: `${baseUrl}/invite/${inv.token}`,
          status: inv.status,
          createdAt: inv.created_at,
          expiresAt: inv.expires_at,
          isExpired: new Date(inv.expires_at).getTime() < now,
        }));

        return {
          members,
          invites,
          canAdmin: !!canAdmin,
        };
      }
    } catch (rpcErr) {
      console.warn("[listTeamMembersAndInvites] get_tenant_team RPC fallback:", rpcErr);
    }

    // 2. Fallback resiliente: Busca paralela usando userClient com fallback para supabaseAdmin
    const [tenantRes, membersRes, invitesRes, canAdmin] = await Promise.all([
      userClient
        .from("tenants")
        .select("id, name, display_name, owner_id, created_at")
        .eq("id", tenantId)
        .maybeSingle()
        .then(async (res) => {
          if (res.data) return res;
          return await supabaseAdmin
            .from("tenants")
            .select("id, name, display_name, owner_id, created_at")
            .eq("id", tenantId)
            .maybeSingle();
        }),
      userClient
        .from("tenant_members")
        .select("tenant_id, user_id, role, created_at, phone")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: true })
        .then(async (res) => {
          if (res.data && res.data.length > 0) return res;
          return await supabaseAdmin
            .from("tenant_members")
            .select("tenant_id, user_id, role, created_at, phone")
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: true });
        }),
      userClient
        .from("tenant_invitations")
        .select("id, tenant_id, email, role, token, status, expires_at, created_at")
        .eq("tenant_id", tenantId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .then(async (res) => {
          if (res.data) return res;
          return await supabaseAdmin
            .from("tenant_invitations")
            .select("id, tenant_id, email, role, token, status, expires_at, created_at")
            .eq("tenant_id", tenantId)
            .eq("status", "pending")
            .order("created_at", { ascending: false });
        }),
      checkTenantAdminPermission(userId, tenantId, userClient),
    ]);

    const tenant = tenantRes.data;
    const memberList = [...(membersRes.data || [])];
    const isEffectiveAdmin =
      !!canAdmin ||
      (!!tenant?.owner_id && tenant.owner_id === userId) ||
      memberList.some((m) => m.user_id === userId && m.role === "admin");

    // Se o usuário não é membro e não é admin deste tenant, verifica se pode acessar
    const isCallerMember = memberList.some((m) => m.user_id === userId);
    if (!isCallerMember && !isEffectiveAdmin) {
      throw new Error("Acesso negado à equipe deste espaço.");
    }

    // Se o tenant tem owner_id e o owner não está listado em tenant_members, inclui-o como admin
    if (tenant?.owner_id && !memberList.some((m) => m.user_id === tenant.owner_id)) {
      memberList.unshift({
        tenant_id: tenantId,
        user_id: tenant.owner_id,
        role: "admin",
        created_at: tenant.created_at || new Date().toISOString(),
        phone: null,
      });

      const autoClient = userClient ?? supabaseAdmin;
      autoClient
        .from("tenant_members")
        .upsert(
          { tenant_id: tenantId, user_id: tenant.owner_id, role: "admin" },
          { onConflict: "tenant_id,user_id" }
        )
        .then(() => {});
    }

    // Se ainda vazio, tenta resolver o responsável pelo tenant
    if (memberList.length === 0) {
      let resolvedUserId: string | null = null;
      if (isEffectiveAdmin || userId) {
        resolvedUserId = userId;
      }
      if (resolvedUserId) {
        memberList.push({
          tenant_id: tenantId,
          user_id: resolvedUserId,
          role: "admin",
          created_at: tenant?.created_at || new Date().toISOString(),
          phone: null,
        });
      }
    }

    // 3. Buscar perfis dos membros em lote
    const userIds = memberList.map((m) => m.user_id);
    let profilesRaw: Array<{ id: string; full_name: string | null; email: string | null; avatar_url: string | null }> = [];
    if (userIds.length > 0) {
      const { data: uProfiles } = await userClient
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);
      if (uProfiles && uProfiles.length > 0) {
        profilesRaw = uProfiles;
      } else {
        const { data: aProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds);
        if (aProfiles) profilesRaw = aProfiles;
      }
    }

    // Buscar contatos salvos da equipe para enriquecer dados caso o perfil esteja incompleto
    const { data: teamContacts } = await userClient
      .from("team_contacts")
      .select("email, full_name, phone")
      .eq("tenant_id", tenantId);

    const contactMap = new Map((teamContacts || []).map((c) => [c.email?.toLowerCase(), c]));
    const profileMap = new Map(profilesRaw.map((p) => [p.id, p]));

    const members: TeamMemberInfo[] = memberList.map((m) => {
      const p = profileMap.get(m.user_id);
      const isSelf = m.user_id === userId;
      const claimsEmail = isSelf ? ((claims as any)?.email as string | undefined) : undefined;
      const claimsName = isSelf ? (((claims as any)?.user_metadata?.full_name || (claims as any)?.user_metadata?.name) as string | undefined) : undefined;

      const effectiveEmail = p?.email || claimsEmail || null;
      const contact = effectiveEmail ? contactMap.get(effectiveEmail.toLowerCase()) : null;

      const effectiveName =
        p?.full_name?.trim() ||
        claimsName?.trim() ||
        contact?.full_name?.trim() ||
        (m.user_id === tenant?.owner_id ? (tenant?.display_name || tenant?.name) : null) ||
        (effectiveEmail ? effectiveEmail.split("@")[0] : null) ||
        "Membro da equipe";

      // Auto-cura do perfil do usuário autenticado caso esteja sem dados no banco
      if (isSelf && (!p?.full_name || !p?.email) && claimsEmail) {
        userClient
          .from("profiles")
          .upsert({
            id: userId,
            email: claimsEmail,
            full_name: effectiveName,
          })
          .then(() => {});
      }

      return {
        userId: m.user_id,
        role: m.role as "admin" | "evaluator" | "viewer",
        createdAt: m.created_at,
        phone: m.phone || contact?.phone || null,
        fullName: effectiveName,
        email: effectiveEmail,
        avatarUrl: p?.avatar_url || null,
        isSelf,
      };
    });

    let invites: PendingInviteInfo[] = [];
    if (isEffectiveAdmin && invitesRes.data) {
      invites = invitesRes.data.map((inv: any) => ({
        id: inv.id,
        tenantId: inv.tenant_id,
        email: inv.email,
        role: inv.role as "admin" | "evaluator" | "viewer",
        token: inv.token,
        inviteLink: `${baseUrl}/invite/${inv.token}`,
        status: inv.status,
        createdAt: inv.created_at,
        expiresAt: inv.expires_at,
        isExpired: new Date(inv.expires_at).getTime() < now,
      }));
    }

    return {
      members,
      invites,
      canAdmin: !!isEffectiveAdmin,
    };
  });

export const revokeTeamInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ tenantId: z.string().uuid(), inviteId: z.string().uuid() }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { tenantId, inviteId } = data;
    const { supabaseAdmin, checkTenantAdminPermission } = await import("./team-invitations.server");

    const canAdmin = await checkTenantAdminPermission(userId, tenantId, context.supabase);
    if (!canAdmin) throw new Error("Apenas administradores podem revogar convites.");

    const { error } = await supabaseAdmin
      .from("tenant_invitations")
      .update({ status: "revoked" })
      .eq("id", inviteId)
      .eq("tenant_id", tenantId);

    if (error) throw error;
    return { success: true };
  });

export const removeTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ tenantId: z.string().uuid(), memberUserId: z.string().uuid() }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { tenantId, memberUserId } = data;
    const { supabaseAdmin, checkTenantAdminPermission } = await import("./team-invitations.server");

    if (userId === memberUserId) {
      throw new Error("Você não pode remover a si mesmo da equipe.");
    }

    const canAdmin = await checkTenantAdminPermission(userId, tenantId, context.supabase);
    if (!canAdmin) throw new Error("Apenas administradores podem remover membros.");

    // Regra: Todas as contas devem possuir ao menos um admin.
    // Não permitir remover o único admin da organização!
    const { data: memberToRemove } = await supabaseAdmin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", memberUserId)
      .maybeSingle();

    if (memberToRemove?.role === "admin") {
      const { count: adminCount } = await supabaseAdmin
        .from("tenant_members")
        .select("user_id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("role", "admin");

      if ((adminCount ?? 0) <= 1) {
        throw new Error(
          "A organização deve possuir ao menos um administrador. Promova outro membro a administrador antes de remover este."
        );
      }
    }

    // Desvincular de tenant_members
    const { error } = await supabaseAdmin
      .from("tenant_members")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("user_id", memberUserId);

    if (error) throw error;

    // Se o usuário removido estava apontando para este tenant como atual, limpa
    await supabaseAdmin
      .from("profiles")
      .update({ current_tenant_id: null })
      .eq("id", memberUserId)
      .eq("current_tenant_id", tenantId);

    return { success: true };
  });

export const updateTeamMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        tenantId: z.string().uuid(),
        memberUserId: z.string().uuid(),
        role: z.enum(["admin", "evaluator", "viewer"]),
      })
      .parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { tenantId, memberUserId, role } = data;
    const { supabaseAdmin, checkTenantAdminPermission } = await import("./team-invitations.server");

    const canAdmin = await checkTenantAdminPermission(userId, tenantId, context.supabase);
    if (!canAdmin) throw new Error("Apenas administradores podem alterar funções de membros.");

    // Se estiver rebaixando um admin para outra função, garantir que não é o único admin
    if (role !== "admin") {
      const { data: currentMember } = await supabaseAdmin
        .from("tenant_members")
        .select("role")
        .eq("tenant_id", tenantId)
        .eq("user_id", memberUserId)
        .maybeSingle();

      if (currentMember?.role === "admin") {
        const { count: adminCount } = await supabaseAdmin
          .from("tenant_members")
          .select("user_id", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .eq("role", "admin");

        if ((adminCount ?? 0) <= 1) {
          throw new Error(
            "Todas as contas devem possuir ao menos um administrador. Promova outro membro a administrador antes de rebaixar este."
          );
        }
      }
    }

    const { error } = await supabaseAdmin
      .from("tenant_members")
      .update({ role })
      .eq("tenant_id", tenantId)
      .eq("user_id", memberUserId);

    if (error) throw error;
    return { success: true };
  });

export const switchActiveTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { tenantId } = data;
    const { supabaseAdmin, ensureTenantAdminEnrolled } = await import("./team-invitations.server");

    // Auto-heal preventivo
    await ensureTenantAdminEnrolled(tenantId);

    // Validar se o usuário é membro do tenant desejado, owner, super admin ou impersonando
    const { data: isMember } = await supabaseAdmin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .maybeSingle();

    const { data: isSuperAdmin } = await supabaseAdmin
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();

    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("owner_id")
      .eq("id", tenantId)
      .maybeSingle();

    if (!isMember && !isSuperAdmin && tenant?.owner_id !== userId) {
      throw new Error("Você não pertence a esta organização/escola.");
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ current_tenant_id: tenantId })
      .eq("id", userId);

    if (error) throw error;
    return { success: true, tenantId };
  });

export const ensureUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase: userClient, claims } = context;
    const { supabaseAdmin } = await import("./team-invitations.server");

    // 1. Tenta buscar no perfil existente com userClient
    const { data: existing } = await userClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (existing && existing.full_name && existing.email) return existing;

    const email =
      existing?.email ||
      (claims as any)?.email ||
      "";
    const name =
      existing?.full_name ||
      (claims as any)?.user_metadata?.full_name ||
      (claims as any)?.user_metadata?.name ||
      (email ? email.split("@")[0] : "Usuário");
    const avatar = existing?.avatar_url || (claims as any)?.user_metadata?.avatar_url || null;

    if (email) {
      const { data: created } = await userClient
        .from("profiles")
        .upsert(
          {
            id: userId,
            email,
            full_name: name,
            avatar_url: avatar,
          },
          { onConflict: "id" }
        )
        .select("*")
        .maybeSingle();

      if (created) return created;
    }

    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (authUser?.user) {
        const authEmail = authUser.user.email ?? email;
        const authName =
          authUser.user.user_metadata?.full_name ||
          authUser.user.user_metadata?.name ||
          authEmail.split("@")[0];
        const authAvatar = authUser.user.user_metadata?.avatar_url || avatar;

        const { data: created } = await supabaseAdmin
          .from("profiles")
          .upsert(
            {
              id: userId,
              email: authEmail,
              full_name: authName,
              avatar_url: authAvatar,
            },
            { onConflict: "id" }
          )
          .select("*")
          .maybeSingle();

        if (created) return created;
      }
    } catch {
      // Ignora erro se service role não estiver disponível
    }

    return existing ?? null;
  });

