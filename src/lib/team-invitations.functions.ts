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
        // Ignora erro de constraint em team_contacts se faltar UNIQUE
      });

    // 5. Verificar se já existe perfil cadastrado com esse e-mail
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
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
      await supabaseAdmin
        .from("profiles")
        .update({ current_tenant_id: tenantId })
        .eq("id", existingProfile.id)
        .is("current_tenant_id", null);

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
        message: `${fullName} já possui conta no ProMetric e foi vinculado(a) diretamente à sua equipe como ${role === "admin" ? "Administrador(a)" : "Avaliador(a)"}.`,
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
        ? `Convite enviado por e-mail para ${cleanEmail}. Ao fazer login, a pessoa entrará diretamente em ${tenantName}.`
        : `Convite criado com sucesso para ${cleanEmail}. Você também pode copiar o link direto de acesso.`,
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
