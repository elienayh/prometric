import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
    const { supabase, userId } = context;
    const { tenantId, fullName, email, phone, role, origin } = data;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Validar permissão do usuário que está convidando (deve ser admin do tenant)
    const { data: canAdmin } = await supabase.rpc("is_tenant_admin", { _tenant: tenantId });
    const { data: canWrite } = await supabase.rpc("can_write_tenant", { _tenant: tenantId });
    if (!canAdmin && !canWrite) {
      throw new Error("Você não tem permissão de administrador para convidar membros nesta escola/organização.");
    }

    // 2. Buscar dados da organização (tenant)
    const { data: tenant, error: tenantErr } = await supabaseAdmin
      .from("tenants")
      .select("id, name, display_name")
      .eq("id", tenantId)
      .single();
    if (tenantErr || !tenant) {
      throw new Error("Escola ou organização não encontrada.");
    }
    const tenantName = tenant.display_name || tenant.name || "ProMetric";

    // 3. Gerar token seguro para o link de convite
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const baseUrl = origin ? origin.replace(/\/$/, "") : "https://prometric.app";
    const inviteLink = `${baseUrl}/invite/${token}`;

    // 4. Salvar/atualizar em team_contacts para compatibilidade e agenda
    await supabaseAdmin
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
      )
      .catch(() => {
        // Ignora erro se faltar constraint única
      });

    // 5. Verificar se já existe perfil cadastrado com esse e-mail
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, current_tenant_id")
      .ilike("email", cleanEmail)
      .maybeSingle();

    let emailSent = false;
    let isExistingUser = false;

    if (existingProfile) {
      isExistingUser = true;
      // Usuário já possui conta no sistema! Vincular diretamente ao tenant_members
      const { error: memberErr } = await supabaseAdmin
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
        console.error("[TeamInvite] Erro ao vincular membro existente:", memberErr);
      }

      // Atualiza o current_tenant_id do usuário caso não tenha nenhum
      if (!existingProfile.current_tenant_id) {
        await supabaseAdmin
          .from("profiles")
          .update({ current_tenant_id: tenantId })
          .eq("id", existingProfile.id);
      }

      // Registrar convite já aceito para rastreabilidade
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

      return {
        success: true,
        token,
        inviteLink,
        emailSent: false,
        isExistingUser: true,
        message: `${fullName} (${cleanEmail}) já possui conta no ProMetric e foi vinculado(a) diretamente à sua equipe como ${role === "admin" ? "Administrador(a)" : "Avaliador(a)"}.`,
      };
    }

    // 6. Usuário novo: Criar convite pendente em tenant_invitations
    const { error: invErr } = await supabaseAdmin.from("tenant_invitations").insert({
      tenant_id: tenantId,
      email: cleanEmail,
      role,
      token,
      invited_by: userId,
      status: "pending",
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (invErr) {
      console.error("[TeamInvite] Erro ao salvar convite:", invErr);
      throw new Error(`Erro ao gerar convite: ${invErr.message}`);
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
      .update({ current_tenant_id: inv.tenant_id })
      .eq("id", userId);

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

    // Buscar perfil do usuário para saber o e-mail cadastrado
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, current_tenant_id")
      .eq("id", userId)
      .maybeSingle();

    let cleanEmail = profile?.email?.toLowerCase().trim();

    if (!cleanEmail) {
      // Buscar da auth
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

      // Inserir em tenant_members
      await supabaseAdmin.from("tenant_members").upsert(
        {
          tenant_id: inv.tenant_id,
          user_id: userId,
          role: inv.role,
        },
        { onConflict: "tenant_id,user_id" }
      );

      // Marcar convite como aceito
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

    // Se o usuário não tinha nenhum tenant ativo e reivindicou ao menos um, definir o primeiro como ativo
    if (claimedTenantIds.length > 0 && !profile?.current_tenant_id) {
      await supabaseAdmin
        .from("profiles")
        .update({ current_tenant_id: claimedTenantIds[0] })
        .eq("id", userId);
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
    const { supabase, userId } = context;
    const { tenantId, origin } = data;

    // Verificar se o usuário tem permissão de leitura neste tenant
    const { data: canRead } = await supabase.rpc("is_tenant_member", { _tenant: tenantId });
    const { data: canAdmin } = await supabase.rpc("is_tenant_admin", { _tenant: tenantId });
    if (!canRead && !canAdmin) {
      throw new Error("Acesso negado à equipe deste espaço.");
    }

    // 1. Buscar membros de tenant_members
    const { data: membersRaw, error: memErr } = await supabaseAdmin
      .from("tenant_members")
      .select("tenant_id, user_id, role, created_at, phone")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    if (memErr) throw memErr;

    const userIds = (membersRaw || []).map((m) => m.user_id);
    const { data: profilesRaw } = userIds.length > 0
      ? await supabaseAdmin.from("profiles").select("id, full_name, email, avatar_url").in("id", userIds)
      : { data: [] };

    const profileMap = new Map((profilesRaw || []).map((p) => [p.id, p]));

    const members: TeamMemberInfo[] = (membersRaw || []).map((m) => {
      const p = profileMap.get(m.user_id);
      return {
        userId: m.user_id,
        role: m.role as "admin" | "evaluator" | "viewer",
        createdAt: m.created_at,
        phone: m.phone,
        fullName: p?.full_name || "Membro da equipe",
        email: p?.email || null,
        avatarUrl: p?.avatar_url || null,
        isSelf: m.user_id === userId,
      };
    });

    // 2. Buscar convites pendentes (se for admin)
    let invites: PendingInviteInfo[] = [];
    if (canAdmin) {
      const baseUrl = origin ? origin.replace(/\/$/, "") : "https://prometric.app";
      const { data: invitesRaw } = await supabaseAdmin
        .from("tenant_invitations")
        .select("id, tenant_id, email, role, token, status, expires_at, created_at")
        .eq("tenant_id", tenantId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      const now = Date.now();
      invites = (invitesRaw || []).map((inv) => ({
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
      canAdmin: !!canAdmin,
    };
  });

export const revokeTeamInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ tenantId: z.string().uuid(), inviteId: z.string().uuid() }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { tenantId, inviteId } = data;

    const { data: canAdmin } = await supabase.rpc("is_tenant_admin", { _tenant: tenantId });
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
    const { supabase, userId } = context;
    const { tenantId, memberUserId } = data;

    if (userId === memberUserId) {
      throw new Error("Você não pode remover a si mesmo da equipe.");
    }

    const { data: canAdmin } = await supabase.rpc("is_tenant_admin", { _tenant: tenantId });
    if (!canAdmin) throw new Error("Apenas administradores podem remover membros.");

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
    const { supabase } = context;
    const { tenantId, memberUserId, role } = data;

    const { data: canAdmin } = await supabase.rpc("is_tenant_admin", { _tenant: tenantId });
    if (!canAdmin) throw new Error("Apenas administradores podem alterar funções de membros.");

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
    const { supabase, userId } = context;
    const { tenantId } = data;

    // Validar se o usuário é membro do tenant desejado ou super admin
    const { data: isMember } = await supabase.rpc("is_tenant_member", { _tenant: tenantId });
    const { data: isSuperAdmin } = await supabase.rpc("is_super_admin", { _user: userId });

    if (!isMember && !isSuperAdmin) {
      throw new Error("Você não pertence a esta organização/escola.");
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ current_tenant_id: tenantId })
      .eq("id", userId);

    if (error) throw error;
    return { success: true, tenantId };
  });
