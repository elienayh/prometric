// PDF report shared by Class and Group dashboards.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CohortAggregates } from "./cohort-stats";

const DEFAULT_PRIMARY: [number, number, number] = [37, 99, 235];

export type CohortReportInput = {
  kind: "Turma" | "Grupo" | "Escola";
  tenantName: string;
  cohortName: string;
  subtitle?: string;
  agg: CohortAggregates;
  rankings: { title: string; rows: { full_name: string; value: number | string; unit?: string }[] }[];
  branding?: {
    primaryColor?: [number, number, number];
    logoDataUrl?: string | null;
    displayName?: string;
  };
};

export function generateCohortPDF(input: CohortReportInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const PRIMARY = input.branding?.primaryColor ?? DEFAULT_PRIMARY;
  const logo = input.branding?.logoDataUrl ?? null;
  const brandName = input.branding?.displayName ?? input.tenantName;

  // Capa
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, 0, W, PH, "F");
  if (logo) {
    try { doc.addImage(logo, "PNG", 16, 18, 28, 28); } catch {}
  }
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(28);
  doc.text(`Relatório de ${input.kind}`, 16, 60);
  doc.setFontSize(20);
  doc.text(input.cohortName, 16, 75);
  if (input.subtitle) {
    doc.setFont("helvetica", "normal").setFontSize(12);
    doc.text(input.subtitle, 16, 86);
  }
  doc.setFont("helvetica", "normal").setFontSize(11);
  doc.text(`Índice médio ProMetric: ${input.agg.avgScore}/100`, 16, 110);
  doc.text(`Classificação média: ${input.agg.avgCategory ?? "—"}`, 16, 118);
  doc.text(`Alunos avaliados: ${input.agg.evaluatedCount}`, 16, 126);
  doc.setFontSize(9);
  doc.text(`Gerado por ProMetric — ${brandName}`, 16, PH - 24);
  doc.text(new Date().toLocaleDateString("pt-BR"), 16, PH - 16);

  // Página 2 — Distribuição
  doc.addPage();
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]).rect(0, 0, W, 18, "F");
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
  doc.text("Distribuição dos Perfis", 12, 12);
  doc.setTextColor(20);
  autoTable(doc, {
    startY: 28,
    head: [["Categoria", "Alunos", "%"]],
    body: input.agg.distribution.map((d) => [d.category, String(d.count), `${d.pct}%`]),
    theme: "striped",
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 12, right: 12 },
  });

  // Dimensões
  autoTable(doc, {
    head: [["Dimensão", "Score médio (0-100)"]],
    body: input.agg.dimensions.map((d) => [d.dimension, String(d.score)]),
    theme: "striped",
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 12, right: 12 },
  });

  // Página 3+ — Rankings
  for (const r of input.rankings) {
    doc.addPage();
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]).rect(0, 0, W, 18, "F");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
    doc.text(r.title, 12, 12);
    doc.setTextColor(20);
    autoTable(doc, {
      startY: 28,
      head: [["#", "Aluno", "Valor"]],
      body: r.rows.length
        ? r.rows.map((row, i) => [String(i + 1), row.full_name, `${row.value}${row.unit ? " " + row.unit : ""}`])
        : [["—", "—", "—"]],
      theme: "striped",
      headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9 },
      margin: { left: 12, right: 12 },
    });
  }

  // Alunos em atenção
  if (input.agg.atRisk.length) {
    doc.addPage();
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]).rect(0, 0, W, 18, "F");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(13);
    doc.text("Alunos em Atenção", 12, 12);
    doc.setTextColor(20);
    autoTable(doc, {
      startY: 28,
      head: [["Aluno", "Índice", "Categoria"]],
      body: input.agg.atRisk.map((s) => [s.full_name, String(s.score), s.category ?? "—"]),
      theme: "striped",
      headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10 },
      margin: { left: 12, right: 12 },
    });
  }

  // Footer
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(140);
    doc.text(`ProMetric • ${input.tenantName} • ${input.cohortName} • Página ${i}/${total}`, 12, PH - 10);
  }

  const safe = input.cohortName.replace(/\s+/g, "_");
  doc.save(`relatorio-${input.kind.toLowerCase()}-${safe}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
