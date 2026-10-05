/**
 * Validação de valores antropométricos e testes motores do ProMetric / PROESP-BR.
 * Bloqueia valores impossíveis, alerta para improváveis, detecta altura em metros
 * e gerencia a faixa etária do PROESP-BR (6–17 anos).
 */

export const PROESP_MIN_AGE = 6;
export const PROESP_MAX_AGE = 17;

export const PROESP_AGE_WARNING =
  "Os pontos de corte de referência cobrem 6 a 17 anos. Testes motores de desempenho não são classificados fora dessa faixa (IMC e RCE permanecem ativos).";

export interface RangeRule {
  field: string;
  label: string;
  unit: string;
  /** Limite inferior absoluto (abaixo disso é bloqueado) */
  minImpossible: number;
  /** Limite superior absoluto (acima disso é bloqueado) */
  maxImpossible: number;
  /** Limite inferior usual/plausível (abaixo disso gera aviso) */
  minPlausible: number;
  /** Limite superior usual/plausível (acima disso gera aviso) */
  maxPlausible: number;
  /** Se zero é um número válido (ex.: abdominal = 0 repetições, flexibilidade = 0 cm) */
  allowZero: boolean;
}

export const FIELD_RULES: Record<string, RangeRule> = {
  weight_kg: {
    field: "weight_kg",
    label: "Peso",
    unit: "kg",
    minImpossible: 5,
    maxImpossible: 250,
    minPlausible: 10,
    maxPlausible: 150,
    allowZero: false,
  },
  height_cm: {
    field: "height_cm",
    label: "Altura",
    unit: "cm",
    minImpossible: 50,
    maxImpossible: 240,
    minPlausible: 90,
    maxPlausible: 210,
    allowZero: false,
  },
  waist_cm: {
    field: "waist_cm",
    label: "Cintura",
    unit: "cm",
    minImpossible: 25,
    maxImpossible: 180,
    minPlausible: 35,
    maxPlausible: 150,
    allowZero: false,
  },
  hip_cm: {
    field: "hip_cm",
    label: "Quadril",
    unit: "cm",
    minImpossible: 30,
    maxImpossible: 200,
    minPlausible: 40,
    maxPlausible: 160,
    allowZero: false,
  },
  wingspan_cm: {
    field: "wingspan_cm",
    label: "Envergadura",
    unit: "cm",
    minImpossible: 50,
    maxImpossible: 260,
    minPlausible: 90,
    maxPlausible: 230,
    allowZero: false,
  },
  sit_and_reach_cm: {
    field: "sit_and_reach_cm",
    label: "Flexibilidade",
    unit: "cm",
    minImpossible: -20,
    maxImpossible: 70,
    minPlausible: -10,
    maxPlausible: 60,
    allowZero: true,
  },
  abdominal_reps: {
    field: "abdominal_reps",
    label: "Abdominal",
    unit: "reps",
    minImpossible: 0,
    maxImpossible: 120,
    minPlausible: 0,
    maxPlausible: 80,
    allowZero: true,
  },
  horizontal_jump_cm: {
    field: "horizontal_jump_cm",
    label: "Salto Horizontal",
    unit: "cm",
    minImpossible: 20,
    maxImpossible: 350,
    minPlausible: 40,
    maxPlausible: 300,
    allowZero: false,
  },
  medicine_ball_m: {
    field: "medicine_ball_m",
    label: "Medicine Ball 2kg",
    unit: "m",
    minImpossible: 0.5,
    maxImpossible: 15,
    minPlausible: 1,
    maxPlausible: 12,
    allowZero: false,
  },
  square_test_s: {
    field: "square_test_s",
    label: "Agilidade (Quadrado)",
    unit: "s",
    minImpossible: 3.5,
    maxImpossible: 30,
    minPlausible: 4,
    maxPlausible: 15,
    allowZero: false,
  },
  sprint_20m_s: {
    field: "sprint_20m_s",
    label: "Velocidade 20m",
    unit: "s",
    minImpossible: 2.0,
    maxImpossible: 20,
    minPlausible: 2.5,
    maxPlausible: 8,
    allowZero: false,
  },
  run_6min_m: {
    field: "run_6min_m",
    label: "Corrida 6min",
    unit: "m",
    minImpossible: 100,
    maxImpossible: 2500,
    minPlausible: 300,
    maxPlausible: 1800,
    allowZero: false,
  },
};

export type ValidationSeverity = "error" | "warning" | "ok";

export interface FieldValidationResult {
  valid: boolean;
  severity: ValidationSeverity;
  message?: string;
  suggestedValue?: number;
}

/**
 * Detecta se a altura foi digitada em metros (ex: 1.45, 1,60) e sugere/converte para cm.
 */
export function normalizeHeight(val: number | string | null | undefined): {
  normalized: number | null;
  convertedFromMeters: boolean;
  error?: string;
} {
  if (val == null || val === "") return { normalized: null, convertedFromMeters: false };
  let n = typeof val === "number" ? val : parseFloat(String(val).replace(",", "."));
  if (isNaN(n)) return { normalized: null, convertedFromMeters: false, error: "Valor numérico inválido." };

  // Se estiver entre 0.50 e 2.50 m, converte para cm (ex: 1.50 m -> 150 cm)
  if (n >= 0.5 && n <= 2.5) {
    return {
      normalized: Math.round(n * 100 * 10) / 10,
      convertedFromMeters: true,
    };
  }
  return { normalized: n, convertedFromMeters: false };
}

/**
 * Valida um único campo individualmente.
 */
export function validateField(
  field: string,
  rawVal: number | string | null | undefined,
): FieldValidationResult {
  if (rawVal == null || rawVal === "") {
    return { valid: true, severity: "ok" };
  }

  let val = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal).replace(",", "."));
  if (isNaN(val)) {
    return { valid: false, severity: "error", message: "Valor numérico inválido." };
  }

  // Tratamento especial para altura digitada em metros
  if (field === "height_cm" && val >= 0.5 && val <= 2.5) {
    const converted = Math.round(val * 100 * 10) / 10;
    return {
      valid: true,
      severity: "warning",
      message: `Altura informada em metros (${val} m). Sugere-se ${converted} cm.`,
      suggestedValue: converted,
    };
  }

  const rule = FIELD_RULES[field];
  if (!rule) {
    return { valid: true, severity: "ok" };
  }

  // Validação de zero
  if (val === 0) {
    if (!rule.allowZero) {
      return {
        valid: false,
        severity: "error",
        message: `${rule.label} não pode ser zero. Campo não preenchido deve permanecer em branco.`,
      };
    }
    const unitText = rule.unit === "reps" ? "repetições" : rule.unit;
    return {
      valid: true,
      severity: "warning",
      message: `${rule.label} registrado como 0 ${unitText}. Confirme se o aluno realmente obteve a marca 0.`,
    };
  }

  // Bloqueio de impossível
  if (val < rule.minImpossible || val > rule.maxImpossible) {
    return {
      valid: false,
      severity: "error",
      message: `${rule.label}: valor ${val} ${rule.unit} é fisiologicamente impossível (${rule.minImpossible} a ${rule.maxImpossible} ${rule.unit}).`,
    };
  }

  // Alerta de improvável
  if (val < rule.minPlausible || val > rule.maxPlausible) {
    return {
      valid: true,
      severity: "warning",
      message: `${rule.label}: valor ${val} ${rule.unit} está fora do padrão esperado (${rule.minPlausible} a ${rule.maxPlausible} ${rule.unit}). Confirme a medição.`,
    };
  }

  return { valid: true, severity: "ok" };
}

export interface EvaluationValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  ageWarning?: string;
  hasBlockingErrors: boolean;
}

/**
 * Normaliza os valores de uma avaliação, convertendo altura em metros para cm quando necessário.
 */
export function normalizeEvaluationValues<T extends Record<string, unknown>>(values: T): T {
  const copy: Record<string, unknown> = { ...values };
  if (copy.height_cm !== undefined && copy.height_cm !== null && copy.height_cm !== "") {
    const h = normalizeHeight(copy.height_cm as number | string);
    if (h.normalized !== null) {
      copy.height_cm = h.normalized;
    }
  }
  return copy as T;
}

/**
 * Verifica se a idade está na faixa de classificação de testes motores do PROESP-BR (6 a 17 anos).
 */
export function isAgeInProespRange(ageYears: number | null | undefined): boolean {
  if (ageYears == null) return false;
  return ageYears >= PROESP_MIN_AGE && ageYears <= PROESP_MAX_AGE;
}

/**
 * Valida um conjunto completo de dados de avaliação.
 */
export function validateEvaluation(
  values: Record<string, unknown>,
  ageYears?: number | null,
): EvaluationValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  for (const [key, rule] of Object.entries(FIELD_RULES)) {
    const val = values[key];
    if (val === undefined || val === null || val === "") continue;
    const res = validateField(key, val as number | string);
    if (!res.valid) {
      errors[key] = res.message ?? "Valor inválido.";
    } else if (res.severity === "warning" && res.message) {
      warnings[key] = res.message;
    }
  }

  let ageWarning: string | undefined;
  if (ageYears != null) {
    if (!isAgeInProespRange(ageYears)) {
      ageWarning = PROESP_AGE_WARNING;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings,
    ageWarning,
    hasBlockingErrors: Object.keys(errors).length > 0,
  };
}
