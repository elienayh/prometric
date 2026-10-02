// Server function leve: valida o token QR de uma ficha impressa e devolve os
// dados do aluno necessários para criar a avaliação. Substitui a chamada
// automática à IA — é usada pelo pipeline OCR tradicional.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ResolvedSheetStudent = {
  studentId: string;
  studentName: string;
  birthDate: string;
  sex: string;
  classId: string | null;
  groupId: string | null;
  className: string | null;
  tenantId: string;
};

export const resolveSheetToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { token: string }) => {
    if (!data?.token?.startsWith("PM1.")) throw new Error("Token de ficha inválido");
    return data;
  })
  .handler(async ({ data, context }): Promise<ResolvedSheetStudent> => {
    const { verifySheetToken } = await import("./qr-payload.server");
    const payload = verifySheetToken(data.token);

    const { supabase } = context;
    const { data: student, error } = await supabase
      .from("students")
      .select("id, tenant_id, full_name, sex, birth_date, class_id, group_id, class:classes(name)")
      .eq("id", payload.s)
      .maybeSingle();
    if (error) throw error;
    if (!student) throw new Error("Aluno da ficha não encontrado neste espaço");
    const s = student as {
      id: string;
      tenant_id: string;
      full_name: string;
      sex: string;
      birth_date: string;
      class_id: string | null;
      group_id: string | null;
      class: { name?: string | null } | null;
    };
    if (s.tenant_id !== payload.t)
      throw new Error("Ficha emitida em outro espaço — não pode ser processada aqui");

    return {
      studentId: s.id,
      studentName: s.full_name,
      birthDate: s.birth_date,
      sex: s.sex,
      classId: s.class_id,
      groupId: s.group_id,
      className: s.class?.name ?? null,
      tenantId: s.tenant_id,
    };
  });
