import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SendReportInput = z.object({
  studentId: z.string().uuid(),
  recipientEmail: z.string().email(),
  recipientName: z.string().optional(),
  studentName: z.string(),
  schoolName: z.string().optional(),
  className: z.string().optional(),
  portalUrl: z.string().optional(),
  pdfBase64: z.string().optional(),
  pdfFilename: z.string().optional(),
  customSubject: z.string().optional(),
  customMessage: z.string().optional(),
  resendApiKey: z.string().optional(),
  fromEmail: z.string().optional(),
});

export type SendReportInputType = z.infer<typeof SendReportInput>;

export type SendReportResponse =
  | { success: true; mode: "resend"; messageId: string }
  | { success: false; reason: "missing_api_key" | "resend_error" | "invalid_input"; message: string };

export const sendStudentReportEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SendReportInput.parse(d))
  .handler(async ({ data }): Promise<SendReportResponse> => {
    const apiKey = data.resendApiKey?.trim() || process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
      return {
        success: false,
        reason: "missing_api_key",
        message:
          "Chave de API do Resend não configurada. Configure a variável RESEND_API_KEY ou informe a chave nas configurações de envio.",
      };
    }

    const recipientName = data.recipientName || "Família de " + data.studentName;
    const subject =
      data.customSubject ||
      `Relatório de Avaliação Física — ${data.studentName}${data.schoolName ? ` | ${data.schoolName}` : " | ProMetric"}`;

    const portalButtonHtml = data.portalUrl
      ? `
      <div style="margin: 24px 0; text-align: center;">
        <a href="${data.portalUrl}" style="background: linear-gradient(135deg, #10b981 0%, #0d9488 100%); color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
          Acessar Portal do Aluno Online
        </a>
        <p style="margin-top: 8px; font-size: 11px; color: #64748b;">
          Link direto e seguro. Não é necessário criar senha.
        </p>
      </div>
      `
      : "";

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #047857 0%, #0f766e 100%); padding: 28px 24px; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: -0.5px;">ProMetric®</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5;">Avaliação Física e Desenvolvimento Motor</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 28px 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a;">Olá, ${recipientName}!</h2>
        
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
          ${data.customMessage || `Compartilhamos o Relatório Evolutivo de Avaliação Física de <strong>${data.studentName}</strong> referente às atividades de Educação Física e desenvolvimento motor.`}
        </p>

        <!-- Informações do Aluno -->
        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="4">
            <tr>
              <td style="font-size: 12px; color: #64748b; width: 35%;">Aluno(a):</td>
              <td style="font-size: 13px; font-weight: bold; color: #0f172a;">${data.studentName}</td>
            </tr>
            ${data.className ? `
            <tr>
              <td style="font-size: 12px; color: #64748b;">Turma:</td>
              <td style="font-size: 13px; color: #334155;">${data.className}</td>
            </tr>
            ` : ""}
            ${data.schoolName ? `
            <tr>
              <td style="font-size: 12px; color: #64748b;">Instituição:</td>
              <td style="font-size: 13px; color: #334155;">${data.schoolName}</td>
            </tr>
            ` : ""}
          </table>
        </div>

        ${portalButtonHtml}

        <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.5; color: #475569;">
          O relatório completo em PDF está anexado a este e-mail, contendo os índices de aptidão, gráficos comparativos de histórico e orientações recomendadas.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
        <p style="margin: 0;">Enviado com carinho através da plataforma <strong>ProMetric®</strong></p>
        <p style="margin: 4px 0 0 0;">Este é um comunicado oficial da equipe pedagógica e de Educação Física.</p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const attachments: Array<{ filename: string; content: string }> = [];
    if (data.pdfBase64) {
      attachments.push({
        filename: data.pdfFilename || `relatorio-evolutivo-${data.studentName.replace(/\s+/g, "_")}.pdf`,
        content: data.pdfBase64,
      });
    }

    const fromAddress = data.fromEmail || "ProMetric <onboarding@resend.dev>";

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [data.recipientEmail],
          subject,
          html,
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      });

      const resData = (await response.json()) as { id?: string; message?: string; name?: string };

      if (!response.ok) {
        return {
          success: false,
          reason: "resend_error",
          message: resData.message || `Erro no envio via Resend (Status ${response.status})`,
        };
      }

      return {
        success: true,
        mode: "resend",
        messageId: resData.id || "enviado",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha na requisição para o serviço de e-mail";
      return {
        success: false,
        reason: "resend_error",
        message: msg,
      };
    }
  });
