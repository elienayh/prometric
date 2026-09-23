// ============================================================================
// Relatório Evolutivo ProMetric — único PDF oficial do aluno (A4, 1 página).
// ----------------------------------------------------------------------------
// Filosofia: o foco do sistema é o ALUNO. Avaliações são eventos históricos
// que alimentam um único relatório evolutivo. Toda ação "Gerar Relatório"
// deve usar esta função — não há mais PDF simplificado/completo ou por
// avaliação como experiência principal.
// ============================================================================

import jsPDF from "jspdf";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import {
  resolveBrandingChain,
  resolveLogoUrl,
  fetchImageDataUrl,
  hexToRgb,
} from "./branding";
import {
  prometricIndex,
  dimensionScores,
  PM_DIMENSIONS,
} from "./prometric-method";
import { ZONES, type Classifications, type Zone } from "./proesp";
import {
  scoreToSituation,
  situationSentence,
  EXPECTED_INDEX_RANGE,
  EXPECTED_DIMENSION_RANGE,
  REFERENCE_LABEL,
  type PRSituation,
} from "./prometric-reference";
import type { PMDimension } from "./prometric-method";
import { consolidatedClassifications, withConsolidatedView } from "./student-metrics";

// ── Family + Student action generators (Referência ProMetric®) ───────
function familyActions(
  s: PRSituation | null,
  weakest: PMDimension | null,
  best: PMDimension | null,
  delta: number,
): string[] {
  const tips: string[] = [];
  if (s === "Muito abaixo" || s === "Abaixo") {
    tips.push("Garanta ao menos 60 min de atividade física diária — brincar ao ar livre conta.");
    tips.push("Reduza tempo de tela (TV, celular, tablet) para menos de 2h por dia.");
    tips.push("Procure orientação do professor de Educação Física para um plano de apoio.");
  } else if (s === "Dentro do esperado") {
    tips.push("Mantenha a rotina atual — está funcionando! Variar atividades ajuda a evoluir.");
    tips.push("Incentive participação em esportes coletivos ou aulas extras 2–3x por semana.");
    tips.push("Cuide do sono (9–11h) e da alimentação: ambos sustentam o desempenho físico.");
  } else if (s === "Acima do esperado" || s === "Muito acima do esperado") {
    tips.push("Estimule novos desafios esportivos — o potencial é alto, vale explorar modalidades.");
    tips.push("Atenção à recuperação: alongamento, hidratação e descanso são tão importantes quanto o treino.");
    tips.push("Converse com o professor sobre possibilidade de equipes competitivas ou treinamento específico.");
  } else {
    tips.push("Acompanhe esta evolução com regularidade no Portal do Aluno.");
  }
  if (weakest) tips.push(`Foco familiar: criar oportunidades de movimento que estimulem ${weakest.toLowerCase()}.`);
  if (best && delta > 0) tips.push(`Comemore com ${best.toLowerCase()}: a evolução foi significativa e merece reconhecimento.`);
  return tips.slice(0, 4);
}

function studentActions(
  s: PRSituation | null,
  weakest: PMDimension | null,
  score: number,
): string[] {
  const tips: string[] = [];
  if (s === "Muito abaixo" || s === "Abaixo") {
    tips.push("Comece pequeno: 15 min de brincadeira ativa por dia já fazem diferença.");
    tips.push("Desafio da semana: 3 dias com pelo menos 30 min de movimento (correr, pular, pedalar).");
  } else if (s === "Dentro do esperado") {
    tips.push("Você está no caminho certo! Próxima meta: subir para a próxima faixa até a próxima avaliação.");
    tips.push("Escolha 1 esporte que você ama e pratique 3x na semana.");
  } else {
    tips.push("Excelente desempenho! Procure desafios maiores — competições, treinos com objetivos.");
    tips.push("Ensine um(a) amigo(a): liderar inspira você e quem está ao seu lado.");
  }
  if (weakest) tips.push(`Sua próxima conquista: melhorar em ${weakest.toLowerCase()} — peça ajuda ao(à) professor(a) de EF.`);
  tips.push(`Meta visível: chegar a ${Math.min(100, Math.max(score + 5, 50))} pts no Índice ProMetric® na próxima avaliação.`);
  return tips.slice(0, 4);
}

type EvalLite = {
  id: string;
  evaluated_at: string;
  classifications: Classifications | null;
};

type StudentLite = {
  id: string;
  full_name: string;
  sex: "male" | "female";
  birth_date: string | null;
  portal_enabled: boolean | null;
  portal_token: string | null;
  portal_slug: string | null;
  class: { name: string | null; school_id: string | null } | null;
  group: {
    name: string | null;
    display_name: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    description: string | null;
    logo_url: string | null;
  } | null;
};

function ageFromBirthDate(bd: string | null): number | null {
  if (!bd) return null;
  const d = new Date(bd);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function situationTone(s: ReturnType<typeof scoreToSituation>): [number, number, number] | undefined {
  switch (s) {
    case "Muito abaixo": return [220, 38, 38];
    case "Abaixo": return [249, 115, 22];
    case "Dentro do esperado": return [34, 197, 94];
    case "Acima do esperado": return [59, 130, 246];
    case "Muito acima do esperado": return [124, 58, 237];
    default: return undefined;
  }
}

function aggregateZones(rows: { classifications: Classifications | null }[]): Classifications {
  const buckets: Partial<Record<keyof Classifications, number[]>> = {};
  for (const r of rows) {
    for (const [k, z] of Object.entries(r.classifications ?? {})) {
      const idx = ZONES.indexOf(z as Zone);
      if (idx < 0) continue;
      (buckets[k as keyof Classifications] ||= []).push(idx);
    }
  }
  const out: Classifications = {};
  for (const [k, arr] of Object.entries(buckets)) {
    if (!arr?.length) continue;
    const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    out[k as keyof Classifications] = ZONES[avg];
  }
  return out;
}

export async function downloadStudentEvolutionPDF(
  studentId: string,
  tenantId: string,
  fallbackTenantName = "ProMetric",
): Promise<void> {
  // ── Fetch in parallel ────────────────────────────────────────────────
  const [
    { data: student },
    { data: evals },
    { data: tenantRow },
  ] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, full_name, sex, birth_date, class_id, portal_enabled, portal_token, portal_slug, " +
          "class:classes(name, school_id), " +
          "group:groups(name, display_name, primary_color, secondary_color, description, logo_url)",
      )
      .eq("id", studentId)
      .maybeSingle(),
    supabase
      .from("evaluations")
      .select("id, evaluated_at, classifications")
      .eq("student_id", studentId)
      .order("evaluated_at", { ascending: true }),
    supabase
      .from("tenants")
      .select(
        "name, display_name, primary_color, secondary_color, description, website, email, phone, logo_url",
      )
      .eq("id", tenantId)
      .maybeSingle(),
  ]);

  if (!student) throw new Error("Aluno não encontrado");
  const s = student as unknown as StudentLite;
  const rawHistory = (evals ?? []) as EvalLite[];
  const history = (withConsolidatedView(rawHistory) as EvalLite[]).filter((e) =>
    Object.values(e.classifications ?? {}).some(Boolean),
  );
  if (!history.length) throw new Error("Aluno ainda não possui avaliações registradas");

  const classId = (student as any)?.class_id as string | null | undefined;
  const schoolId = s.class?.school_id ?? null;

  // School branding (separate query because it's an optional nested FK)
  const { data: schoolRow } = schoolId
    ? await supabase
        .from("schools")
        .select("name, display_name, primary_color, secondary_color, description, logo_url")
        .eq("id", schoolId)
        .maybeSingle()
    : { data: null };

  // Peer latest (class + school) for comparativos
  const fetchPeerLatest = async (mode: "class" | "school") => {
    let q = supabase
      .from("students")
      .select("id, evaluations(classifications, evaluated_at)")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);
    if (mode === "class" && classId) q = q.eq("class_id", classId);
    const { data } = await q;
    const rows: { classifications: Classifications | null }[] = [];
    for (const ps of (data ?? []) as any[]) {
      const evs = (ps.evaluations ?? []) as { classifications: Classifications | null; evaluated_at: string }[];
      if (!evs.length) continue;
       rows.push({ classifications: consolidatedClassifications(evs) });
    }
    return rows;
  };
  const [classPeers, schoolPeers] = await Promise.all([
    classId ? fetchPeerLatest("class") : Promise.resolve([]),
    fetchPeerLatest("school"),
  ]);

  // Branding chain (Group → School → Tenant → default)
  const brand = resolveBrandingChain(s.group as any, schoolRow as any, tenantRow as any);
  const primary = hexToRgb(brand.primaryColor);
  const secondary = hexToRgb(brand.secondaryColor);
  const logoResolved = await resolveLogoUrl(brand.logoUrl);
  const logoDataUrl = logoResolved ? await fetchImageDataUrl(logoResolved) : null;

  // Portal URL + QR
  const portalKey = s.portal_slug ?? s.portal_token;
  const portalActive = !!s.portal_enabled && !!portalKey;
  const portalUrl =
    portalActive && typeof window !== "undefined"
      ? `${window.location.origin}${s.portal_slug ? "/p/" : "/portal/aluno/"}${portalKey}`
      : null;
  const qrDataUrl = portalUrl
    ? await QRCode.toDataURL(portalUrl, { margin: 0, width: 200 }).catch(() => null)
    : null;

  // ── Compute analytics ────────────────────────────────────────────────
  const first = history[0];
  const last = history[history.length - 1];
  const idxFirst = prometricIndex(first.classifications ?? {});
  const idxLast = prometricIndex(last.classifications ?? {});
  const delta = idxLast.score - idxFirst.score;

  const dimsLast = dimensionScores(last.classifications ?? {});
  const dimsFirst = dimensionScores(first.classifications ?? {});
  const dimDeltas = PM_DIMENSIONS.map((d) => {
    const a = dimsFirst.find((x) => x.dimension === d)?.score ?? 0;
    const b = dimsLast.find((x) => x.dimension === d)?.score ?? 0;
    return { dimension: d, first: a, last: b, delta: b - a };
  });
  const bestEvo = [...dimDeltas].sort((a, b) => b.delta - a.delta)[0];
  const worstEvo = [...dimDeltas].sort((a, b) => a.delta - b.delta)[0];
  const stableEvo = [...dimDeltas].sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))[0];
  const lowestNow = [...dimsLast].sort((a, b) => a.score - b.score)[0];
  const highestNow = [...dimsLast].sort((a, b) => b.score - a.score)[0];

  // Comparativos: aluno vs média da turma / escola
  const classAvg = classPeers.length ? aggregateZones(classPeers) : null;
  const schoolAvg = schoolPeers.length ? aggregateZones(schoolPeers) : null;
  const classIndex = classAvg ? prometricIndex(classAvg).score : null;
  const schoolIndex = schoolAvg ? prometricIndex(schoolAvg).score : null;

  // Recomendações automáticas (até 3)
  const recommendations: string[] = [];
  if (lowestNow && lowestNow.score < 50) {
    recommendations.push(
      `Priorizar trabalho em ${lowestNow.dimension.toLowerCase()} (atual: ${lowestNow.score}/100).`,
    );
  }
  if (bestEvo && bestEvo.delta > 5) {
    recommendations.push(
      `Manter a estratégia que gerou +${bestEvo.delta} pontos em ${bestEvo.dimension.toLowerCase()}.`,
    );
  }
  if (highestNow && highestNow.score >= 75) {
    recommendations.push(
      `Estimular avanço em ${highestNow.dimension.toLowerCase()} — perfil de potencial elevado.`,
    );
  }
  if (recommendations.length === 0) {
    recommendations.push("Continuar a periodização atual e reavaliar em 8–12 semanas.");
  }

  // ── Render PDF (A4 retrato, 1 página) ────────────────────────────────
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth(); // 210
  const H = doc.internal.pageSize.getHeight(); // 297
  const M = 10;
  const tenantName = brand.displayName || fallbackTenantName;
  const firstName = s.full_name.split(" ")[0];
  const situation = scoreToSituation(idxLast.score, idxLast.partial);
  const sitTone = situationTone(situation) ?? primary;
  const age = ageFromBirthDate(s.birth_date);
  const sexLabel = s.sex === "male" ? "Masculino" : "Feminino";

  // ── HEADER (gradient-look band) ──────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, W, 20, "F");
  doc.setFillColor(secondary[0], secondary[1], secondary[2]);
  doc.setGState(new (doc as any).GState({ opacity: 0.35 }));
  doc.rect(W * 0.55, 0, W * 0.45, 20, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", M, 3, 14, 14, undefined, "FAST"); } catch { /* ignore */ }
  }
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text("RELATÓRIO EVOLUTIVO PROMETRIC®", logoDataUrl ? M + 18 : M, 9);
  doc.setFont("helvetica", "normal").setFontSize(8);
  doc.text(tenantName, logoDataUrl ? M + 18 : M, 14.5);
  doc.setFontSize(7.5);
  doc.text(
    `Emitido em ${new Date().toLocaleDateString("pt-BR")}  •  ${history.length} avaliação(ões)`,
    W - M, 9, { align: "right" },
  );
  doc.text(`Última: ${new Date(last.evaluated_at).toLocaleDateString("pt-BR")}`, W - M, 14.5, { align: "right" });

  // ── HERO ─────────────────────────────────────────────────────────────
  // Big Índice ProMetric® disc + categoria + situação + identificação
  let y = 24;
  const heroH = 42;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, W - 2 * M, heroH, 3, 3, "FD");

  // Disc (left)
  const discR = 16;
  const discCx = M + 6 + discR;
  const discCy = y + heroH / 2;
  // outer ring (expected range arc 45..85 → 144°..306° em torno do círculo)
  doc.setDrawColor(220, 224, 232);
  doc.setLineWidth(2.2);
  doc.circle(discCx, discCy, discR + 2.2, "S");
  // expected zone arc (green)
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(2.2);
  const arcStart = -Math.PI / 2 + (EXPECTED_INDEX_RANGE.min / 100) * 2 * Math.PI;
  const arcEnd = -Math.PI / 2 + (EXPECTED_INDEX_RANGE.max / 100) * 2 * Math.PI;
  const arcSteps = 40;
  for (let i = 0; i < arcSteps; i++) {
    const a1 = arcStart + (arcEnd - arcStart) * (i / arcSteps);
    const a2 = arcStart + (arcEnd - arcStart) * ((i + 1) / arcSteps);
    doc.line(
      discCx + Math.cos(a1) * (discR + 2.2), discCy + Math.sin(a1) * (discR + 2.2),
      discCx + Math.cos(a2) * (discR + 2.2), discCy + Math.sin(a2) * (discR + 2.2),
    );
  }
  // student marker on ring
  const markerA = -Math.PI / 2 + (idxLast.score / 100) * 2 * Math.PI;
  doc.setFillColor(...sitTone);
  doc.circle(discCx + Math.cos(markerA) * (discR + 2.2), discCy + Math.sin(markerA) * (discR + 2.2), 1.6, "F");
  // disc fill
  doc.setFillColor(...primary);
  doc.circle(discCx, discCy, discR, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold").setFontSize(22);
  doc.text(String(idxLast.score), discCx, discCy + 1, { align: "center", baseline: "middle" });
  doc.setFont("helvetica", "normal").setFontSize(7);
  doc.text("/ 100", discCx, discCy + 7, { align: "center" });
  doc.setFontSize(6);
  doc.setTextColor(220, 230, 255);
  doc.text("ÍNDICE PROMETRIC®", discCx, discCy - 9, { align: "center" });

  // Middle: categoria + situação badge
  const midX = discCx + discR + 8;
  doc.setFont("helvetica", "normal").setFontSize(7);
  doc.setTextColor(110);
  doc.text("CATEGORIA PROMETRIC®", midX, y + 7);
  doc.setFont("helvetica", "bold").setFontSize(13);
  doc.setTextColor(...primary);
  doc.text(idxLast.category ?? "—", midX, y + 13);

  doc.setFont("helvetica", "normal").setFontSize(7);
  doc.setTextColor(110);
  doc.text(`SITUAÇÃO • ${REFERENCE_LABEL.toUpperCase()}`, midX, y + 21);
  // badge
  const badgeW = 56, badgeH = 9;
  doc.setFillColor(...sitTone);
  doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
  doc.roundedRect(midX, y + 23, badgeW, badgeH, 1.5, 1.5, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  doc.setDrawColor(...sitTone);
  doc.setLineWidth(0.4);
  doc.roundedRect(midX, y + 23, badgeW, badgeH, 1.5, 1.5, "S");
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.setTextColor(...sitTone);
  doc.text(situation ?? "Sem dados", midX + badgeW / 2, y + 29, { align: "center" });
  // Expected range hint
  doc.setFont("helvetica", "normal").setFontSize(6.5);
  doc.setTextColor(110);
  doc.text(
    `Faixa esperada para a idade: ${EXPECTED_INDEX_RANGE.min}–${EXPECTED_INDEX_RANGE.max} pts`,
    midX, y + 37,
  );

  // Right: identification + evolution chip
  const rightHeroX = midX + badgeW + 10;
  doc.setFont("helvetica", "bold").setFontSize(13);
  doc.setTextColor(20);
  doc.text(s.full_name, rightHeroX, y + 8, { maxWidth: W - M - rightHeroX });
  doc.setFont("helvetica", "normal").setFontSize(8);
  doc.setTextColor(80);
  const idLines = [
    `${sexLabel}${age !== null ? ` • ${age} anos` : ""}`,
    s.class?.name ? `Turma: ${s.class.name}` : null,
    schoolRow?.name ? `Escola: ${(schoolRow as any).name}` : null,
    s.group?.name ? `Grupo: ${s.group.name}` : null,
  ].filter(Boolean) as string[];
  idLines.forEach((t, i) => doc.text(t, rightHeroX, y + 13 + i * 4));

  // Evolution chip
  const chipY = y + heroH - 11;
  const chipColor: [number, number, number] = delta >= 0 ? [34, 197, 94] : [239, 68, 68];
  doc.setFillColor(...chipColor);
  doc.setGState(new (doc as any).GState({ opacity: 0.12 }));
  doc.roundedRect(rightHeroX, chipY, 46, 8, 1.5, 1.5, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Draw clean vector triangle for up/down indicator (guarantees perfect rendering without font encoding bugs)
  doc.setFillColor(...chipColor);
  const triCx = rightHeroX + 5.5;
  const triCy = chipY + 4;
  if (delta >= 0) {
    // Up arrow triangle (▲)
    doc.triangle(triCx - 1.8, triCy + 1.5, triCx + 1.8, triCy + 1.5, triCx, triCy - 1.8, "F");
  } else {
    // Down arrow triangle (▼)
    doc.triangle(triCx - 1.8, triCy - 1.8, triCx + 1.8, triCy - 1.8, triCx, triCy + 1.5, "F");
  }

  doc.setFont("helvetica", "bold").setFontSize(8.5);
  doc.setTextColor(...chipColor);
  doc.text(`${delta >= 0 ? "+" : ""}${delta} pts evolução`, rightHeroX + 9, chipY + 5.3);

  // Interpretative sentence below hero
  y += heroH + 3;
  doc.setFont("helvetica", "italic").setFontSize(8.5);
  doc.setTextColor(60);
  const sentence = situationSentence(situation, `O desenvolvimento físico de ${firstName}`);
  doc.text(sentence, M, y, { maxWidth: W - 2 * M });
  y += 6;

  // ── TWO COLUMNS ──────────────────────────────────────────────────────
  const colGap = 5;
  const colWidth = (W - 2 * M - colGap) / 2;
  const leftX = M;
  const rightX = M + colWidth + colGap;
  const colTop = y;
  let leftY = colTop;
  let rightY = colTop;

  const sectionTitle = (x: number, yy: number, title: string) => {
    doc.setFillColor(...primary);
    doc.rect(x, yy, 2.2, 5, "F");
    doc.setFont("helvetica", "bold").setFontSize(9);
    doc.setTextColor(40);
    doc.text(title.toUpperCase(), x + 4, yy + 4);
    return yy + 7;
  };

  // ── LEFT COLUMN ──────────────────────────────────────────────────────
  // 1. Perfil Atual com banda esperada
  leftY = sectionTitle(leftX, leftY, "Perfil por Dimensão");
  const barH = 4;
  const labelW = 40;
  const trackW = colWidth - labelW - 14;
  const expStart = (EXPECTED_DIMENSION_RANGE.min / 100) * trackW;
  const expEnd = (EXPECTED_DIMENSION_RANGE.max / 100) * trackW;
  dimsLast.forEach((d) => {
    doc.setFont("helvetica", "normal").setFontSize(7.5);
    doc.setTextColor(60);
    doc.text(d.dimension, leftX, leftY + 3);
    const trackX = leftX + labelW;
    // base track
    doc.setFillColor(235, 238, 245);
    doc.roundedRect(trackX, leftY, trackW, barH, 1, 1, "F");
    // expected band (green)
    doc.setFillColor(34, 197, 94);
    doc.setGState(new (doc as any).GState({ opacity: 0.18 }));
    doc.rect(trackX + expStart, leftY, expEnd - expStart, barH, "F");
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
    // value bar tinted by situation
    const sit = scoreToSituation(d.score);
    const tone = situationTone(sit) ?? primary;
    doc.setFillColor(...tone);
    doc.roundedRect(trackX, leftY, Math.max(0.5, (d.score / 100) * trackW), barH, 1, 1, "F");
    doc.setFont("helvetica", "bold").setFontSize(7.5);
    doc.setTextColor(40);
    doc.text(`${d.score}`, leftX + colWidth - 2, leftY + 3, { align: "right" });
    leftY += barH + 3;
  });
  // legend
  doc.setFont("helvetica", "normal").setFontSize(6);
  doc.setTextColor(120);
  doc.text(`Faixa verde = esperado para a idade (${EXPECTED_DIMENSION_RANGE.min}–${EXPECTED_DIMENSION_RANGE.max})`, leftX, leftY + 1);
  leftY += 5;

  // 2. Radar atual
  leftY = sectionTitle(leftX, leftY, "Radar Atual");
  const radarSize = Math.min(colWidth - 4, 58);
  const cx = leftX + colWidth / 2;
  const cy = leftY + radarSize / 2 + 2;
  const radius = radarSize / 2 - 4;
  doc.setDrawColor(225);
  doc.setLineWidth(0.2);
  [0.25, 0.5, 0.75, 1].forEach((t) => doc.circle(cx, cy, radius * t, "S"));
  // expected ring (green dashed-ish — solid translucent)
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.4);
  doc.circle(cx, cy, radius * (EXPECTED_DIMENSION_RANGE.max / 100), "S");
  doc.circle(cx, cy, radius * (EXPECTED_DIMENSION_RANGE.min / 100), "S");
  const n = PM_DIMENSIONS.length;
  const pts: [number, number][] = [];
  dimsLast.forEach((d, i) => {
    const ang = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
    const r = (d.score / 100) * radius;
    pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
    const lx = cx + Math.cos(ang) * (radius + 5);
    const ly = cy + Math.sin(ang) * (radius + 5);
    doc.setDrawColor(215);
    doc.line(cx, cy, cx + Math.cos(ang) * radius, cy + Math.sin(ang) * radius);
    doc.setFont("helvetica", "normal").setFontSize(6);
    doc.setTextColor(90);
    doc.text(d.dimension, lx, ly, { align: "center", baseline: "middle" });
  });
  doc.setFillColor(...primary);
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.5);
  const deltas: [number, number][] = [];
  for (let i = 1; i < pts.length; i++) deltas.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
  deltas.push([pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]]);
  doc.setGState(new (doc as any).GState({ opacity: 0.28 }));
  doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], "S");
  leftY = cy + radius + 6;

  // 3. Inicial × Atual
  leftY = sectionTitle(leftX, leftY, "Inicial × Atual");
  dimDeltas.forEach((d) => {
    const sign = d.delta > 0 ? "+" : d.delta < 0 ? "" : "";
    const tone: [number, number, number] = d.delta > 0 ? [34, 197, 94] : d.delta < 0 ? [239, 68, 68] : [120, 120, 120];
    doc.setFont("helvetica", "normal").setFontSize(7.5);
    doc.setTextColor(60);
    doc.text(d.dimension, leftX, leftY + 3);
    doc.text(`${d.first} -> ${d.last}`, leftX + colWidth - 18, leftY + 3, { align: "right" });

    // Vector triangle indicator for delta
    doc.setFillColor(...tone);
    const triX = leftX + colWidth - 14;
    const triY = leftY + 2.2;
    if (d.delta > 0) {
      doc.triangle(triX - 1.2, triY + 1, triX + 1.2, triY + 1, triX, triY - 1.2, "F");
    } else if (d.delta < 0) {
      doc.triangle(triX - 1.2, triY - 1.2, triX + 1.2, triY - 1.2, triX, triY + 1, "F");
    } else {
      doc.setFont("helvetica", "bold").setFontSize(7.5);
      doc.setTextColor(...tone);
      doc.text("=", triX, leftY + 3, { align: "center" });
    }

    doc.setFont("helvetica", "bold").setFontSize(7.5);
    doc.setTextColor(...tone);
    doc.text(`${sign}${d.delta}`, leftX + colWidth - 2, leftY + 3, { align: "right" });
    leftY += 4;
  });

  // ── RIGHT COLUMN ─────────────────────────────────────────────────────
  // 1. Evolução temporal com banda esperada
  rightY = sectionTitle(rightX, rightY, "Evolução Temporal");
  const chartH = 38;
  const chartW = colWidth;
  const chartTop = rightY;
  // base
  doc.setFillColor(250, 251, 254);
  doc.setDrawColor(220);
  doc.setLineWidth(0.2);
  doc.roundedRect(rightX, chartTop, chartW, chartH, 1, 1, "FD");
  // expected band
  const bandTop = chartTop + chartH - (EXPECTED_INDEX_RANGE.max / 100) * chartH;
  const bandBot = chartTop + chartH - (EXPECTED_INDEX_RANGE.min / 100) * chartH;
  doc.setFillColor(34, 197, 94);
  doc.setGState(new (doc as any).GState({ opacity: 0.12 }));
  doc.rect(rightX, bandTop, chartW, bandBot - bandTop, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  // gridlines
  [0.25, 0.5, 0.75].forEach((t) => {
    const yy = chartTop + chartH * t;
    doc.setDrawColor(235);
    doc.line(rightX, yy, rightX + chartW, yy);
  });
  const scores = history.map((e) => prometricIndex(e.classifications ?? {}).score);
  const stepX = history.length > 1 ? chartW / (history.length - 1) : 0;
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.9);
  for (let i = 1; i < history.length; i++) {
    const x1 = rightX + stepX * (i - 1);
    const y1 = chartTop + chartH - (scores[i - 1] / 100) * chartH;
    const x2 = rightX + stepX * i;
    const y2 = chartTop + chartH - (scores[i] / 100) * chartH;
    doc.line(x1, y1, x2, y2);
  }
  history.forEach((_, i) => {
    const x = rightX + stepX * i;
    const yp = chartTop + chartH - (scores[i] / 100) * chartH;
    doc.setFillColor(255, 255, 255); doc.circle(x, yp, 1.7, "F");
    doc.setFillColor(...primary); doc.circle(x, yp, 1.2, "F");
    doc.setFont("helvetica", "bold").setFontSize(6);
    doc.setTextColor(40);
    doc.text(String(scores[i]), x, yp - 2.5, { align: "center" });
  });
  doc.setFont("helvetica", "normal").setFontSize(6);
  doc.setTextColor(110);
  doc.text(new Date(first.evaluated_at).toLocaleDateString("pt-BR"), rightX, chartTop + chartH + 3);
  if (history.length > 1) {
    doc.text(new Date(last.evaluated_at).toLocaleDateString("pt-BR"), rightX + chartW, chartTop + chartH + 3, { align: "right" });
  }
  doc.setTextColor(34, 120, 60);
  doc.text(`Faixa verde = esperado (${EXPECTED_INDEX_RANGE.min}–${EXPECTED_INDEX_RANGE.max})`, rightX + chartW / 2, chartTop + chartH + 3, { align: "center" });
  rightY = chartTop + chartH + 7;

  // 2. Comparativos
  rightY = sectionTitle(rightX, rightY, "Comparativos");
  const compRows: { label: string; me: number; peer: number | null }[] = [
    { label: "Aluno × Turma", me: idxLast.score, peer: classIndex },
    { label: "Aluno × Escola", me: idxLast.score, peer: schoolIndex },
  ];
  compRows.forEach((row) => {
    doc.setFont("helvetica", "normal").setFontSize(7.5);
    doc.setTextColor(60);
    doc.text(row.label, rightX, rightY + 3);
    const trackX = rightX + 30;
    const trackWc = colWidth - 50;
    doc.setFillColor(232, 235, 242);
    doc.roundedRect(trackX, rightY, trackWc, 3, 0.5, 0.5, "F");
    // expected band on comparative bar
    const eS = (EXPECTED_INDEX_RANGE.min / 100) * trackWc;
    const eE = (EXPECTED_INDEX_RANGE.max / 100) * trackWc;
    doc.setFillColor(34, 197, 94);
    doc.setGState(new (doc as any).GState({ opacity: 0.18 }));
    doc.rect(trackX + eS, rightY, eE - eS, 3, "F");
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
    doc.setFillColor(...primary);
    doc.roundedRect(trackX, rightY, (row.me / 100) * trackWc, 3, 0.5, 0.5, "F");
    if (row.peer !== null) {
      doc.setDrawColor(...secondary);
      doc.setLineWidth(0.9);
      const px = trackX + (row.peer / 100) * trackWc;
      doc.line(px, rightY - 0.8, px, rightY + 3.8);
    }
    doc.setFont("helvetica", "bold").setFontSize(7.5);
    doc.setTextColor(40);
    const peerTxt = row.peer !== null ? ` (média ${row.peer})` : "";
    doc.text(`${row.me}${peerTxt}`, rightX + colWidth - 2, rightY + 3, { align: "right" });
    rightY += 6;
  });

  rightY += 1;
  // 3. Destaques
  rightY = sectionTitle(rightX, rightY, "Destaques");
  doc.setFont("helvetica", "normal").setFontSize(7.5);
  doc.setTextColor(60);
  const highlights = [
    bestEvo && bestEvo.delta > 0 ? `Maior evolução: ${bestEvo.dimension} (+${bestEvo.delta} pts)` : null,
    highestNow ? `Maior potencial: ${highestNow.dimension} (${highestNow.score}/100)` : null,
    lowestNow ? `Atenção: ${lowestNow.dimension} (${lowestNow.score}/100)` : null,
    idxLast.category ? `Perfil predominante: ${idxLast.category}` : null,
  ].filter(Boolean) as string[];
  highlights.forEach((h) => {
    doc.text(`•  ${h}`, rightX, rightY + 3);
    rightY += 4;
  });

  // ── Family + Student strip (full width) ─────────────────────────────
  const stripY = Math.max(leftY, rightY) + 4;
  const stripH = 38;
  const stripColW = (W - 2 * M - colGap) / 2;
  // FAMILY card
  doc.setFillColor(239, 246, 255); // soft blue
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, stripY, stripColW, stripH, 2.5, 2.5, "FD");
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.setTextColor(30, 64, 175);
  doc.text("PARA A FAMÍLIA", M + 4, stripY + 6);
  doc.setFont("helvetica", "normal").setFontSize(7.5);
  doc.setTextColor(40, 60, 90);
  const familyTips = familyActions(situation, lowestNow?.dimension ?? null, bestEvo?.dimension ?? null, delta);
  let fy = stripY + 11;
  familyTips.forEach((t) => {
    const lines = doc.splitTextToSize(`•  ${t}`, stripColW - 8);
    doc.text(lines, M + 4, fy);
    fy += 3.6 * lines.length;
  });

  // STUDENT card
  const sx = M + stripColW + colGap;
  doc.setFillColor(255, 247, 237); // soft amber
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(sx, stripY, stripColW, stripH, 2.5, 2.5, "FD");
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.setTextColor(154, 52, 18);
  doc.text(`PARA ${firstName.toUpperCase()} — SEU PRÓXIMO PASSO`, sx + 4, stripY + 6);
  doc.setFont("helvetica", "normal").setFontSize(7.5);
  doc.setTextColor(90, 50, 20);
  const studentTips = studentActions(situation, lowestNow?.dimension ?? null, idxLast.score);
  let sy = stripY + 11;
  studentTips.forEach((t) => {
    const lines = doc.splitTextToSize(`•  ${t}`, stripColW - 8);
    doc.text(lines, sx + 4, sy);
    sy += 3.6 * lines.length;
  });

  // ── FOOTER ───────────────────────────────────────────────────────────
  const footerH = 20;
  const footerY = H - footerH - 4;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(M, footerY - 2, W - M, footerY - 2);

  if (qrDataUrl) {
    try { doc.addImage(qrDataUrl, "PNG", M, footerY, 18, 18, undefined, "FAST"); } catch { /* ignore */ }
    doc.setFont("helvetica", "bold").setFontSize(8);
    doc.setTextColor(40);
    doc.text("Portal do Aluno — acompanhe em tempo real", M + 22, footerY + 5);
    doc.setFont("helvetica", "normal").setFontSize(7);
    doc.setTextColor(80);
    doc.text("Aponte a câmera do celular para o QR code ao lado.", M + 22, footerY + 9);
    if (portalUrl) {
      doc.setTextColor(...primary);
      const url = portalUrl.length > 55 ? portalUrl.slice(0, 52) + "..." : portalUrl;
      doc.text(url, M + 22, footerY + 13);
    }
  } else {
    doc.setFont("helvetica", "italic").setFontSize(7);
    doc.setTextColor(120);
    doc.text("Portal do Aluno não está ativo. Ative na ficha do aluno para compartilhar com a família.", M, footerY + 6);
  }
  doc.setFont("helvetica", "normal").setFontSize(6.5);
  doc.setTextColor(140);
  doc.text(
    `Relatório oficial ProMetric® · ${tenantName} · ${new Date().toLocaleString("pt-BR")}`,
    W - M, H - 4, { align: "right" },
  );

  // ── Save ──────────────────────────────────────────────────────────────
  const safeName = s.full_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-");
  doc.save(`relatorio-evolutivo-${safeName}.pdf`);
}

// Compat: signature aligned to legacy callsites (tenantName, ev, studentId, tenantId)
export async function downloadStudentEvolutionPDFLegacy(
  tenantName: string,
  _ev: unknown,
  studentId: string,
  tenantId: string,
) {
  return downloadStudentEvolutionPDF(studentId, tenantId, tenantName);
}
