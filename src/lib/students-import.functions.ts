import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RowSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  sex: z.enum(["male", "female"]),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cpf: z.string().trim().max(20).optional().nullable(),
  rg: z.string().trim().max(30).optional().nullable(),
  guardian_name: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  address_street: z.string().trim().max(255).optional().nullable(),
  school_name: z.string().trim().max(200).optional().nullable(),
  class_name: z.string().trim().max(200).optional().nullable(),
  group_name: z.string().trim().max(200).optional().nullable(),
});

const InputSchema = z.object({
  tenantId: z.string().uuid(),
  rows: z.array(RowSchema).min(1).max(5000),
  duplicateStrategy: z.enum(["update", "skip", "create"]),
});

export type ImportRow = z.infer<typeof RowSchema>;
export type ImportResult = {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: { index: number; full_name: string; reason: string }[];
  created: { schools: string[]; classes: string[]; groups: string[] };
};

export const importStudents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }): Promise<ImportResult> => {
    const { supabase, userId } = context;
    const { tenantId, rows, duplicateStrategy } = data;

    // Verify membership/write permission
    const { data: canWrite } = await supabase.rpc("can_write_tenant", { _tenant: tenantId });
    if (!canWrite) throw new Error("Sem permissão para este tenant");
    void userId;

    // Preload existing entities for this tenant
    const [schoolsQ, classesQ, groupsQ, studentsQ] = await Promise.all([
      supabase.from("schools").select("id,name").eq("tenant_id", tenantId),
      supabase.from("classes").select("id,name,school_id").eq("tenant_id", tenantId),
      supabase.from("groups").select("id,name").eq("tenant_id", tenantId),
      supabase.from("students").select("id,full_name,birth_date").eq("tenant_id", tenantId).eq("is_active", true),
    ]);
    if (schoolsQ.error) throw schoolsQ.error;
    if (classesQ.error) throw classesQ.error;
    if (groupsQ.error) throw groupsQ.error;
    if (studentsQ.error) throw studentsQ.error;

    const norm = (s: string) => s.trim().toLowerCase();
    const schoolMap = new Map<string, string>(); // name → id
    schoolsQ.data?.forEach((s) => schoolMap.set(norm(s.name), s.id));
    const classMap = new Map<string, string>(); // name|school_id → id
    classesQ.data?.forEach((c) => classMap.set(`${norm(c.name)}|${c.school_id ?? ""}`, c.id));
    const groupMap = new Map<string, string>();
    groupsQ.data?.forEach((g) => groupMap.set(norm(g.name), g.id));
    const studentMap = new Map<string, string>(); // name|birth → id
    studentsQ.data?.forEach((s) => studentMap.set(`${norm(s.full_name)}|${s.birth_date}`, s.id));

    const created = { schools: [] as string[], classes: [] as string[], groups: [] as string[] };
    const result: ImportResult = {
      processed: rows.length, inserted: 0, updated: 0, skipped: 0, errors: [], created,
    };

    async function ensureSchool(name?: string | null): Promise<string | null> {
      if (!name) return null;
      const key = norm(name);
      if (schoolMap.has(key)) return schoolMap.get(key)!;
      const { data: ins, error } = await supabase
        .from("schools").insert([{ tenant_id: tenantId, name: name.trim() }])
        .select("id").single();
      if (error) throw error;
      schoolMap.set(key, ins.id);
      created.schools.push(name.trim());
      return ins.id;
    }
    async function ensureClass(name?: string | null, schoolId?: string | null): Promise<string | null> {
      if (!name) return null;
      const key = `${norm(name)}|${schoolId ?? ""}`;
      if (classMap.has(key)) return classMap.get(key)!;
      const { data: ins, error } = await supabase
        .from("classes").insert([{ tenant_id: tenantId, name: name.trim(), school_id: schoolId ?? null }])
        .select("id").single();
      if (error) throw error;
      classMap.set(key, ins.id);
      created.classes.push(name.trim());
      return ins.id;
    }
    async function ensureGroup(name?: string | null): Promise<string | null> {
      if (!name) return null;
      const key = norm(name);
      if (groupMap.has(key)) return groupMap.get(key)!;
      const { data: ins, error } = await supabase
        .from("groups").insert([{ tenant_id: tenantId, name: name.trim() }])
        .select("id").single();
      if (error) throw error;
      groupMap.set(key, ins.id);
      created.groups.push(name.trim());
      return ins.id;
    }

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const schoolId = await ensureSchool(r.school_name);
        const classId = await ensureClass(r.class_name, schoolId);
        const groupId = await ensureGroup(r.group_name);

        const dupKey = `${norm(r.full_name)}|${r.birth_date}`;
        const existingId = studentMap.get(dupKey);

        const payload = {
          tenant_id: tenantId,
          full_name: r.full_name.trim(),
          sex: r.sex,
          birth_date: r.birth_date,
          cpf: r.cpf || null,
          rg: r.rg || null,
          guardian_name: r.guardian_name || null,
          phone: r.phone || null,
          email: r.email || null,
          address_street: r.address_street || null,
          class_id: classId,
          group_id: groupId,
        };

        if (existingId) {
          if (duplicateStrategy === "skip") { result.skipped++; continue; }
          if (duplicateStrategy === "update") {
            const { error } = await supabase.from("students").update(payload).eq("id", existingId);
            if (error) throw error;
            result.updated++;
            continue;
          }
          // create: fall through to insert
        }

        const { data: ins, error } = await supabase
          .from("students").insert([payload]).select("id").single();
        if (error) throw error;
        studentMap.set(dupKey, ins.id);
        result.inserted++;
      } catch (e) {
        result.errors.push({
          index: i,
          full_name: r.full_name,
          reason: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return result;
  });
