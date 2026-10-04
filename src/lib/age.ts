/**
 * Cálculo de idade por calendário (anos e meses completos).
 * Substitui aproximações como `dias / 365.25` que causam erros de data limítrofe.
 * Trata datas puras (YYYY-MM-DD) sem desvio por timezone local.
 */

export type DateInput = string | Date;

export interface DateParts {
  year: number;
  month: number; // 1..12
  day: number;   // 1..31
}

/**
 * Converte string (YYYY-MM-DD ou ISO) ou Date para { year, month, day }
 * tratando sempre como data pura de calendário (sem desvio por timezone local).
 */
export function parseDateParts(input: DateInput): DateParts {
  if (typeof input === "string") {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10),
        day: parseInt(match[3], 10),
      };
    }
    const d = new Date(input);
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    };
  }
  return {
    year: input.getUTCFullYear(),
    month: input.getUTCMonth() + 1,
    day: input.getUTCDate(),
  };
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30;
  return 31;
}

/**
 * Retorna os anos completos entre a data de nascimento e a data de referência,
 * baseado no calendário civil (compara ano, mês e dia).
 */
export function ageInYears(birth: DateInput, ref: DateInput = new Date()): number {
  const b = parseDateParts(birth);
  const r = parseDateParts(ref);

  let years = r.year - b.year;
  if (years < 0) return 0;

  if (r.month < b.month || (r.month === b.month && r.day < b.day)) {
    years--;
  }

  return Math.max(0, years);
}

/**
 * Retorna os meses completos entre a data de nascimento e a data de referência.
 * Ex.: nascido em 01/03/2008 avaliado em 01/03/2014 retorna 72 meses (exatamente 6 anos).
 */
export function ageInMonths(birth: DateInput, ref: DateInput = new Date()): number {
  const b = parseDateParts(birth);
  const r = parseDateParts(ref);

  let months = (r.year - b.year) * 12 + (r.month - b.month);
  if (months <= 0 && (r.year < b.year || (r.year === b.year && r.month < b.month))) {
    return 0;
  }

  if (r.day < b.day) {
    months--;
  }

  return Math.max(0, months);
}

/**
 * Wrapper de compatibilidade que redireciona para `ageInYears`.
 */
export function ageFromBirth(birth: string, ref = new Date()): number {
  return ageInYears(birth, ref);
}

export type ResolvedAge = {
  years: number | null;
  months: number | null;
  isApproximated: boolean; // true se derivado de idade_em_anos * 12 + 6 por ausência de data de nascimento
  isUnknown: boolean;      // true se nenhum dado de idade ou nascimento foi fornecido
};

/**
 * Resolve a idade do aluno de forma centralizada:
 * 1. Se houver data de nascimento, calcula os meses e anos exatos por calendário civil.
 * 2. Se houver age_months registrado, usa-o diretamente.
 * 3. Se houver apenas idade em anos, deriva os meses pela regra (anos * 12 + 6) e sinaliza `isApproximated = true`.
 * 4. Sem dados, retorna `isUnknown = true` com `years: null` e `months: null` (NÃO assume valor arbitrário).
 */
export function resolveAge(
  birthDate?: DateInput | null,
  refDate: DateInput = new Date(),
  fallbackAgeYears?: number | null,
  fallbackAgeMonths?: number | null,
): ResolvedAge {
  if (birthDate) {
    const years = ageInYears(birthDate, refDate);
    const months = ageInMonths(birthDate, refDate);
    return { years, months, isApproximated: false, isUnknown: false };
  }

  if (fallbackAgeMonths != null && fallbackAgeMonths > 0) {
    const years = fallbackAgeYears ?? Math.floor(fallbackAgeMonths / 12);
    return { years, months: fallbackAgeMonths, isApproximated: false, isUnknown: false };
  }

  if (fallbackAgeYears != null && fallbackAgeYears > 0) {
    return {
      years: fallbackAgeYears,
      months: fallbackAgeYears * 12 + 6,
      isApproximated: true,
      isUnknown: false,
    };
  }

  return {
    years: null,
    months: null,
    isApproximated: false,
    isUnknown: true,
  };
}

const SHORT_MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const LONG_MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export interface FormatDateBROptions {
  day?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "short" | "long";
  year?: "numeric" | "2-digit";
}

/**
 * Formata data de calendário civil no padrão brasileiro sem desvio por timezone (dd/mm/aaaa).
 * Trata strings 'AAAA-MM-DD', ISO ou instâncias de Date diretamente via parseDateParts.
 */
export function formatDateBR(
  input: DateInput | null | undefined,
  options?: FormatDateBROptions
): string {
  if (!input) return "—";
  const { year, month, day } = parseDateParts(input);
  if (!year || !month || !day) return "—";

  if (!options) {
    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");
    return `${dd}/${mm}/${year}`;
  }

  const dStr = options.day === "numeric" ? String(day) : String(day).padStart(2, "0");
  const yStr = options.year === "2-digit" ? String(year).slice(-2) : String(year);

  if (options.month === "short") {
    const mStr = SHORT_MONTHS[month - 1] ?? "";
    if (options.day && options.year) return `${dStr} ${mStr} ${yStr}`;
    if (options.day) return `${dStr} ${mStr}`;
    if (options.year) return `${mStr} de ${yStr}`;
    return mStr;
  }

  if (options.month === "long") {
    const mStr = LONG_MONTHS[month - 1] ?? "";
    if (options.day && options.year) return `${dStr} de ${mStr} de ${yStr}`;
    if (options.day) return `${dStr} de ${mStr}`;
    if (options.year) return `${mStr} de ${yStr}`;
    return mStr;
  }

  const mStr = options.month === "numeric" ? String(month) : String(month).padStart(2, "0");
  if (!options.year && options.day) return `${dStr}/${mStr}`;
  if (!options.day && options.year) return `${mStr}/${yStr}`;
  return `${dStr}/${mStr}/${yStr}`;
}

