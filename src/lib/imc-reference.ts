// Camada de compatibilidade para referências de IMC — OMS 2007 Oficial
// Encaminha para `src/lib/who2007-bmi.ts` (Tabela oficial da OMS 2007 por mês exato).
// O array digitalizado IMC_REF e interpolações P3/P15/P85/P97 foram removidos conforme auditoria técnica.

import type { Zone, Sex } from "./proesp";
import {
  classifyWhoBmi,
  whoBmiFamilyGuidance,
  WHO_BMI_TO_HEALTH_ZONE_MAP,
  WHO_BMI_DISCLAIMER,
  WHO_BMI_MIN_MONTHS,
  WHO_BMI_MAX_MONTHS,
} from "./who2007-bmi";

export const IMC_REF_MIN_MONTHS = WHO_BMI_MIN_MONTHS;
export const IMC_REF_MAX_MONTHS = WHO_BMI_MAX_MONTHS;

export type ImcBand =
  | "magreza"
  | "eutrofia_baixa"
  | "eutrofia"
  | "sobrepeso"
  | "obesidade";

export type IMCBand = ImcBand;

export const IMC_BANDS: ImcBand[] = [
  "magreza",
  "eutrofia_baixa",
  "eutrofia",
  "sobrepeso",
  "obesidade",
];

export const IMC_BAND_LABEL: Record<ImcBand, string> = {
  magreza: "Magreza",
  eutrofia_baixa: "Eutrofia",
  eutrofia: "Eutrofia",
  sobrepeso: "Sobrepeso",
  obesidade: "Obesidade",
};

export const IMC_BAND_TO_ZONE: Record<ImcBand, Zone> = {
  magreza: "Fraco",
  eutrofia_baixa: "Bom",
  eutrofia: "Excelente",
  sobrepeso: "Razoável",
  obesidade: "Muito Fraco",
};

/** Mensagem acolhedora para famílias e alunos */
export function imcFamilyGuidance(band: ImcBand | string | null | undefined, studentName?: string): string {
  if (!band) return "Sem referência para esta idade.";
  const b = String(band).toLowerCase();
  if (b.includes("eutrofia")) {
    return whoBmiFamilyGuidance("eutrofia", studentName);
  }
  if (b.includes("magreza")) {
    return whoBmiFamilyGuidance("magreza", studentName);
  }
  if (b.includes("sobrepeso")) {
    return whoBmiFamilyGuidance("sobrepeso", studentName);
  }
  if (b.includes("obesidade")) {
    return whoBmiFamilyGuidance("obesidade", studentName);
  }
  return whoBmiFamilyGuidance("eutrofia", studentName);
}

/** Observação padrão para contexto escolar/profissional */
export const IMC_CLINICAL_DISCLAIMER = WHO_BMI_DISCLAIMER;

/**
 * Classifica a faixa de IMC com base nos valores oficiais de escore-z da OMS 2007 para o mês exato.
 */
export function imcBand(imc: number, sex: Sex, ageMonths: number): ImcBand {
  const cat = classifyWhoBmi(imc, sex, ageMonths);
  if (!cat) return "eutrofia";
  switch (cat) {
    case "magreza acentuada":
    case "magreza":
      return "magreza";
    case "eutrofia":
      return "eutrofia";
    case "sobrepeso":
      return "sobrepeso";
    case "obesidade":
    case "obesidade grave":
      return "obesidade";
  }
}

/**
 * Classificação clínica para adultos (20 anos ou mais).
 */
export function imcAdultBand(imc: number): ImcBand {
  if (imc < 18.5) return "magreza";
  if (imc < 25) return "eutrofia";
  if (imc < 30) return "sobrepeso";
  return "obesidade";
}

export { WHO_BMI_TO_HEALTH_ZONE_MAP };
