// Camada 4 — Guardrails determinísticos pós-geração.
// Executados server-side ANTES de salvar/exibir. Bloqueiam divergências do
// Modelo ProMetric® mesmo que o LLM tente fugir do schema/glossário.

import { PROMETRIC_CATEGORIES, PROMETRIC_PROMPT_VERSION } from "./prometric-system-prompt";
import type { StudentInsights } from "./prometric-schemas";

// Termos técnicos que NÃO devem vazar ao usuário final.
const FORBIDDEN_TERMS = [
  /\bPROESP(?:-BR)?\b/gi,
  /\bz[\s-]?score\b/gi,
  /\bpercentil\b/gi,
  /\bdesvio[\s-]?padrão\b/gi,
  /\bdesvio[\s-]?padrao\b/gi,
];

// Categorias inventadas que aparecem ocasionalmente.
const FORBIDDEN_CATEGORIES = [
  /\bRegular\b/g,
  /\bMédio\b/g,
  /\bMedio\b/g,
  /\bÓtimo\b/g,
  /\bOtimo\b/g,
  /\bRuim\b/g,
];

export type GuardrailReport = {
  ok: boolean;
  fixed: string[];
  blocked: string[];
};

function sanitizeText(input: string, report: GuardrailReport): string {
  let out = input;
  for (const re of FORBIDDEN_TERMS) {
    if (re.test(out)) {
      report.blocked.push(`Termo técnico removido: ${re.source}`);
      out = out.replace(re, "");
    }
  }
  for (const re of FORBIDDEN_CATEGORIES) {
    if (re.test(out)) {
      report.blocked.push(`Categoria não-ProMetric removida: ${re.source}`);
      // Substitui por categoria válida mais próxima conservadora
      out = out.replace(re, "Em Desenvolvimento");
    }
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

/**
 * Aplica guardrails sobre o parecer gerado.
 * - Sobrescreve `categoria_geral` se divergir do cálculo determinístico do ProMetric.
 * - Remove termos técnicos vazados.
 * - Garante assinatura ProMetric® no final.
 */
export function applyStudentInsightsGuardrails(
  insights: StudentInsights,
  computedCategory: typeof PROMETRIC_CATEGORIES[number] | null,
): { insights: StudentInsights; report: GuardrailReport } {
  const report: GuardrailReport = { ok: true, fixed: [], blocked: [] };

  // 1) Categoria geral DEVE bater com o cálculo do sistema (fonte da verdade).
  if (computedCategory && insights.categoria_geral !== computedCategory) {
    report.fixed.push(
      `categoria_geral sobrescrita: IA disse "${insights.categoria_geral}", sistema calculou "${computedCategory}"`,
    );
    insights.categoria_geral = computedCategory;
  }

  // 2) Sanitização de texto.
  insights.parecer_tecnico = sanitizeText(insights.parecer_tecnico, report);
  insights.parecer_familia = sanitizeText(insights.parecer_familia, report);
  for (const dim of Object.keys(insights.comentario_por_dimensao)) {
    const d = insights.comentario_por_dimensao[dim as keyof typeof insights.comentario_por_dimensao];
    if (d) d.comentario = sanitizeText(d.comentario, report);
  }

  // 3) Assinatura obrigatória.
  const expectedSig = `Gerado pelo Modelo ProMetric® ${PROMETRIC_PROMPT_VERSION}`;
  if (!insights.assinatura.includes("ProMetric")) {
    insights.assinatura = expectedSig;
    report.fixed.push("Assinatura ProMetric® aplicada");
  }

  report.ok = report.blocked.length === 0;
  return { insights, report };
}
