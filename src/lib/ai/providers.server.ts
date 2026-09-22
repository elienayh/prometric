// Camada server-only — teste de conexão e ping aos provedores de IA.
// NUNCA importar deste arquivo a partir de código de browser.

import type { ProviderId } from "./providers-catalog";

export type PingResult = {
  ok: boolean;
  latencyMs: number;
  error?: string;
};

async function withTimeout<T>(p: Promise<T>, ms = 30_000): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("Timeout após " + ms + "ms")), ms)),
  ]);
}

export async function pingProvider(
  provider: ProviderId,
  apiKey: string,
  model: string,
): Promise<PingResult> {
  const start = Date.now();
  try {
    // Utiliza exatamente a mesma camada de chamada e SDK (@google/genai, systemInstruction,
    // responseMimeType: "application/json") usada na geração dos relatórios reais.
    const { callProvider } = await import("./unified-generate.server");
    const testSystem = "Você é o assistente de inteligência artificial do ProMetric®. Responda exclusivamente em JSON estrito.";
    const testPrompt = 'Retorne exatamente o seguinte objeto JSON: {"status":"ok","mensagem":"conexao_ativa"}';

    const raw = await withTimeout(
      callProvider(provider, apiKey, model, testSystem, testPrompt),
      15_000
    );

    // Validação estrita de parse JSON
    const cleaned = (raw || "")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("A IA respondeu, mas não retornou um formato JSON válido.");
      JSON.parse(match[0]);
    }

    return { ok: true, latencyMs: Date.now() - start };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, latencyMs: Date.now() - start, error: message };
  }
}

