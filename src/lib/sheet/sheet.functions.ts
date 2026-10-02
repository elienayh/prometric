// Server function: issues signed sheet tokens for one or more students.
// Reused by individual print (student page) and batch print (class/group page).
// Membership is enforced via RLS — the authenticated supabase client only
// returns students from tenants the user belongs to.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Input = { studentIds: string[] };

export type SheetStudent = {
  id: string;
  full_name: string;
  sex: "male" | "female" | string;
  birth_date: string;
  photo_url: string | null;
  class_name: string | null;
  school_name: string | null;
  token: string;
};

export type SheetBundle = {
  tenant: { id: string; name: string; logo_url: string | null };
  students: SheetStudent[];
};

export const issueSheetTokens = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Input) => {
    if (!Array.isArray(data?.studentIds) || data.studentIds.length === 0) {
      throw new Error("Selecione ao menos um aluno");
    }
    if (data.studentIds.length > 500) {
      throw new Error("Limite de 500 fichas por lote");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: rows, error } = await supabase
      .from("students")
      .select("id, tenant_id, full_name, sex, birth_date, photo_url, class:classes(name, school:schools(name))")
      .in("id", data.studentIds);
    if (error) throw error;
    if (!rows || rows.length === 0) throw new Error("Nenhum aluno encontrado");

    const tenantId = (rows[0] as { tenant_id: string }).tenant_id;

    const { data: tenant, error: tErr } = await supabase
      .from("tenants")
      .select("id, name, logo_url")
      .eq("id", tenantId)
      .single();
    if (tErr || !tenant) throw new Error("Tenant não encontrado");

    const { signSheetToken } = await import("./qr-payload.server");

    const students: SheetStudent[] = rows.map((r) => {
      const row = r as {
        id: string;
        tenant_id: string;
        full_name: string;
        sex: string;
        birth_date: string;
        photo_url: string | null;
        class?: { name?: string | null; school?: { name?: string | null } | null } | null;
      };
      return {
        id: row.id,
        full_name: row.full_name,
        sex: row.sex,
        birth_date: row.birth_date,
        photo_url: row.photo_url,
        class_name: row.class?.name ?? null,
        school_name: row.class?.school?.name ?? null,
        token: signSheetToken(row.id, row.tenant_id),
      };
    });

    const bundle: SheetBundle = {
      tenant: tenant as { id: string; name: string; logo_url: string | null },
      students,
    };
    return bundle;
  });
