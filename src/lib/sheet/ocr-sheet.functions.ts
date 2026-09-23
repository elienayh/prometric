// Server function: receives a sheet token + image, verifies HMAC, resolves
// student + tenant, calls the TENANT-configured AI (or system fallback) and returns parsed OCR fields.
//
// Reuses the existing prometric AI plumbing (tenant_ai_credentials, master
// prompt, structured output via JSON). Never logs the raw image.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { OCRResultSchema, OCR_FIELD_KEYS, type OCRResult } from "./ocr-schema";

type Input = {
  token: string;
  imageBase64: string;
  mime: "image/jpeg" | "image/png" | "image/webp";
};

export type SheetOCRResponse = {
  studentId: string;
  studentName: string;
  birthDate: string;
  sex: string;
  classId: string | null;
  groupId: string | null;
  className: string | null;
  ocr: OCRResult;
  aiSource: "tenant" | "fallback";
  aiProvider: string;
  aiModel: string;
};

export const ocrSheetImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Input) => {
    if (!data?.token?.startsWith("PM1.")) throw new Error("Token de ficha inválido");
    if (!data.imageBase64 || data.imageBase64.length < 200)
      throw new Error("Imagem inválida ou vazia");
    if (data.imageBase64.length > 8_500_000)
      throw new Error("Imagem muito grande (máx ~6 MB)");
    if (!["image/jpeg", "image/png", "image/webp"].includes(data.mime))
      throw new Error("Formato de imagem não suportado");
    return data;
  })
  .handler(async ({ data, context }): Promise<SheetOCRResponse> => {
    const { verifySheetToken } = await import("./qr-payload.server");
    const payload = verifySheetToken(data.token);

    const { supabase } = context;
    const { data: student, error } = await supabase
      .from("students")
      .select("id, tenant_id, full_name, sex, birth_date, class_id, group_id, class:classes(name)")
      .eq("id", payload.s)
      .maybeSingle();
    if (error) throw error;
    if (!student) throw new Error("Aluno da ficha não encontrado neste espaço");
    if ((student as { tenant_id: string }).tenant_id !== payload.t)
      throw new Error("Ficha emitida em outro espaço — não pode ser processada aqui");

    const { resolveTenantModel } = await import("@/lib/ai/unified-generate.server");
    const resolved = await resolveTenantModel(supabase, payload.t);
    if (resolved.source === "fallback") {
      throw new Error(
        "Nenhuma IA configurada para este espaço. Cadastre um provedor em Configurações → Inteligência Artificial antes de usar o OCR de fichas.",
      );
    }

    const { buildSystemPrompt } = await import("@/lib/ai/prometric-system-prompt");
    const system = buildSystemPrompt(
      "Tarefa: leitura óptica (OCR) de uma ficha ProMetric impressa preenchida à mão.",
    );

    const fieldDescriptor = OCR_FIELD_KEYS.map((k) => `- ${k}`).join("\n");
    const userPrompt = `Você recebeu a foto de UMA ficha de avaliação física do ProMetric, preenchida à mão pelo professor.
Sua tarefa é extrair os valores numéricos manuscritos das CAIXAS de valor de cada teste e devolver JSON estrito.

Regras absolutas:
1. Responda APENAS um objeto JSON com este formato exato:
{
  "evaluated_at": "YYYY-MM-DD" | null,
  "observations": string | null,
  "fields": {
${OCR_FIELD_KEYS.map((k) => `    "${k}": { "value": number|null, "confidence": 0..1 }`).join(",\n")}
  }
}
2. Use ponto como separador decimal (ex.: 1.62). Converta vírgulas para ponto.
3. Se a caixa estiver vazia, ilegível ou rasurada, use value=null e confidence próxima de 0.
4. confidence reflete sua certeza visual (0 = chute, 1 = leitura inequívoca).
5. Não converta unidades — registre exatamente o número escrito.
6. Não invente valores. Não use placeholders.
7. Não inclua texto fora do JSON. Não use markdown.

Campos esperados (chaves exatas):
${fieldDescriptor}

Aluno da ficha: ${(student as { full_name: string }).full_name}.
Idade na ficha pode estar impressa apenas como referência — ignore para o OCR.`;

    const { generateMultimodalJSON } = await import("@/lib/ai/multimodal.server");
    const raw = await generateMultimodalJSON(resolved, system, userPrompt, {
      base64: data.imageBase64,
      mime: data.mime,
    });

    const parsed = OCRResultSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        "A IA retornou um formato inesperado. Tente novamente ou ajuste o provedor em Configurações → IA.",
      );
    }

    const s = student as {
      id: string;
      full_name: string;
      sex: string;
      birth_date: string;
      class_id: string | null;
      group_id: string | null;
      class: { name?: string | null } | null;
    };

    return {
      studentId: s.id,
      studentName: s.full_name,
      birthDate: s.birth_date,
      sex: s.sex,
      classId: s.class_id,
      groupId: s.group_id,
      className: s.class?.name ?? null,
      ocr: parsed.data,
      aiSource: resolved.source,
      aiProvider: resolved.provider,
      aiModel: resolved.model,
    };
  });
