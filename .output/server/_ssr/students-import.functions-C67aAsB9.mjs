import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
import { a as objectType, n as enumType, o as stringType, r as literalType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/students-import.functions-C67aAsB9.js
var RowSchema = objectType({
	full_name: stringType().trim().min(1).max(200),
	sex: enumType(["male", "female"]),
	birth_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
	cpf: stringType().trim().max(20).optional().nullable(),
	rg: stringType().trim().max(30).optional().nullable(),
	guardian_name: stringType().trim().max(200).optional().nullable(),
	phone: stringType().trim().max(40).optional().nullable(),
	email: stringType().trim().email().max(255).optional().nullable().or(literalType("")),
	address_street: stringType().trim().max(255).optional().nullable(),
	school_name: stringType().trim().max(200).optional().nullable(),
	class_name: stringType().trim().max(200).optional().nullable(),
	group_name: stringType().trim().max(200).optional().nullable()
});
var InputSchema = objectType({
	tenantId: stringType().uuid(),
	rows: arrayType(RowSchema).min(1).max(5e3),
	duplicateStrategy: enumType([
		"update",
		"skip",
		"create"
	])
});
var importStudents_createServerFn_handler = createServerRpc({
	id: "23dc3893d484c180749a99cdc01d063fc9e0badfeef063164d66b6e23ead3307",
	name: "importStudents",
	filename: "src/lib/students-import.functions.ts"
}, (opts) => importStudents.__executeServer(opts));
var importStudents = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => InputSchema.parse(d)).handler(importStudents_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { tenantId, rows, duplicateStrategy } = data;
	const { data: canWrite } = await supabase.rpc("can_write_tenant", { _tenant: tenantId });
	if (!canWrite) throw new Error("Sem permissão para este tenant");
	const [schoolsQ, classesQ, groupsQ, studentsQ] = await Promise.all([
		supabase.from("schools").select("id,name").eq("tenant_id", tenantId),
		supabase.from("classes").select("id,name,school_id").eq("tenant_id", tenantId),
		supabase.from("groups").select("id,name").eq("tenant_id", tenantId),
		supabase.from("students").select("id,full_name,birth_date").eq("tenant_id", tenantId).eq("is_active", true)
	]);
	if (schoolsQ.error) throw schoolsQ.error;
	if (classesQ.error) throw classesQ.error;
	if (groupsQ.error) throw groupsQ.error;
	if (studentsQ.error) throw studentsQ.error;
	const norm = (s) => s.trim().toLowerCase();
	const schoolMap = /* @__PURE__ */ new Map();
	schoolsQ.data?.forEach((s) => schoolMap.set(norm(s.name), s.id));
	const classMap = /* @__PURE__ */ new Map();
	classesQ.data?.forEach((c) => classMap.set(`${norm(c.name)}|${c.school_id ?? ""}`, c.id));
	const groupMap = /* @__PURE__ */ new Map();
	groupsQ.data?.forEach((g) => groupMap.set(norm(g.name), g.id));
	const studentMap = /* @__PURE__ */ new Map();
	studentsQ.data?.forEach((s) => studentMap.set(`${norm(s.full_name)}|${s.birth_date}`, s.id));
	const created = {
		schools: [],
		classes: [],
		groups: []
	};
	const result = {
		processed: rows.length,
		inserted: 0,
		updated: 0,
		skipped: 0,
		errors: [],
		created
	};
	async function ensureSchool(name) {
		if (!name) return null;
		const key = norm(name);
		if (schoolMap.has(key)) return schoolMap.get(key);
		const { data: ins, error } = await supabase.from("schools").insert([{
			tenant_id: tenantId,
			name: name.trim()
		}]).select("id").single();
		if (error) throw error;
		schoolMap.set(key, ins.id);
		created.schools.push(name.trim());
		return ins.id;
	}
	async function ensureClass(name, schoolId) {
		if (!name) return null;
		const key = `${norm(name)}|${schoolId ?? ""}`;
		if (classMap.has(key)) return classMap.get(key);
		const { data: ins, error } = await supabase.from("classes").insert([{
			tenant_id: tenantId,
			name: name.trim(),
			school_id: schoolId ?? null
		}]).select("id").single();
		if (error) throw error;
		classMap.set(key, ins.id);
		created.classes.push(name.trim());
		return ins.id;
	}
	async function ensureGroup(name) {
		if (!name) return null;
		const key = norm(name);
		if (groupMap.has(key)) return groupMap.get(key);
		const { data: ins, error } = await supabase.from("groups").insert([{
			tenant_id: tenantId,
			name: name.trim()
		}]).select("id").single();
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
				group_id: groupId
			};
			if (existingId) {
				if (duplicateStrategy === "skip") {
					result.skipped++;
					continue;
				}
				if (duplicateStrategy === "update") {
					const { error } = await supabase.from("students").update(payload).eq("id", existingId);
					if (error) throw error;
					result.updated++;
					continue;
				}
			}
			const { data: ins, error } = await supabase.from("students").insert([payload]).select("id").single();
			if (error) throw error;
			studentMap.set(dupKey, ins.id);
			result.inserted++;
		} catch (e) {
			result.errors.push({
				index: i,
				full_name: r.full_name,
				reason: e instanceof Error ? e.message : String(e)
			});
		}
	}
	return result;
});
//#endregion
export { importStudents_createServerFn_handler };
