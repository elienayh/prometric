import React, { useState, useMemo } from "react";
import JSZip from "jszip";
import {
  Download,
  Mail,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  FileText,
  Archive,
  Loader2,
  ExternalLink,
  Send,
  Users,
  Settings,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { generateStudentEvolutionDoc } from "@/lib/pdf-evolution-report";
import { prometricIndex } from "@/lib/prometric-method";
import { sendStudentReportEmail } from "@/lib/email/send-student-report.functions";
import type { Classifications } from "@/lib/proesp";

export interface StudentWithEvalStatus {
  id: string;
  full_name: string;
  sex: "male" | "female";
  birth_date: string;
  is_active: boolean;
  email?: string | null;
  guardian_name?: string | null;
  guardian_email?: string | null;
  guardian_phone?: string | null;
  portal_enabled?: boolean | null;
  portal_slug?: string | null;
  portal_token?: string | null;
  evaluations?: Array<{
    id: string;
    evaluated_at: string;
    classifications: Classifications | null;
  }> | null;
}

interface ExportClassReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classNameTitle: string;
  classGrade?: string | null;
  schoolName?: string | null;
  tenantId: string;
  tenantName: string;
  students: StudentWithEvalStatus[];
}

export function ExportClassReportsDialog({
  open,
  onOpenChange,
  classNameTitle,
  classGrade,
  schoolName,
  tenantId,
  tenantName,
  students,
}: ExportClassReportsDialogProps) {
  // Pre-calculate evaluation status for each student
  const studentsWithStatus = useMemo(() => {
    return students.map((s) => {
      const evals = s.evaluations ?? [];
      const hasEvals = evals.length > 0;
      const lastEval = hasEvals ? evals[evals.length - 1] : null;
      const indexResult = lastEval?.classifications
        ? prometricIndex(lastEval.classifications)
        : null;

      const isComplete = indexResult ? !indexResult.partial : false;
      const score = indexResult ? indexResult.score : null;

      const hasGuardianEmail = Boolean(s.guardian_email && s.guardian_email.includes("@"));
      const hasStudentEmail = Boolean(s.email && s.email.includes("@"));
      const hasAnyEmail = hasGuardianEmail || hasStudentEmail;

      const portalKey = s.portal_slug ?? s.portal_token;
      const portalUrl =
        s.portal_enabled && portalKey && typeof window !== "undefined"
          ? `${window.location.origin}${s.portal_slug ? "/p/" : "/portal/aluno/"}${portalKey}`
          : "";

      return {
        ...s,
        hasEvals,
        isComplete,
        score,
        hasGuardianEmail,
        hasStudentEmail,
        hasAnyEmail,
        portalUrl,
      };
    });
  }, [students]);

  // Selected students state: initialize with students that have evaluations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const s of students) {
      if ((s.evaluations?.length ?? 0) > 0) {
        initial.add(s.id);
      }
    }
    // If no evaluations yet, select all so teacher can choose
    if (initial.size === 0) {
      for (const s of students) initial.add(s.id);
    }
    return initial;
  });

  const [activeTab, setActiveTab] = useState<"download" | "email">("download");

  // Download options
  const [downloadFormat, setDownloadFormat] = useState<"zip" | "merged" | "both">("zip");
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadCurrentStudent, setDownloadCurrentStudent] = useState("");

  // Email options
  const [emailRecipientType, setEmailRecipientType] = useState<"guardian" | "student" | "both">("guardian");
  const [isProcessingEmail, setIsProcessingEmail] = useState(false);
  const [emailProgress, setEmailProgress] = useState(0);
  const [emailStatusText, setEmailStatusText] = useState("");
  const [resendApiKey, setResendApiKey] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("prometric_resend_api_key") || "" : "";
  });
  const [showEmailConfig, setShowEmailConfig] = useState(false);

  // Toggle single student
  const toggleStudent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all / Deselect all
  const selectAll = () => {
    setSelectedIds(new Set(students.map((s) => s.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const selectOnlyWithEvaluations = () => {
    const set = new Set<string>();
    for (const s of studentsWithStatus) {
      if (s.hasEvals) set.add(s.id);
    }
    setSelectedIds(set);
  };

  const selectedStudents = useMemo(() => {
    return studentsWithStatus.filter((s) => selectedIds.has(s.id));
  }, [studentsWithStatus, selectedIds]);

  // Save Resend API key
  const handleSaveApiKey = (key: string) => {
    setResendApiKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("prometric_resend_api_key", key);
    }
    toast.success("Chave da API salva com sucesso");
    setShowEmailConfig(false);
  };

  // =========================================================================
  // BATCH DOWNLOAD PROCESSOR
  // =========================================================================
  const handleStartDownload = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Selecione pelo menos um aluno para exportar.");
      return;
    }

    const studentsWithoutEvals = selectedStudents.filter((s) => !s.hasEvals);
    if (studentsWithoutEvals.length > 0 && selectedStudents.length === studentsWithoutEvals.length) {
      toast.error("Nenhum dos alunos selecionados possui avaliações lançadas para gerar o relatório.");
      return;
    }

    setIsProcessingDownload(true);
    setDownloadProgress(0);

    const zip = new JSZip();
    let mergedDoc: any = null;
    let successCount = 0;
    let failCount = 0;

    const classSafeName = (classNameTitle || "turma")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_");

    try {
      const targetList = selectedStudents.filter((s) => s.hasEvals);
      const total = targetList.length;

      for (let i = 0; i < total; i++) {
        const student = targetList[i];
        setDownloadCurrentStudent(`${student.full_name} (${i + 1}/${total})`);
        setDownloadProgress(Math.round(((i + 1) / total) * 100));

        try {
          // 1. Generate individual doc / blob
          const { doc, filename, blob } = await generateStudentEvolutionDoc(
            student.id,
            tenantId,
            tenantName,
          );

          if (downloadFormat === "zip" || downloadFormat === "both") {
            zip.file(filename, blob);
          }

          if (downloadFormat === "merged" || downloadFormat === "both") {
            if (!mergedDoc) {
              mergedDoc = doc;
            } else {
              // Append to merged document
              await generateStudentEvolutionDoc(
                student.id,
                tenantId,
                tenantName,
                mergedDoc,
              );
            }
          }

          successCount++;
        } catch (err) {
          console.error(`Erro ao gerar PDF para ${student.full_name}:`, err);
          failCount++;
        }
      }

      // Finalize ZIP
      if ((downloadFormat === "zip" || downloadFormat === "both") && successCount > 0) {
        const zipContent = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipContent);
        const a = document.createElement("a");
        a.href = zipUrl;
        a.download = `relatorios-turma-${classSafeName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(zipUrl);
      }

      // Finalize Merged PDF
      if ((downloadFormat === "merged" || downloadFormat === "both") && mergedDoc) {
        mergedDoc.save(`relatorios-turma-${classSafeName}-caderno-completo.pdf`);
      }

      if (successCount > 0) {
        toast.success(
          `Exportação concluída! ${successCount} relatório(s) gerado(s) com sucesso.${
            failCount > 0 ? ` (${failCount} não puderam ser gerados)` : ""
          }`,
        );
      } else {
        toast.error("Não foi possível gerar os relatórios dos alunos selecionados.");
      }
    } catch (e) {
      console.error("[handleStartDownload]", e);
      toast.error(e instanceof Error ? e.message : "Falha durante o download dos relatórios.");
    } finally {
      setIsProcessingDownload(false);
      setDownloadProgress(0);
      setDownloadCurrentStudent("");
    }
  };

  // =========================================================================
  // BATCH EMAIL PROCESSOR
  // =========================================================================
  const handleStartEmail = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Selecione pelo menos um aluno para enviar.");
      return;
    }

    const studentsWithEmail = selectedStudents.filter((s) => {
      if (emailRecipientType === "guardian") return s.hasGuardianEmail;
      if (emailRecipientType === "student") return s.hasStudentEmail;
      return s.hasAnyEmail;
    });

    if (studentsWithEmail.length === 0) {
      toast.error(
        "Nenhum dos alunos selecionados possui e-mail cadastrado para o tipo de destinatário escolhido.",
      );
      return;
    }

    setIsProcessingEmail(true);
    setEmailProgress(0);

    let sentCount = 0;
    let failedCount = 0;
    const total = studentsWithEmail.length;

    try {
      for (let i = 0; i < total; i++) {
        const student = studentsWithEmail[i];
        setEmailStatusText(`Enviando para ${student.full_name} (${i + 1}/${total})...`);
        setEmailProgress(Math.round(((i + 1) / total) * 100));

        // Determine target email
        let targetEmail = "";
        let targetName = "";
        if (emailRecipientType === "guardian" && student.hasGuardianEmail) {
          targetEmail = student.guardian_email!;
          targetName = student.guardian_name || `Responsável por ${student.full_name}`;
        } else if (emailRecipientType === "student" && student.hasStudentEmail) {
          targetEmail = student.email!;
          targetName = student.full_name;
        } else {
          targetEmail = student.guardian_email || student.email || "";
          targetName = student.guardian_name || student.full_name;
        }

        if (!targetEmail) {
          failedCount++;
          continue;
        }

        try {
          // Generate PDF as base64 attachment if student has evaluations
          let pdfBase64: string | undefined = undefined;
          let pdfFilename: string | undefined = undefined;

          if (student.hasEvals) {
            const { doc, filename } = await generateStudentEvolutionDoc(
              student.id,
              tenantId,
              tenantName,
            );
            const arrayBuffer = doc.output("arraybuffer");
            const binary = String.fromCharCode(...new Uint8Array(arrayBuffer));
            pdfBase64 = btoa(binary);
            pdfFilename = filename;
          }

          const res = await sendStudentReportEmail({
            data: {
              studentId: student.id,
              recipientEmail: targetEmail,
              recipientName: targetName,
              studentName: student.full_name,
              schoolName: schoolName || undefined,
              className: classNameTitle || undefined,
              portalUrl: student.portalUrl || undefined,
              pdfBase64,
              pdfFilename,
              resendApiKey: resendApiKey || undefined,
            },
          });

          if (res.success) {
            sentCount++;
          } else {
            console.warn(`[sendEmail] Falha para ${student.full_name}:`, res.message);
            failedCount++;

            // If API key is missing on the very first student, break and warn user
            if (res.reason === "missing_api_key") {
              toast.error(res.message);
              setShowEmailConfig(true);
              break;
            }
          }
        } catch (err) {
          console.error(`Erro ao disparar e-mail para ${student.full_name}:`, err);
          failedCount++;
        }
      }

      if (sentCount > 0) {
        toast.success(
          `Envio concluído! ${sentCount} e-mail(s) enviado(s) com sucesso.${
            failedCount > 0 ? ` (${failedCount} não enviados)` : ""
          }`,
        );
      } else if (failedCount > 0 && !resendApiKey) {
        toast.info("Configure a chave da API do Resend abaixo para envio direto com PDF.");
      }
    } catch (e) {
      console.error("[handleStartEmail]", e);
      toast.error(e instanceof Error ? e.message : "Falha durante o disparo de e-mails.");
    } finally {
      setIsProcessingEmail(false);
      setEmailProgress(0);
      setEmailStatusText("");
    }
  };

  // Helper: Open mailto for a student
  const openMailtoForStudent = (student: typeof studentsWithStatus[0]) => {
    const targetEmail =
      emailRecipientType === "guardian"
        ? student.guardian_email || student.email
        : student.email || student.guardian_email;

    if (!targetEmail) {
      toast.error(`Nenhum e-mail cadastrado para ${student.full_name}`);
      return;
    }

    const subject = encodeURIComponent(`Relatório de Avaliação Física — ${student.full_name}`);
    const body = encodeURIComponent(
      `Olá!\n\nSegue o acesso ao Relatório de Avaliação Física de ${student.full_name}.\n\n` +
        (student.portalUrl ? `Acesse o relatório online pelo link seguro:\n${student.portalUrl}\n\n` : "") +
        `Atenciosamente,\nEquipe ProMetric® • ${tenantName}`,
    );

    window.open(`mailto:${targetEmail}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Exportar Notas e Relatórios
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Turma: <strong>{classNameTitle}</strong>
                {classGrade && ` • ${classGrade}`}
                {schoolName && ` • ${schoolName}`}
                {` • ${students.length} aluno(s)`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs: Baixar PDFs vs Enviar E-mail */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "download" | "email")}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-6 pt-3 border-b border-border/60 bg-muted/10">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="download" className="flex items-center gap-2 text-xs font-semibold">
                <Download className="h-4 w-4" />
                1. Baixar PDFs
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2 text-xs font-semibold">
                <Mail className="h-4 w-4" />
                2. Enviar por E-mail
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Student Selection Toolbar (Shared) */}
          <div className="px-6 py-2.5 bg-background border-b border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="h-7 text-xs font-medium cursor-pointer"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1 text-primary" />
                Todos ({students.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deselectAll}
                className="h-7 text-xs font-medium cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 mr-1" />
                Nenhum
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectOnlyWithEvaluations}
                className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer hidden sm:inline-flex"
                title="Selecionar apenas alunos com avaliações registradas"
              >
                Apenas com notas
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {selectedIds.size} de {students.length} selecionado(s)
              </span>
            </div>
          </div>

          {/* Scrollable Student List */}
          <div className="flex-1 overflow-y-auto px-6 py-3 min-h-[180px] max-h-[320px] divide-y divide-border/40">
            {studentsWithStatus.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Nenhum aluno cadastrado nesta turma.
              </div>
            ) : (
              studentsWithStatus.map((s) => {
                const isSelected = selectedIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleStudent(s.id)}
                    className={`flex items-center justify-between gap-3 py-2 px-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/40 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleStudent(s.id)}
                        className="data-[state=checked]:bg-primary shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate text-foreground">
                            {s.full_name}
                          </span>
                          {!s.is_active && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 text-muted-foreground">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                          <span>{s.sex === "male" ? "M" : "F"}</span>
                          {/* Evaluation Status */}
                          {s.hasEvals ? (
                            s.isComplete ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Avaliado (Score: {s.score}/100)
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                Testes parciais
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground italic">Sem avaliações</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Info (Email status) */}
                    <div className="shrink-0 text-right">
                      {activeTab === "email" ? (
                        s.hasAnyEmail ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium max-w-[180px] truncate">
                              {s.guardian_email || s.email}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {s.hasGuardianEmail ? "Resp." : "Aluno"}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-amber-500/40 text-amber-600">
                            Sem e-mail
                          </Badge>
                        )
                      ) : (
                        s.hasEvals ? (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                            Pronto para PDF
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                            Sem dados
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* TAB 1: BAIXAR PDFS CONTENT */}
          <TabsContent value="download" className="m-0 p-6 pt-4 border-t border-border/80 bg-muted/10 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold mb-2 block">Formato de Exportação:</Label>
                <RadioGroup
                  value={downloadFormat}
                  onValueChange={(v) => setDownloadFormat(v as "zip" | "merged" | "both")}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zip" id="fmt-zip" />
                    <Label htmlFor="fmt-zip" className="text-xs cursor-pointer">
                      <strong>Pacote ZIP (.zip)</strong> — PDFs individuais separados de cada aluno
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="merged" id="fmt-merged" />
                    <Label htmlFor="fmt-merged" className="text-xs cursor-pointer">
                      <strong>Caderno Único (.pdf)</strong> — Todas as fichas compiladas em 1 arquivo (ideal para imprimir)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="fmt-both" />
                    <Label htmlFor="fmt-both" className="text-xs cursor-pointer">
                      <strong>Ambos</strong> — Baixar ZIP individual e o PDF consolidado
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-3.5 text-xs space-y-1.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Archive className="h-4 w-4 text-primary" />
                  Resumo da Exportação:
                </div>
                <p className="text-muted-foreground">
                  • {selectedStudents.length} aluno(s) selecionado(s) para exportar.
                </p>
                <p className="text-muted-foreground">
                  • {selectedStudents.filter((s) => s.hasEvals).length} aluno(s) com relatórios prontos.
                </p>
                {selectedStudents.some((s) => !s.hasEvals) && (
                  <p className="text-amber-600 dark:text-amber-400">
                    ⚠️ {selectedStudents.filter((s) => !s.hasEvals).length} aluno(s) sem avaliações serão ignorados no arquivo final.
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar during Download */}
            {isProcessingDownload && (
              <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-primary flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Gerando relatórios: {downloadCurrentStudent}
                  </span>
                  <span className="font-bold text-primary">{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isProcessingDownload}
                className="text-xs cursor-pointer"
              >
                Cancelar
              </Button>

              <Button
                onClick={handleStartDownload}
                disabled={isProcessingDownload || selectedStudents.length === 0}
                className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90 text-xs font-semibold cursor-pointer"
              >
                {isProcessingDownload ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando Arquivos...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Relatórios Selecionados ({selectedStudents.filter((s) => s.hasEvals).length})
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: ENVIAR EMAIL CONTENT */}
          <TabsContent value="email" className="m-0 p-6 pt-4 border-t border-border/80 bg-muted/10 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold mb-2 block">Destinatário do E-mail:</Label>
                <RadioGroup
                  value={emailRecipientType}
                  onValueChange={(v) => setEmailRecipientType(v as "guardian" | "student" | "both")}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="guardian" id="dest-guardian" />
                    <Label htmlFor="dest-guardian" className="text-xs cursor-pointer">
                      <strong>E-mail do Responsável</strong> (preferencial para famílias)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="dest-student" />
                    <Label htmlFor="dest-student" className="text-xs cursor-pointer">
                      <strong>E-mail do Aluno</strong> (para turmas maiores/adolescentes)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="dest-both" />
                    <Label htmlFor="dest-both" className="text-xs cursor-pointer">
                      <strong>Responsável ou Aluno</strong> (o que estiver cadastrado)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Send className="h-4 w-4 text-emerald-600" />
                    Status de Destinatários:
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmailConfig(!showEmailConfig)}
                    className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    {showEmailConfig ? "Fechar Config" : "Configuração API"}
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  • {selectedStudents.filter((s) => s.hasAnyEmail).length} de {selectedStudents.length} selecionado(s) possuem e-mail válido.
                </p>
                {selectedStudents.some((s) => !s.hasAnyEmail) && (
                  <p className="text-amber-600 dark:text-amber-400">
                    ⚠️ {selectedStudents.filter((s) => !s.hasAnyEmail).length} aluno(s) sem e-mail não receberão a mensagem.
                  </p>
                )}
              </div>
            </div>

            {/* Optional Resend API Config accordion */}
            {showEmailConfig && (
              <div className="rounded-xl border border-border bg-background p-4 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-xs">Chave da API do Resend (Envio em Segundo Plano):</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setShowEmailConfig(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Caso possua uma conta no Resend (serviço gratuito para até 3.000 e-mails/mês), informe sua chave
                  para envio em lote automático com o PDF anexado:
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="re_123456789..."
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    className="text-xs font-mono h-8"
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => handleSaveApiKey(resendApiKey)}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            )}

            {/* Progress Bar during Email */}
            {isProcessingEmail && (
              <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {emailStatusText}
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{emailProgress}%</span>
                </div>
                <Progress value={emailProgress} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isProcessingEmail}
                className="text-xs cursor-pointer"
              >
                Cancelar
              </Button>

              <div className="flex items-center gap-2">
                {/* Fallback direct mailto option */}
                {selectedStudents.length === 1 && selectedStudents[0].hasAnyEmail && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openMailtoForStudent(selectedStudents[0])}
                    className="text-xs cursor-pointer"
                    title="Abre o Gmail ou seu aplicativo de e-mail com a mensagem pré-preenchida"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Abrir no E-mail Local
                  </Button>
                )}

                <Button
                  onClick={handleStartEmail}
                  disabled={
                    isProcessingEmail ||
                    selectedStudents.filter((s) => s.hasAnyEmail).length === 0
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  {isProcessingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Disparar E-mails Selecionados ({selectedStudents.filter((s) => s.hasAnyEmail).length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
