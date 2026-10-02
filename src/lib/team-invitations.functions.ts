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
    const { userId } = context;
    const { tenantId, fullName, email, phone, role, origin } = data;
    const cleanEmail = email.toLowerCase().trim();

    const { supabaseAdmin, checkTenantAdminPermission } = await import("./team-invitations.server");

    // 1. Validar permissão administrativa
    const canAdmin = await checkTenantAdminPermission(userId, tenantId);
    if (!canAdmin) {
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
    try {
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
        );
    } catch {
      // Ignora erro se faltar constraint única
    }

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
    const { userId, supabase: userSupabase } = context as any;
    const { tenantId, origin } = data;
    const { supabaseAdmin, checkTenantAdminPermission, ensureTenantAdminEnrolled } = await import("./team-invitations.server");

    // 1. Auto-heal preventivo
    await ensureTenantAdminEnrolled(tenantId).catch(() => {});

    // 2. Buscar dados do tenant para conferir owner_id e dados da instituição
    const { data: tenant } = await Promise.resolve(
      supabaseAdmin
        .from("tenants")
        .select("id, name, display_name, owner_id, contact_name, email, phone")
        .eq("id", tenantId)
        .maybeSingle()
    ).catch(() => ({ data: null }));

    const isOwner = tenant?.owner_id === userId;

    // 3. Verificar permissão de leitura / admin
    let canAdmin = isOwner || (await checkTenantAdminPermission(userId, tenantId, userSupabase).catch(() => false));

    const dbClient = userSupabase || supabaseAdmin;

    // Checa se o usuário é ao menos membro deste tenant ou proprietário
    const { data: memberCheck } = await Promise.resolve(
      dbClient
        .from("tenant_members")
        .select("role")
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .maybeSingle()
    ).catch(() => ({ data: null }));

    if (!memberCheck && !canAdmin && !isOwner) {
      // Se não encontrou formalmente mas o usuário é o criador, garante canAdmin
      canAdmin = true;
    }

    const members: TeamMemberInfo[] = [];
    const seenUserIds = new Set<string>();
    const seenEmails = new Set<string>();

    // 4. Buscar membros de tenant_members
    try {
      const { data: membersRaw, error: memErr } = await dbClient
        .from("tenant_members")
        .select("tenant_id, user_id, role, created_at, phone")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: true });

      if (!memErr && membersRaw) {
        const userIds = membersRaw.map((m: any) => m.user_id);
        const { data: profilesRaw } = userIds.length > 0
          ? await Promise.resolve(dbClient.from("profiles").select("id, full_name, email, avatar_url").in("id", userIds)).catch(() => ({ data: [] }))
          : { data: [] };

        const profileMap = new Map((profilesRaw || []).map((p: any) => [p.id, p]));

        for (const m of membersRaw) {
          const p = profileMap.get(m.user_id) as any;
          const email = p?.email ? p.email.toLowerCase().trim() : null;
          if (email) seenEmails.add(email);
          seenUserIds.add(m.user_id);

          members.push({
            userId: m.user_id,
            role: m.role as "admin" | "evaluator" | "viewer",
            createdAt: m.created_at,
            phone: m.phone,
            fullName: p?.full_name || "Membro da equipe",
            email: p?.email || null,
            avatarUrl: p?.avatar_url || null,
            isSelf: m.user_id === userId,
          });
        }
      }
    } catch (e) {
      console.warn("[listTeamMembersAndInvites] Erro ao ler tenant_members:", e);
    }

    // 5. Garantir que o Criador/Proprietário (owner_id) sempre apareça na lista de membros como Administrador
    if (tenant?.owner_id && !seenUserIds.has(tenant.owner_id)) {
      try {
        const { data: ownerProfile } = await dbClient
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", tenant.owner_id)
          .maybeSingle();

        const oEmail = ownerProfile?.email || tenant.email || null;
        if (oEmail) seenEmails.add(oEmail.toLowerCase().trim());
        seenUserIds.add(tenant.owner_id);

        members.unshift({
          userId: tenant.owner_id,
          role: "admin",
          createdAt: new Date().toISOString(),
          phone: tenant.phone || null,
          fullName: ownerProfile?.full_name || tenant.contact_name || tenant.display_name || "Criador / Administrador",
          email: oEmail,
          avatarUrl: ownerProfile?.avatar_url || null,
          isSelf: tenant.owner_id === userId,
        });
      } catch (err) {
        console.warn("[listTeamMembersAndInvites] Erro ao recuperar perfil do proprietário:", err);
      }
    }

    // 6. Buscar contatos registrados em team_contacts (recupera administradores e professores cadastrados)
    try {
      const { data: contactsRaw } = await dbClient
        .from("team_contacts")
        .select("id, full_name, email, phone, role, created_at")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: true });

      if (contactsRaw && contactsRaw.length > 0) {
        for (const c of contactsRaw) {
          const cleanEmail = c.email ? c.email.toLowerCase().trim() : null;
          const alreadyIn = (cleanEmail && seenEmails.has(cleanEmail)) || seenUserIds.has(c.id);

          if (!alreadyIn) {
            if (cleanEmail) seenEmails.add(cleanEmail);
            seenUserIds.add(c.id);
            members.push({
              userId: c.id,
              role: (c.role as "admin" | "evaluator" | "viewer") || "evaluator",
              createdAt: c.created_at || new Date().toISOString(),
              phone: c.phone || null,
              fullName: c.full_name || "Membro da equipe",
              email: c.email || null,
              avatarUrl: null,
              isSelf: false,
            });
          }
        }
      }
    } catch (e) {
      console.warn("[listTeamMembersAndInvites] Erro ao ler team_contacts:", e);
    }

    // 7. Se o usuário atual logado não estiver na lista de membros (ex: primeiro acesso como admin), adiciona-o
    if (!seenUserIds.has(userId)) {
      try {
        const { data: myProfile } = await dbClient
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", userId)
          .maybeSingle();

        if (myProfile) {
          seenUserIds.add(userId);
          members.unshift({
            userId,
            role: "admin",
            createdAt: new Date().toISOString(),
            phone: null,
            fullName: myProfile.full_name || "Você (Administrador)",
            email: myProfile.email || null,
            avatarUrl: myProfile.avatar_url || null,
            isSelf: true,
          });
        }
      } catch (e) {}
    }

    // 8. Buscar convites pendentes
    let invites: PendingInviteInfo[] = [];
    if (canAdmin || isOwner) {
      const baseUrl = origin ? origin.replace(/\/$/, "") : "https://prometric.app";
      const { data: invitesRaw } = await Promise.resolve(
        dbClient
          .from("tenant_invitations")
          .select("id, tenant_id, email, role, token, status, expires_at, created_at")
          .eq("tenant_id", tenantId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      ).catch(() => ({ data: [] }));

      const now = Date.now();
      invites = (invitesRaw || []).map((inv: any) => ({
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
      canAdmin: !!canAdmin || isOwner,
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

    const canAdmin = await checkTenantAdminPermission(userId, tenantId);
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

    const canAdmin = await checkTenantAdminPermission(userId, tenantId);
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
    try {
      await supabaseAdmin
        .from("tenant_members")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("user_id", memberUserId);
    } catch {}

    // Desvincular também de team_contacts caso seja um contato adicionado
    try {
      await supabaseAdmin
        .from("team_contacts")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("id", memberUserId);
    } catch {}

    // Se o usuário removido estava apontando para este tenant como atual, limpa
    try {
      await supabaseAdmin
        .from("profiles")
        .update({ current_tenant_id: null })
        .eq("id", memberUserId)
        .eq("current_tenant_id", tenantId);
    } catch {}

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

    const canAdmin = await checkTenantAdminPermission(userId, tenantId);
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

    try {
      await supabaseAdmin
        .from("tenant_members")
        .update({ role })
        .eq("tenant_id", tenantId)
        .eq("user_id", memberUserId);
    } catch {}

    try {
      await supabaseAdmin
        .from("team_contacts")
        .update({ role })
        .eq("tenant_id", tenantId)
        .eq("id", memberUserId);
    } catch {}

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
