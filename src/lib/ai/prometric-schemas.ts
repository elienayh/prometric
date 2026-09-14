import { z } from "zod";
import { PROMETRIC_CATEGORIES, PROMETRIC_DIMENSIONS } from "./prometric-system-prompt";

// Schemas Zod usados para forçar Structured Output em qualquer provedor (Camada 3).
// O schema é compartilhado entre provedores via Vercel AI SDK `Output.object`.

export const PrometricCategoryEnum = z.enum(PROMETRIC_CATEGORIES);
export const PrometricDimensionEnum = z.enum(PROMETRIC_DIMENSIONS);

export const StudentInsightsSchema = z.object({
  parecer_tecnico: z
    .string()
    .min(50, "Parecer técnico muito curto")
    .max(1800, "Parecer técnico muito longo"),
  parecer_familia: z
    .string()
    .min(50, "Parecer para família muito curto")
    .max(1500, "Parecer para família muito longo"),
  categoria_geral: PrometricCategoryEnum,
  comentario_por_dimensao: z.record(
    PrometricDimensionEnum,
    z.object({
      categoria: PrometricCategoryEnum,
      comentario: z.string().min(20).max(400),
    }),
  ),
  metas: z.object({
    "30_dias": z.array(z.string().min(10).max(200)).length(3),
    "60_dias": z.array(z.string().min(10).max(200)).length(3),
    "90_dias": z.array(z.string().min(10).max(200)).length(3),
  }),
  alertas: z.array(z.string().min(5).max(300)).max(5).default([]),
  assinatura: z.string().min(5).max(120),
});

export type StudentInsights = z.infer<typeof StudentInsightsSchema>;

export const ClassDiagnosisSchema = z.object({
  resumo_executivo: z.string().min(80).max(1500),
  categoria_geral_turma: PrometricCategoryEnum,
  pontos_fortes: z.array(z.string().min(10).max(200)).min(1).max(5),
  pontos_atencao: z.array(z.string().min(10).max(200)).min(1).max(5),
  recomendacoes_pedagogicas: z.array(z.string().min(10).max(300)).min(3).max(7),
  alunos_prioritarios_observacao: z.string().min(20).max(600),
  assinatura: z.string().min(5).max(120),
});

export type ClassDiagnosis = z.infer<typeof ClassDiagnosisSchema>;
