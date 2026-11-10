// PDF report shared by Class, Group and School dashboards.
// Implements positive reinforcement (Anti-bullying), visual charts (Donut & Radar via Canvas),
// 2-column grid layout for highlights (Top 5 / Top 3) and page economy.

import { formatDateBR } from "./age";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CohortAggregates, DimensionAvg, DistributionRow } from "./cohort-stats";

const DEFAULT_PRIMARY: [number, number, number] = [37, 99, 235]; // blue-600

export type CohortRankingRow = {
  full_name: string;
  value: number | string;
  unit?: string;
};

export type CohortRanking = {
  title: string;
  rows: CohortRankingRow[];
};

export type CohortReportInput = {
  kind: "Turma" | "Grupo" | "Escola";
  tenantName: string;
  cohortName: string;
  subtitle?: string;
  agg: CohortAggregates;
  rankings: CohortRanking[];
  branding?: {
    primaryColor?: [number, number, number];
    logoDataUrl?: string | null;
    displayName?: string;
  };
};

/**
 * Renderiza Gráfico de Rosca (Donut Chart) em alta resolução via HTML5 Canvas
 */
function renderDonutChartCanvas(distribution: DistributionRow[], size = 480): string | null {
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const total = distribution.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) return null;

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size * 0.44;
    const innerR = size * 0.25;

    let currentAngle = -Math.PI / 2;
    for (const item of distribution) {
      if (item.count <= 0) continue;
      const sliceAngle = (item.count / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, currentAngle, currentAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();

      ctx.fillStyle = item.color || "#6366f1";
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      currentAngle += sliceAngle;
    }

    // Centro do Donut com total de avaliados
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 46px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(total), cx, cy - 8);

    ctx.fillStyle = "#64748b";
    ctx.font = "16px sans-serif";
    ctx.fillText("avaliados", cx, cy + 24);

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Renderiza Gráfico de Radar (Spider Web Chart) em alta resolução via HTML5 Canvas
 */
function renderRadarChartCanvas(
  dimensions: DimensionAvg[],
  primaryColor: [number, number, number],
  size = 540,
): string | null {
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const items = dimensions.filter((d) => d.score !== undefined && d.score !== null);
    const n = items.length;
    if (n < 3) return null;

    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.35;
    const angleStep = (2 * Math.PI) / n;

    // 1. Teia concêntrica poligonal (níveis: 20, 40, 60, 80, 100)
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;

    for (const lvl of levels) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + Math.cos(angle) * maxR * lvl;
        const y = cy + Math.sin(angle) * maxR * lvl;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 2. Raios estruturais
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 3. Polígono preenchido com dados da turma
    ctx.beginPath();
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const scorePct = Math.max(0, Math.min(100, items[i].score)) / 100;
      const r = maxR * scorePct;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      points.push({ x, y });
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = `rgba(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]}, 0.28)`;
    ctx.fill();

    ctx.strokeStyle = `rgb(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. Vértices circulares
    for (const pt of points) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = `rgb(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]})`;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 5. Rótulos perimétricos
    ctx.fillStyle = "#334155";
    ctx.font = "bold 15px sans-serif";
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const labelR = maxR + 24;
      const lx = cx + Math.cos(angle) * labelR;
      const ly = cy + Math.sin(angle) * labelR;

      ctx.textAlign = Math.abs(Math.cos(angle)) < 0.2 ? "center" : Math.cos(angle) > 0 ? "left" : "right";
      ctx.textBaseline = Math.abs(Math.sin(angle)) < 0.2 ? "middle" : Math.sin(angle) > 0 ? "top" : "bottom";
      ctx.fillText(`${items[i].dimension} (${Math.round(items[i].score)})`, lx, ly);
    }

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export function generateCohortPDF(input: CohortReportInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth(); // 210mm
  const PH = doc.internal.pageSize.getHeight(); // 297mm
  const PRIMARY = input.branding?.primaryColor ?? DEFAULT_PRIMARY;
  const logo = input.branding?.logoDataUrl ?? null;
  const brandName = input.branding?.displayName ?? input.tenantName;

  // Regra de Negócio Antibullying:
  // Se a turma tiver menos de 6 alunos com dados, mostra Top 3; caso contrário, Top 5.
  const evaluatedCount = input.agg.evaluatedCount || 0;
  const topLimit = evaluatedCount < 6 ? 3 : 5;

  // ===========================================================================
  // PÁGINA 1 — Capa Executiva Profissional
  // ===========================================================================
  // Fundo com degradê de cor e cabeçalho primário
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, 0, W, 105, "F");

  // Logo da instituição / ProMetric
  if (logo) {
    try {
      doc.addImage(logo, "PNG", 16, 16, 26, 26);
    } catch {}
  }

  // Título e identificação da turma
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(26);
  doc.text(`Relatório da ${input.kind}`, 16, 56);

  doc.setFontSize(20);
  doc.text(input.cohortName, 16, 68);

  if (input.subtitle) {
    doc.setFont("helvetica", "normal").setFontSize(11);
    doc.setTextColor(230, 240, 255);
    doc.text(input.subtitle, 16, 78);
  }

  // Cards de Resumo Executivo (Painel Branco)
  const cardY = 92;
  const cardW = (W - 32 - 12) / 3; // 3 cartões alinhados
  const cardH = 36;

  // Card 1: Índice Médio ProMetric
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(16, cardY, cardW, cardH, 3, 3, "FD");
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100);
  doc.text("ÍNDICE MÉDIO", 22, cardY + 12);
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text(`${input.agg.avgScore}/100`, 22, cardY + 24);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  doc.text("Classificação geral", 22, cardY + 31);

  // Card 2: Classificação Predominante
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(16 + cardW + 6, cardY, cardW, cardH, 3, 3, "FD");
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100);
  doc.text("CLASSIFICAÇÃO", 22 + cardW + 6, cardY + 12);
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(30);
  doc.text(input.agg.avgCategory ?? "—", 22 + cardW + 6, cardY + 23);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  doc.text("Média da turma", 22 + cardW + 6, cardY + 31);

  // Card 3: Alunos Avaliados
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(16 + (cardW + 6) * 2, cardY, cardW, cardH, 3, 3, "FD");
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100);
  doc.text("ALUNOS AVALIADOS", 22 + (cardW + 6) * 2, cardY + 12);
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(30);
  doc.text(String(evaluatedCount), 22 + (cardW + 6) * 2, cardY + 24);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  doc.text(`de ${input.agg.studentCount} matriculados`, 22 + (cardW + 6) * 2, cardY + 31);

  // Bloco institucional explicativo
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(30);
  doc.text("Sobre este Relatório", 16, 146);

  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(70);
  const infoText = [
    `Este documento apresenta o diagnóstico integrado de aptidão física e motora da ${input.kind.toLowerCase()} "${input.cohortName}".`,
    `As métricas baseiam-se no método ProMetric e nos critérios normativos do ProESP-BR, avaliando 6 dimensões fundamentais: Saúde Corporal, Força Muscular, Aptidão Cardiorrespiratória (Resistência), Agilidade, Velocidade e Flexibilidade.`,
    `O objetivo central é o reforço positivo, acompanhamento do desenvolvimento motor coletivo e apoio ao planejamento pedagógico da Educação Física escolar.`,
  ];
  let curY = 154;
  for (const line of infoText) {
    const split = doc.splitTextToSize(line, W - 32);
    doc.text(split, 16, curY);
    curY += split.length * 5 + 3;
  }

  // Rodapé da capa
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(120);
  doc.text(`Instituição: ${brandName}`, 16, PH - 24);
  doc.text(`Data de Emissão: ${formatDateBR(new Date())} • ProMetric Education Systems`, 16, PH - 18);

  // ===========================================================================
  // PÁGINA 2 — Visão Geral & Indicadores Visuais (Gráficos Donut + Radar)
  // ===========================================================================
  doc.addPage();

  // Header superior
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]).rect(0, 0, W, 14, "F");
  doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(11);
  doc.text(`PROMETRIC • INDICADORES VISUAIS DA ${input.kind.toUpperCase()}`, 14, 9.5);

  // Seção 1: Distribuição dos Perfis (Gráfico de Rosca + Tabela ao lado)
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(30);
  doc.text("1. Distribuição Geral dos Níveis de Aptidão Física", 14, 24);

  const donutDataUrl = renderDonutChartCanvas(input.agg.distribution, 420);
  if (donutDataUrl) {
    try {
      doc.addImage(donutDataUrl, "PNG", 14, 28, 62, 62);
    } catch {}
  }

  // Tabela ao lado do gráfico de rosca
  autoTable(doc, {
    startY: 28,
    margin: { left: 82, right: 14 },
    head: [["Nível de Aptidão", "Alunos", "% Turma"]],
    body: input.agg.distribution.map((d) => [d.category, String(d.count), `${d.pct}%`]),
    theme: "striped",
    headStyles: {
      fillColor: PRIMARY,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: 40,
    },
    columnStyles: {
      0: { cellWidth: "auto", fontStyle: "bold" },
      1: { halign: "center", cellWidth: 24 },
      2: { halign: "center", cellWidth: 24 },
    },
  });

  // Seção 2: Dimensões Médias (Gráfico de Radar + Tabela ao lado)
  const radarStartY = 104;
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(30);
  doc.text("2. Desempenho Médio por Dimensão Motora (Gráfico de Radar)", 14, radarStartY);

  const radarDataUrl = renderRadarChartCanvas(input.agg.dimensions, PRIMARY, 520);
  if (radarDataUrl) {
    try {
      doc.addImage(radarDataUrl, "PNG", 14, radarStartY + 4, 78, 78);
    } catch {}
  }

  // Tabela ao lado do gráfico de radar
  autoTable(doc, {
    startY: radarStartY + 4,
    margin: { left: 96, right: 14 },
    head: [["Dimensão Avaliada", "Média (0-100)"]],
    body: input.agg.dimensions.map((d) => [
      d.dimension,
      `${Math.round(d.score)} pts`,
    ]),
    theme: "striped",
    headStyles: {
      fillColor: PRIMARY,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: 40,
    },
    columnStyles: {
      0: { cellWidth: "auto", fontStyle: "bold" },
      1: { halign: "center", cellWidth: 32 },
    },
  });

  // Nota de rodapé da página 2
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  doc.text(
    "* O índice médio sintetiza indicadores de saúde e desempenho motor conforme os pontos de corte ProESP-BR.",
    14,
    PH - 16,
  );

  // ===========================================================================
  // PÁGINA 3 — Destaques e Reconhecimento Positivo (Grade Lado a Lado)
  // ===========================================================================
  // Filtro Antibullying:
  // 1. Remove Alunos em Atenção completamente.
  // 2. Limita para Top 5 (ou Top 3 em turmas menores que 6 alunos).
  // 3. Omite categorias que estejam vazias (sem dados válidos).
  const sanitizedRankings: { title: string; rows: CohortRankingRow[] }[] = [];

  for (const r of input.rankings) {
    // Filtra linhas válidas que tenham pontuação real (não traço, não vazio)
    const validRows = (r.rows ?? []).filter((row) => {
      const v = String(row.value).trim();
      return v !== "" && v !== "—" && v !== "null" && v !== "undefined" && v !== "0" && v !== "+0";
    });

    // Se estiver vazia, omite a seção inteira!
    if (validRows.length === 0) continue;

    // Ajusta o título para refletir Top 5 ou Top 3
    const cleanTitle = r.title
      .replace(/Top\s*10/gi, `Top ${topLimit}`)
      .replace(/Top\s*15/gi, `Top ${topLimit}`);

    sanitizedRankings.push({
      title: cleanTitle.includes("Top") ? cleanTitle : `Top ${topLimit} — ${cleanTitle}`,
      rows: validRows.slice(0, topLimit),
    });
  }

  // Se existirem rankings com dados, renderiza a página de Destaques
  if (sanitizedRankings.length > 0) {
    doc.addPage();

    // Header da página de destaques
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]).rect(0, 0, W, 14, "F");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(11);
    doc.text(`PROMETRIC • DESTAQUES E RECONHECIMENTO DA ${input.kind.toUpperCase()}`, 14, 9.5);

    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(100);
    doc.text(
      `Reconhecimento dos melhores índices individuais da turma (Top ${topLimit} por valência motora).`,
      14,
      22,
    );

    // Layout em Grade de 2 Colunas lado a lado
    // Coluna 1: x = 14mm, largura = 88mm
    // Coluna 2: x = 108mm, largura = 88mm
    const colWidth = 88;
    const colLeftX = 14;
    const colRightX = 108;

    let yPosLeft = 28;
    let yPosRight = 28;

    for (let i = 0; i < sanitizedRankings.length; i++) {
      const r = sanitizedRankings[i];
      const isLeft = i % 2 === 0;
      const startX = isLeft ? colLeftX : colRightX;
      let startY = isLeft ? yPosLeft : yPosRight;

      // Se a página estiver prestes a estourar, cria nova página
      if (startY > PH - 45) {
        doc.addPage();
        doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]).rect(0, 0, W, 14, "F");
        doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(11);
        doc.text(`PROMETRIC • DESTAQUES (CONTINUAÇÃO)`, 14, 9.5);
        yPosLeft = 24;
        yPosRight = 24;
        startY = 24;
      }

      autoTable(doc, {
        startY,
        margin: { left: startX, right: W - (startX + colWidth) },
        tableWidth: colWidth,
        head: [[{ content: r.title, colSpan: 3, styles: { halign: "left", fillColor: PRIMARY } }]],
        body: r.rows.map((row, idx) => [
          String(idx + 1),
          row.full_name,
          `${row.value}${row.unit ? " " + row.unit : ""}`,
        ]),
        theme: "striped",
        headStyles: {
          textColor: 255,
          fontStyle: "bold",
          fontSize: 8.5,
          cellPadding: 2,
        },
        styles: {
          fontSize: 8,
          cellPadding: 1.8,
          textColor: 40,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center", fontStyle: "bold" },
          1: { cellWidth: "auto" },
          2: { cellWidth: 24, halign: "right", fontStyle: "bold" },
        },
      });

      // Atualiza o Y para a próxima tabela na respectiva coluna
      // @ts-expect-error jsPDF autotable injects lastAutoTable on doc
      const finalY = (doc.lastAutoTable?.finalY ?? startY + 30) + 6;
      if (isLeft) {
        yPosLeft = finalY;
      } else {
        yPosRight = finalY;
      }
    }
  }

  // ===========================================================================
  // Numeração e Rodapé Global
  // ===========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(130);
    doc.text(
      `ProMetric • ${brandName} • ${input.cohortName} • Página ${i} de ${totalPages}`,
      14,
      PH - 8,
    );
  }

  const safeName = input.cohortName.replace(/\s+/g, "_");
  doc.save(`relatorio-${input.kind.toLowerCase()}-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
