/**
 * Módulo de acesso unificado e seguro a variáveis de ambiente no servidor.
 * 
 * Compatível com:
 * - Node.js (desenvolvimento, scripts e SSR)
 * - Cloudflare Workers (nodejs_compat via parâmetro `env` no fetch handler)
 *
 * NENHUM segredo ou chave literal deve residir no código-fonte.
 */

let cloudflareEnv: Record<string, unknown> | null = null;

/**
 * Registra o objeto de bindings do Cloudflare Worker para a requisição atual.
 */
export function setCloudflareEnv(env: unknown): void {
  if (env && typeof env === "object") {
    cloudflareEnv = env as Record<string, unknown>;

    // Em Cloudflare Workers com nodejs_compat, popula process.env se disponível
    if (typeof process !== "undefined" && process.env) {
      for (const [key, value] of Object.entries(cloudflareEnv)) {
        if (typeof value === "string" && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

/**
 * Obtém o valor de uma variável de ambiente no servidor sem assumir apenas Node.js.
 */
export function getServerEnv(key: string): string | undefined {
  // 1. Tenta obter do binding do Cloudflare Workers
  if (cloudflareEnv && typeof cloudflareEnv[key] === "string") {
    const val = (cloudflareEnv[key] as string).trim();
    if (val.length > 0) return val;
  }

  // 2. Tenta do process.env (Node.js ou polyfill nodejs_compat do Workers)
  if (typeof process !== "undefined" && process.env) {
    const val = process.env[key];
    if (typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  }

  // 3. Tenta do globalThis (possível injeção de runtime)
  if (typeof globalThis !== "undefined") {
    const val = (globalThis as Record<string, unknown>)[key];
    if (typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  }

  // 4. Tenta do import.meta.env (Vite dev server / SSR)
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      const val = (import.meta.env as Record<string, unknown>)[key];
      if (typeof val === "string" && val.trim().length > 0) {
        return val.trim();
      }
    }
  } catch {
    // import.meta.env não disponível
  }

  return undefined;
}

/**
 * Obtém uma variável de ambiente obrigatória ou lança erro explícito.
 */
export function getRequiredServerEnv(key: string, customMessage?: string): string {
  const value = getServerEnv(key);
  if (!value) {
    throw new Error(
      customMessage ?? `Variável de ambiente obrigatória não configurada no servidor: ${key}`,
    );
  }
  return value;
}
