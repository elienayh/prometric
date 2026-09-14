import { supabase } from "@/integrations/supabase/client";
import { ZONES, type Classifications, type Zone } from "./proesp";
import {
  generateEvaluationPDFComplete,
  type CompleteReportExtras,
  type ReportEval,
} from "./pdf-report";
import { resolveBrandingChain, hexToRgb, resolveLogoUrl, fetchImageDataUrl } from "./branding";

function aggregateZones(rows: { classifications: Classifications | null }[]): CompleteReportExtras["classAverage"] {
  const buckets: Partial<Record<keyof Classifications, number[]>> = {};
  for (const r of rows) {
    const c = r.classifications ?? {};
    for (const [k, z] of Object.entries(c)) {
      const idx = ZONES.indexOf(z as Zone);
      if (idx < 0) continue;
      (buckets[k as keyof Classifications] ||= []).push(idx);
    }
  }
  const out: CompleteReportExtras["classAverage"] = {};
  for (const [k, arr] of Object.entries(buckets)) {
    if (!arr || !arr.length) continue;
    const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    out![k as keyof Classifications] = ZONES[avg];
  }
  return out;
}

export async function downloadEvaluationPDFCompleteWithContext(
  tenantName: string,
  ev: ReportEval,
  studentId: string,
  tenantId: string,
) {
  // Fetch student + relations + tenant branding in parallel.
  const [{ data: history }, { data: student }, { data: tenantRow }] = await Promise.all([
    supabase
      .from("evaluations")
      .select("*, student:students(full_name,sex,birth_date)")
      .eq("student_id", studentId)
      .order("evaluated_at", { ascending: true }),
    supabase
      .from("students")
      .select("class_id, group_id, photo_url, class:classes(name,school_id), group:groups(name,display_name,primary_color,secondary_color,description,logo_url)")
      .eq("id", studentId)
      .single(),
    supabase.from("tenants")
      .select("name,display_name,primary_color,secondary_color,description,website,email,phone,logo_url")
      .eq("id", tenantId)
      .maybeSingle(),
  ]);

  const classId = (student as any)?.class_id as string | null;
  const className = (student as any)?.class?.name as string | undefined;
  const schoolId = (student as any)?.class?.school_id as string | null;
  const photoPath = (student as any)?.photo_url as string | null;
  const groupRow = (student as any)?.group ?? null;

  // School branding (separate query — relational nesting on optional FK simpler this way).
  const { data: schoolRow } = schoolId
    ? await supabase.from("schools")
        .select("name,display_name,primary_color,secondary_color,description,logo_url")
        .eq("id", schoolId).maybeSingle()
    : { data: null };

  const fetchPeerLatest = async (filter: "class" | "school") => {
    let q = supabase
      .from("students")
      .select("id, evaluations(classifications, evaluated_at)")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);
    if (filter === "class" && classId) q = q.eq("class_id", classId);
    const { data } = await q;
    const rows: { classifications: Classifications | null }[] = [];
    for (const s of (data ?? []) as any[]) {
      const evs = (s.evaluations ?? []) as { classifications: Classifications | null; evaluated_at: string }[];
      if (!evs.length) continue;
      const latest = evs.sort((a, b) => b.evaluated_at.localeCompare(a.evaluated_at))[0];
      rows.push({ classifications: latest.classifications });
    }
    return rows;
  };

  const [classRows, schoolRows] = await Promise.all([
    classId ? fetchPeerLatest("class") : Promise.resolve([]),
    fetchPeerLatest("school"),
  ]);

  // Branding hierárquico: Grupo → Escola → Tenant → ProMetric
  const brand = resolveBrandingChain(groupRow, schoolRow as any, tenantRow as any);
  const logoResolved = await resolveLogoUrl(brand.logoUrl);
  const logoDataUrl = logoResolved ? await fetchImageDataUrl(logoResolved) : null;
  const photoDataUrl = photoPath ? await fetchImageDataUrl(photoPath).catch(() => null) : null;

  const extras: CompleteReportExtras = {
    history: (history ?? []) as unknown as ReportEval[],
    classAverage: classRows.length ? aggregateZones(classRows) : undefined,
    schoolAverage: schoolRows.length ? aggregateZones(schoolRows) : undefined,
    className,
    studentPhotoDataUrl: photoDataUrl,
    branding: {
      displayName: brand.displayName,
      primaryColor: hexToRgb(brand.primaryColor),
      secondaryColor: hexToRgb(brand.secondaryColor),
      logoDataUrl,
      website: brand.website,
      email: brand.email,
      phone: brand.phone,
    },
  };

  generateEvaluationPDFComplete(tenantName, ev, extras);
}
