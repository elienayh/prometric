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
  years: number;
  months: number;
  isApproximated: boolean; // true se derivado de idade_em_anos * 12 + 6 por ausência de data de nascimento
};

/**
 * Resolve a idade do aluno de forma centralizada:
 * 1. Se houver data de nascimento, calcula os meses e anos exatos por calendário civil.
 * 2. Se houver age_months registrado, usa-o diretamente.
 * 3. Como último recurso, deriva os meses pela regra (anos * 12 + 6) e sinaliza `isApproximated = true`.
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
    return { years, months, isApproximated: false };
  }

  if (fallbackAgeMonths != null && fallbackAgeMonths > 0) {
    const years = fallbackAgeYears ?? Math.floor(fallbackAgeMonths / 12);
    return { years, months: fallbackAgeMonths, isApproximated: false };
  }

  const years = fallbackAgeYears != null && fallbackAgeYears > 0 ? fallbackAgeYears : 10;
  return {
    years,
    months: years * 12 + 6,
    isApproximated: true,
  };
}

