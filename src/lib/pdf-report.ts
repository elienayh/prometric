import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TEST_META, ZONES, type Classifications, type Zone, overallScore } from "./proesp";

export type ReportEval = {
  id: string;
  evaluated_at: string;
  age_years: number | null;
  weight_kg: number | null; height_cm: number | null;
  waist_cm: number | null; hip_cm: number | null; wingspan_cm: number | null;
  imc: number | null; rce: number | null;
  sit_and_reach_cm: number | null;
  abdominal_reps: number | null;
  horizontal_jump_cm: number | null;
  medicine_ball_m: number | null;
  square_test_s: number | null;
  sprint_20m_s: number | null;
  run_6min_m: number | null;
  classifications: Classifications;
  ai_diagnosis: string | null;
  notes: string | null;
  student: { full_name: string; sex: string; birth_date: string };
};

const PRIMARY: [number, number, number] = [99, 102, 241]; // indigo-500

export function generateEvaluationPDF(tenantName: string, ev: ReportEval) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 24, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold").setFontSize(16);
  doc.text("ProMetric — Relatório de Avaliação Física", 12, 12);
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(tenantName, 12, 19);

  // Dados do aluno
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold").setFontSize(13);
  doc.text(ev.student.full_name, 12, 36);
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.setTextColor(80);
  const sexLabel = ev.student.sex === "male" ? "Masculino" : "Feminino";
  doc.text(
    `Sexo: ${sexLabel}  •  Idade: ${ev.age_years ?? "—"} anos  •  Data: ${new Date(ev.evaluated_at).toLocaleDateString("pt-BR")}`,
    12, 42,
  );

  // Antropometria
  autoTable(doc, {
    startY: 50,
    head: [["Antropometria", "Valor"]],
    body: [
      ["Peso (kg)", ev.weight_kg ?? "—"],
      ["Estatura (cm)", ev.height_cm ?? "—"],
      ["Envergadura (cm)", ev.wingspan_cm ?? "—"],
      ["Cintura (cm)", ev.waist_cm ?? "—"],
      ["Quadril (cm)", ev.hip_cm ?? "—"],
      ["IMC", ev.imc ?? "—"],
      ["RCE", ev.rce ?? "—"],
    ],
    theme: "striped",
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 12, right: 12 },
  });

  // Avaliação ProMetric
  const rows = Object.entries(TEST_META)
    .filter(([k]) => !["imc", "rce"].includes(k))
    .map(([k, meta]) => {
      const value = (ev as any)[meta.field] ?? "—";
      const z = ev.classifications?.[k as keyof Classifications] ?? "—";
      return [meta.label, `${value} ${meta.unit}`, z];
    });

  autoTable(doc, {
    head: [["Teste ProMetric", "Resultado", "Classificação"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 12, right: 12 },
  });

  // Resumo
  const score = overallScore(ev.classifications ?? {});
  const yEnd = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(20);
  if (score.partial) {
    doc.setTextColor(180, 90, 0);
    doc.text(`Avaliação parcial — ${score.filled}/9 testes. Classificação geral indisponível.`, 12, yEnd);
    doc.setTextColor(20);
  } else {
    doc.text(`Perfil geral: ${score.label ?? "—"} (score ${score.score}/6)`, 12, yEnd);
  }

  // Diagnóstico IA
  if (ev.ai_diagnosis) {
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text("Diagnóstico (IA)", 12, yEnd + 10);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(40);
    const lines = doc.splitTextToSize(ev.ai_diagnosis, W - 24);
    doc.text(lines, 12, yEnd + 16);
  }

  // Observações
  if (ev.notes) {
    const y2 = (doc as any).lastAutoTable.finalY + 60;
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(20);
    doc.text("Observações", 12, y2);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(40);
    doc.text(doc.splitTextToSize(ev.notes, W - 24), 12, y2 + 6);
  }

  // Footer
  const PH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8).setTextColor(140);
  doc.text(
    `Gerado por ProMetric em ${new Date().toLocaleString("pt-BR")} • Classificações com base em Método ProMetric® (referenciais).`,
    12, PH - 12,
  );
  doc.text("Consulte a Central de Conhecimento em ProMetric → Central de Conhecimento para entender cálculos e classificações.", 12, PH - 7);

  doc.save(`avaliacao-${ev.student.full_name.replace(/\s+/g, "_")}-${ev.evaluated_at}.pdf`);
}

// ===========================================================================
// RELATÓRIO INSTITUCIONAL — Escola
// ===========================================================================
export type InstitutionalData = {
  tenantName: string;
  school: { name: string; city: string | null; state: string | null; network: string | null };
  totalStudents: number;
  totalEvaluations: number;
  totalClasses: number;
  sex: { male: number; female: number };
  zoneCounts: Record<Zone, number>;
  classBreakdown: { name: string; total: number; healthyPct: number; riskPct: number }[];
  atRisk: { name: string; class: string; issues: string }[];
};

export function generateInstitutionalPDF(data: InstitutionalData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();

  // Capa
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, PH, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold").setFontSize(28);
  doc.text("Relatório Institucional", 16, 60);
  doc.setFontSize(20);
  doc.text(data.school.name, 16, 75);
  doc.setFont("helvetica", "normal").setFontSize(12);
  if (data.school.network) doc.text(`Rede: ${data.school.network}`, 16, 88);
  const loc = [data.school.city, data.school.state].filter(Boolean).join(" / ");
  if (loc) doc.text(loc, 16, 96);
  doc.setFontSize(10);
  doc.text(`Gerado por ProMetric — ${data.tenantName}`, 16, PH - 24);
  doc.text(new Date().toLocaleDateString("pt-BR"), 16, PH - 16);

  // Página 2 — Indicadores
  doc.addPage();
  doc.setFillColor(...PRIMARY); doc.rect(0, 0, W, 18, "F");
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
  doc.text("Indicadores Agregados", 12, 12);
  doc.setTextColor(20);

  autoTable(doc, {
    startY: 28,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de alunos ativos", String(data.totalStudents)],
      ["Total de avaliações", String(data.totalEvaluations)],
      ["Turmas", String(data.totalClasses)],
      ["Alunos masculinos", String(data.sex.male)],
      ["Alunos femininos", String(data.sex.female)],
    ],
    theme: "striped",
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 12, right: 12 },
  });

  // Distribuição por zona
  const zoneRows = ZONES.map((z) => [z, String(data.zoneCounts[z] ?? 0)]);
  autoTable(doc, {
    head: [["Classificação ProMetric", "Total"]],
    body: zoneRows,
    theme: "striped",
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 12, right: 12 },
  });

  // Página 3 — Turmas
  doc.addPage();
  doc.setFillColor(...PRIMARY); doc.rect(0, 0, W, 18, "F");
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
  doc.text("Comparativo entre Turmas", 12, 12);

  autoTable(doc, {
    startY: 28,
    head: [["Turma", "Alunos avaliados", "% Saudável", "% Em atenção"]],
    body: data.classBreakdown.length
      ? data.classBreakdown.map((c) => [c.name, String(c.total), `${c.healthyPct}%`, `${c.riskPct}%`])
      : [["—", "—", "—", "—"]],
    theme: "striped",
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 12, right: 12 },
  });

  // Página 4 — Alunos em atenção
  if (data.atRisk.length) {
    doc.addPage();
    doc.setFillColor(...PRIMARY); doc.rect(0, 0, W, 18, "F");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
    doc.text("Alunos em Atenção", 12, 12);
    autoTable(doc, {
      startY: 28,
      head: [["Aluno", "Turma", "Indicadores em atenção"]],
      body: data.atRisk.map((r) => [r.name, r.class, r.issues]),
      theme: "striped",
      headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 12, right: 12 },
    });
  }

  // Footer em todas as páginas (exceto capa)
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(140);
    doc.text(`ProMetric • ${data.tenantName} • Página ${i}/${total}`, 12, PH - 12);
    doc.text("Consulte a Central de Conhecimento para entender cálculos e classificações.", 12, PH - 7);
  }

  doc.save(`relatorio-institucional-${data.school.name.replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Helper para silenciar warning sobre uso unused do TEST_META/Classifications quando o consumidor não usa
export const _internalRefs = { TEST_META, _c: null as Classifications | null };

// ===========================================================================
// RELATÓRIO COMPLETO — Aluno (6 páginas com método, radar textual, evolução,
// comparação com turma, análise automática e histórico). Quando dados extras
// não estiverem disponíveis, as seções correspondentes mostram orientações.
// ===========================================================================
export type PdfBranding = {
  displayName: string;
  primaryColor: [number, number, number];
  secondaryColor: [number, number, number];
  logoDataUrl?: string | null;
  website?: string;
  email?: string;
  phone?: string;
};

export type CompleteReportExtras = {
  history?: ReportEval[]; // evaluations do aluno em ordem cronológica
  classAverage?: Partial<Record<keyof Classifications, Zone>>;
  schoolAverage?: Partial<Record<keyof Classifications, Zone>>;
  className?: string;
  studentPhotoDataUrl?: string | null;
  branding?: PdfBranding;
};

function header(doc: jsPDF, title: string, subtitle?: string, brand: [number, number, number] = PRIMARY, logo?: string | null) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(brand[0], brand[1], brand[2]);
  doc.rect(0, 0, W, 22, "F");
  if (logo) {
    try { doc.addImage(logo, "PNG", W - 24, 4, 14, 14); } catch { /* ignore */ }
  }
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
  doc.text(title, 12, 11);
  if (subtitle) {
    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.text(subtitle, 12, 17);
  }
  doc.setTextColor(20);
}

// Desenha radar vetorial. `series`: rótulo → valores normalizados [0..1] por eixo.
function drawRadar(
  doc: jsPDF,
  cx: number, cy: number, radius: number,
  axes: string[],
  series: { name: string; values: number[]; color: [number, number, number] }[],
) {
  const N = axes.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
  // Grid concêntrico
  doc.setDrawColor(210).setLineWidth(0.2);
  for (let r = 1; r <= 5; r++) {
    const rr = (radius * r) / 5;
    const pts: [number, number][] = [];
    for (let i = 0; i < N; i++) pts.push([cx + rr * Math.cos(angle(i)), cy + rr * Math.sin(angle(i))]);
    for (let i = 0; i < N; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % N];
      doc.line(x1, y1, x2, y2);
    }
  }
  // Eixos
  doc.setDrawColor(180);
  for (let i = 0; i < N; i++) {
    doc.line(cx, cy, cx + radius * Math.cos(angle(i)), cy + radius * Math.sin(angle(i)));
  }
  // Labels
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(60);
  for (let i = 0; i < N; i++) {
    const x = cx + (radius + 8) * Math.cos(angle(i));
    const y = cy + (radius + 8) * Math.sin(angle(i));
    doc.text(axes[i], x, y, { align: "center", baseline: "middle" });
  }
  // Séries
  for (const s of series) {
    const pts = s.values.map((v, i) => {
      const r = Math.max(0, Math.min(1, v)) * radius;
      return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))] as [number, number];
    });
    doc.setDrawColor(...s.color).setLineWidth(0.8);
    doc.setFillColor(s.color[0], s.color[1], s.color[2]);
    // Polygon outline
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      doc.line(x1, y1, x2, y2);
    }
    // Vertex dots
    for (const [x, y] of pts) doc.circle(x, y, 0.8, "F");
  }
  // Legenda
  doc.setFontSize(8);
  series.forEach((s, i) => {
    const ly = cy + radius + 14 + i * 5;
    doc.setFillColor(s.color[0], s.color[1], s.color[2]);
    doc.rect(cx - radius, ly - 2.5, 3, 3, "F");
    doc.setTextColor(60).text(s.name, cx - radius + 5, ly);
  });
}

function drawLineChart(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  labels: string[], values: number[], yMax: number,
  color: [number, number, number] = PRIMARY,
) {
  // Eixos
  doc.setDrawColor(180).setLineWidth(0.2);
  doc.line(x, y, x, y + h); doc.line(x, y + h, x + w, y + h);
  // Grid horizontal (5 níveis)
  doc.setDrawColor(225);
  doc.setFontSize(7).setTextColor(120);
  for (let i = 0; i <= 5; i++) {
    const yy = y + h - (h * i) / 5;
    doc.line(x, yy, x + w, yy);
    doc.text(String(Math.round((yMax * i) / 5)), x - 2, yy, { align: "right", baseline: "middle" });
  }
  // Pontos + linha
  if (!values.length) return;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const pt = (i: number, v: number) => [x + i * step, y + h - (Math.max(0, Math.min(yMax, v)) / yMax) * h] as [number, number];
  doc.setDrawColor(...color).setLineWidth(0.8);
  for (let i = 0; i < values.length - 1; i++) {
    const [x1, y1] = pt(i, values[i]);
    const [x2, y2] = pt(i + 1, values[i + 1]);
    doc.line(x1, y1, x2, y2);
  }
  doc.setFillColor(color[0], color[1], color[2]);
  values.forEach((v, i) => { const [px, py] = pt(i, v); doc.circle(px, py, 1.2, "F"); });
  // Labels eixo X
  doc.setFontSize(7).setTextColor(120);
  labels.forEach((l, i) => {
    const [px] = pt(i, 0);
    doc.text(l, px, y + h + 4, { align: "center" });
  });
}

export function generateEvaluationPDFComplete(
  tenantName: string,
  ev: ReportEval,
  extras: CompleteReportExtras = {},
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const score = overallScore(ev.classifications ?? {});
  const BR: [number, number, number] = extras.branding?.primaryColor ?? PRIMARY;
  const BR2: [number, number, number] = extras.branding?.secondaryColor ?? [16, 185, 129];
  const brandName = extras.branding?.displayName ?? tenantName;
  const logo = extras.branding?.logoDataUrl ?? null;
  const photo = extras.studentPhotoDataUrl ?? null;

  // ---------- Página 1 — Capa ----------
  doc.setFillColor(BR[0], BR[1], BR[2]);
  doc.rect(0, 0, W, PH, "F");
  // Faixa secundária decorativa
  doc.setFillColor(BR2[0], BR2[1], BR2[2]);
  doc.rect(0, PH - 28, W, 6, "F");
  // Logo da escola (canto sup. esq.)
  if (logo) { try { doc.addImage(logo, "PNG", 16, 18, 22, 22); } catch { /* ignore */ } }
  // Nome institucional
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(12);
  doc.text(brandName, logo ? 42 : 16, 28);
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text("Relatório Evolutivo do Aluno", logo ? 42 : 16, 34);


  // Foto do aluno (se houver)
  if (photo) { try { doc.addImage(photo, "JPEG", W - 50, 50, 36, 44); } catch { /* ignore */ } }

  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(28);
  doc.text("Relatório", 16, 70);
  doc.text("Evolutivo", 16, 82);


  doc.setFont("helvetica", "bold").setFontSize(20);
  doc.text(ev.student.full_name, 16, 108);
  doc.setFont("helvetica", "normal").setFontSize(11);
  const sexLabel = ev.student.sex === "male" ? "Masculino" : "Feminino";
  doc.text(`${sexLabel}  •  ${ev.age_years ?? "—"} anos`, 16, 116);
  if (extras.className) doc.text(`Turma: ${extras.className}`, 16, 123);
  doc.text(`Avaliado em ${new Date(ev.evaluated_at).toLocaleDateString("pt-BR")}`, 16, 130);

  // Card: Índice ProMetric
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(16, 150, W - 32, 50, 4, 4, "F");
  doc.setTextColor(80).setFont("helvetica", "normal").setFontSize(10);
  doc.text("Índice ProMetric", 24, 162);
  doc.setTextColor(BR[0], BR[1], BR[2]).setFont("helvetica", "bold").setFontSize(36);
  doc.text(`${Math.round((score.score / 6) * 100)}`, 24, 186);
  doc.setFontSize(12).setTextColor(120);
  doc.text("/ 100", 60, 186);
  doc.setTextColor(40).setFont("helvetica", "bold").setFontSize(14);
  doc.text("Classificação Geral", 100, 162);
  doc.setTextColor(BR[0], BR[1], BR[2]).setFontSize(18);
  doc.text(score.label ?? "—", 100, 178);

  // Rodapé institucional
  doc.setTextColor(255).setFont("helvetica", "normal").setFontSize(9);
  doc.text(brandName, 16, PH - 14);
  const contact = [extras.branding?.website, extras.branding?.email, extras.branding?.phone].filter(Boolean).join("  •  ");
  if (contact) doc.text(contact, 16, PH - 8);
  doc.text(new Date().toLocaleDateString("pt-BR"), W - 16, PH - 8, { align: "right" });

  // ---------- Página 2 — Antropometria + Testes ----------
  doc.addPage();
  header(doc, "Antropometria e Testes Físicos", ev.student.full_name, BR, logo);
  autoTable(doc, {
    startY: 28,
    head: [["Antropometria", "Valor"]],
    body: [
      ["Peso (kg)", ev.weight_kg ?? "—"],
      ["Estatura (cm)", ev.height_cm ?? "—"],
      ["Envergadura (cm)", ev.wingspan_cm ?? "—"],
      ["Cintura (cm)", ev.waist_cm ?? "—"],
      ["Quadril (cm)", ev.hip_cm ?? "—"],
      ["IMC", ev.imc ?? "—"],
      ["RCE", ev.rce ?? "—"],
    ],
    theme: "striped",
    headStyles: { fillColor: BR, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 12, right: 12 },
  });
  const testRows = Object.entries(TEST_META)
    .filter(([k]) => !["imc", "rce"].includes(k))
    .map(([k, meta]) => {
      const value = (ev as any)[meta.field] ?? "—";
      const z = ev.classifications?.[k as keyof Classifications] ?? "—";
      return [meta.label, `${value} ${meta.unit}`, z];
    });
  autoTable(doc, {
    head: [["Teste ProMetric", "Resultado", "Classificação"]],
    body: testRows,
    theme: "striped",
    headStyles: { fillColor: BR, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 12, right: 12 },
  });

  // ---------- Página 3 — Perfil Físico / Radar completo ----------
  doc.addPage();
  header(doc, "Perfil Físico — Radar Completo", ev.student.full_name, BR, logo);
  const dims: [string, (keyof Classifications)[]][] = [
    ["Saúde Corporal", ["imc", "rce"]],
    ["Resistência", ["abdo", "run6"]],
    ["Mobilidade", ["flex"]],
    ["Potência", ["jump", "mball"]],
    ["Velocidade", ["sprint"]],
    ["Agilidade", ["square"]],
  ];
  const dimData = dims.map(([name, keys]) => {
    const zs = keys.map((k) => ev.classifications?.[k]).filter(Boolean) as Zone[];
    const avgIdx = zs.length ? zs.reduce((a, z) => a + ZONES.indexOf(z), 0) / zs.length : -1;
    const avgLabel = avgIdx >= 0 ? ZONES[Math.round(avgIdx)] : "—";
    return { name, keys, avgIdx, avgLabel };
  });
  const histSorted = (extras.history ?? []).slice().sort((a, b) => a.evaluated_at.localeCompare(b.evaluated_at));
  const firstEv = histSorted[0];
  const hasEvo = histSorted.length >= 2 && firstEv && firstEv.id !== ev.id;
  const firstDimValues = hasEvo
    ? dims.map(([, keys]) => {
        const zs = keys.map((k) => firstEv!.classifications?.[k]).filter(Boolean) as Zone[];
        return zs.length ? zs.reduce((a, z) => a + ZONES.indexOf(z), 0) / zs.length / 5 : 0;
      })
    : null;
  if (hasEvo) {
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(80);
    doc.text(`Inicial: ${new Date(firstEv!.evaluated_at).toLocaleDateString("pt-BR")}  •  Atual: ${new Date(ev.evaluated_at).toLocaleDateString("pt-BR")}`, W / 2, 32, { align: "center" });
  }
  drawRadar(
    doc,
    W / 2, 95, 44,
    dimData.map((d) => d.name),
    [
      ...(firstDimValues ? [{ name: "Inicial", values: firstDimValues, color: [148, 163, 184] as [number, number, number] }] : []),
      { name: hasEvo ? "Atual" : ev.student.full_name, values: dimData.map((d) => d.avgIdx >= 0 ? d.avgIdx / 5 : 0), color: BR },
    ],
  );

  autoTable(doc, {
    startY: 170,
    head: [["Dimensão", "Componentes", "Classificação"]],
    body: dimData.map((d) => [d.name, d.keys.map((k) => TEST_META[k as keyof typeof TEST_META]?.label).join(", "), d.avgLabel]),
    theme: "striped",
    headStyles: { fillColor: BR, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 12, right: 12 },
  });

  // ---------- Página 4 — Evolução ----------
  doc.addPage();
  header(doc, "Evolução Temporal", ev.student.full_name, BR, logo);
  const hist = (extras.history ?? []).slice().sort((a, b) => a.evaluated_at.localeCompare(b.evaluated_at));
  if (hist.length >= 2) {
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(40);
    doc.text("Índice ProMetric ao longo do tempo (0–6)", 16, 32);
    drawLineChart(
      doc,
      24, 38, W - 36, 50,
      hist.map((h) => new Date(h.evaluated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })),
      hist.map((h) => overallScore(h.classifications ?? {}).score),
      6,
      BR,
    );
    const first = hist[0], last = hist[hist.length - 1];
    const evoRows = Object.entries(TEST_META).map(([k, m]) => {
      const a = (first as any)[m.field], b = (last as any)[m.field];
      const delta = (typeof a === "number" && typeof b === "number") ? (b - a).toFixed(2) : "—";
      return [m.label, a ?? "—", b ?? "—", delta];
    });
    autoTable(doc, {
      startY: 100,
      head: [["Métrica", "Primeira avaliação", "Última avaliação", "Δ"]],
      body: evoRows,
      theme: "striped",
      headStyles: { fillColor: BR, textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9 },
      margin: { left: 12, right: 12 },
    });
  } else {
    doc.setFontSize(10).setTextColor(80);
    doc.text("Histórico insuficiente para análise evolutiva. Realize novas avaliações periódicas.", 12, 36);
  }

  // ---------- Página 5 — Comparativos ----------
  doc.addPage();
  header(doc, "Comparativos — Turma e Escola", ev.student.full_name, BR, logo);
  const dimZoneAvg = (src: Classifications | undefined) => dims.map(([, keys]) => {
    const zs = keys.map((k) => src?.[k]).filter(Boolean) as Zone[];
    return zs.length ? (zs.reduce((a, z) => a + ZONES.indexOf(z), 0) / zs.length) / 5 : 0;
  });
  drawRadar(
    doc,
    W / 2, 90, 40,
    dims.map(([n]) => n),
    [
      { name: "Aluno", values: dimZoneAvg(ev.classifications), color: BR },
      ...(extras.classAverage ? [{ name: "Turma", values: dimZoneAvg(extras.classAverage), color: BR2 }] : []),
      ...(extras.schoolAverage ? [{ name: "Escola", values: dimZoneAvg(extras.schoolAverage), color: [245, 158, 11] as [number, number, number] }] : []),
    ],
  );
  const cmpRows = Object.entries(TEST_META).map(([k, m]) => {
    const z = ev.classifications?.[k as keyof Classifications] ?? "—";
    const cz = extras.classAverage?.[k as keyof Classifications] ?? "—";
    const sz = extras.schoolAverage?.[k as keyof Classifications] ?? "—";
    return [m.label, z, cz, sz];
  });
  autoTable(doc, {
    startY: 160,
    head: [["Métrica", "Aluno", "Média da turma", "Média da escola"]],
    body: cmpRows,
    theme: "striped",
    headStyles: { fillColor: BR, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 12, right: 12 },
  });

  // ---------- Página 6 — Análise Inteligente + Plano de Desenvolvimento ----------
  doc.addPage();
  header(doc, "Análise Inteligente & Plano de Desenvolvimento", ev.student.full_name, BR, logo);

  // Classifica testes em pontos fortes / atenção
  const entries = Object.entries(ev.classifications ?? {}) as [keyof Classifications, Zone][];
  const strong = entries.filter(([, z]) => z === "Bom" || z === "Muito Bom" || z === "Excelente");
  const attention = entries.filter(([, z]) => z === "Fraco" || z === "Muito Fraco");
  const label = (k: keyof Classifications) => TEST_META[k as keyof typeof TEST_META]?.label ?? String(k);

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(BR[0], BR[1], BR[2]);
  doc.text("Pontos Fortes", 12, 32);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(40);
  const strongText = strong.length ? strong.map(([k, z]) => `• ${label(k)} — ${z}`).join("\n") : "• Continuar trabalhando todas as dimensões para consolidar evolução.";
  doc.text(doc.splitTextToSize(strongText, W - 24), 12, 38);

  let y = 38 + Math.max(1, strong.length || 1) * 5 + 6;
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(BR[0], BR[1], BR[2]);
  doc.text("Pontos de Atenção", 12, y);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(40);
  const attText = attention.length ? attention.map(([k, z]) => `• ${label(k)} — ${z}`).join("\n") : "• Nenhum indicador em zona crítica nesta avaliação.";
  doc.text(doc.splitTextToSize(attText, W - 24), 12, y + 6);
  y = y + 6 + Math.max(1, attention.length || 1) * 5 + 6;

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(BR[0], BR[1], BR[2]);
  doc.text("Recomendações", 12, y);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(40);
  const diag = ev.ai_diagnosis || "Manter rotina semanal de atividade física, hidratação adequada e sono regular. Reavaliar em 90 dias.";
  doc.text(doc.splitTextToSize(diag, W - 24), 12, y + 6);

  // Plano 30/60/90
  autoTable(doc, {
    startY: y + 6 + Math.ceil(doc.splitTextToSize(diag, W - 24).length) * 4 + 10,
    head: [["Período", "Meta", "Foco"]],
    body: [
      ["30 dias", "Consolidar rotina semanal de 3 sessões", attention[0] ? label(attention[0][0]) : "Resistência aeróbica"],
      ["60 dias", "Evoluir 1 zona em indicador de atenção", attention[1] ? label(attention[1][0]) : "Potência de membros inferiores"],
      ["90 dias", "Reavaliação ProMetric completa", "Comparar com baseline e ajustar plano"],
    ],
    theme: "striped",
    headStyles: { fillColor: BR, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left: 12, right: 12 },
  });

  // Rodapé institucional em todas páginas (exceto capa)
  const total = doc.getNumberOfPages();
  const footerContact = [extras.branding?.website, extras.branding?.email, extras.branding?.phone].filter(Boolean).join("  •  ");
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(BR[0], BR[1], BR[2]).setLineWidth(0.4);
    doc.line(12, PH - 16, W - 12, PH - 16);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
    doc.text(`${brandName} • Página ${i}/${total}`, 12, PH - 11);
    if (footerContact) doc.text(footerContact, 12, PH - 6);
    doc.text(`Relatório gerado em ${new Date().toLocaleDateString("pt-BR")}`, W - 12, PH - 6, { align: "right" });
  }

  doc.save(`relatorio-evolutivo-${ev.student.full_name.replace(/\s+/g, "_")}-${ev.evaluated_at}.pdf`);
}
