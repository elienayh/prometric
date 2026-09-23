// Modo Prancheta — pipeline OCR HÍBRIDO.
//
// Pipeline padrão: QR → resolve aluno → recorta ROIs → Tesseract.js (local).
// IA do tenant só é chamada sob demanda (botão "Interpretar com IA") ou para
// um campo individual com baixa confiança.
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  Loader2,
  ScanLine,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageHeader } from "@/components/layout/page-header";
import { CameraScanner } from "@/components/sheet/camera-scanner";
import { decodeSheetsInImage, type DecodedSheet } from "@/lib/sheet/qr-decode";
import { isPdfFile, rasterizePdfToImages } from "@/lib/sheet/pdf-rasterize";
import { ocrSheetImage } from "@/lib/sheet/ocr-sheet.functions";
import { resolveSheetToken, type ResolvedSheetStudent } from "@/lib/sheet/resolve-token.functions";
import {
  OCR_FIELD_KEYS,
  OCR_FIELD_LABEL,
  OCR_CONFIDENCE_THRESHOLD,
  type OCRFieldKey,
} from "@/lib/sheet/ocr-schema";
import { SHEET_FIELD_ROIS, DATE_ROI, isOutOfRange, roiInCrop } from "@/lib/sheet/sheet-layout";
import { dataUrlToCanvas, cropROI, enhance } from "@/lib/sheet/image-preprocess";
import { ocrField, ocrDate } from "@/lib/sheet/ocr-traditional";
import { ageFromBirth, calcImc, calcRce, classifyAll, type Sex } from "@/lib/proesp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/evaluations/import")({
  head: () => ({ meta: [{ title: "Importar Fichas — ProMetric" }] }),
  component: ImportPage,
});

type FieldState = {
  value: string; // editável (string)
  confidence: number;
  source: "ocr" | "ai" | "manual";
};

type SheetEntry = {
  id: string;
  fileName: string;
  sheetIndex: number;
  sheetsInFile: number;
  previewUrl: string;
  status: "decoding" | "ocr" | "ready" | "saved" | "error";
  error?: string;
  decoded?: DecodedSheet;
  student?: ResolvedSheetStudent;
  fields?: Record<OCRFieldKey, FieldState>;
  evaluatedAt?: string;
  observations?: string;
  startedAt?: number;
  durationMs?: number;
  usedAI?: boolean;
  importMethod?: "pdf" | "photo" | "scan";
};

function ImportPage() {
  const { tenantId } = useCurrentTenant();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const resolveFn = useServerFn(resolveSheetToken);
  const aiFn = useServerFn(ocrSheetImage);
  const [entries, setEntries] = useState<SheetEntry[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [lastSource, setLastSource] = useState<"camera" | "files" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const studentsList = useQuery({
    queryKey: ["students-lite", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, sex, birth_date, class_id, group_id, class:classes(name)")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        full_name: string;
        sex: string;
        birth_date: string;
        class_id: string | null;
        group_id: string | null;
        class: { name?: string | null } | null;
      }>;
    },
  });

  const changeStudent = (entryId: string, studentId: string) => {
    const s = studentsList.data?.find((x) => x.id === studentId);
    if (!s || !tenantId) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              student: {
                studentId: s.id,
                studentName: s.full_name,
                birthDate: s.birth_date,
                sex: s.sex,
                classId: s.class_id,
                groupId: s.group_id,
                className: s.class?.name ?? null,
                tenantId,
              },
            }
          : e,
      ),
    );
  };

  const runLocalOCR = useCallback(
    async (entry: SheetEntry): Promise<Record<OCRFieldKey, FieldState>> => {
      const baseCanvas = await dataUrlToCanvas(entry.decoded!.previewDataUrl);
      // O preview é pequeno demais; recarregar a imagem cheia a partir do base64.
      const fullDataUrl = `data:${entry.decoded!.mime};base64,${entry.decoded!.imageBase64}`;
      const full = await dataUrlToCanvas(fullDataUrl).catch(() => baseCanvas);

      const out = {} as Record<OCRFieldKey, FieldState>;
      // Sequencial para não saturar o worker do Tesseract.
      for (const key of OCR_FIELD_KEYS) {
        const roi = roiInCrop(SHEET_FIELD_ROIS[key]);
        const crop = enhance(cropROI(full, roi, 3));
        try {
          const r = await ocrField(crop);
          out[key] = {
            value: r.value == null ? "" : String(r.value),
            confidence: r.confidence,
            source: "ocr",
          };
        } catch {
          out[key] = { value: "", confidence: 0, source: "ocr" };
        }
      }
      return out;
    },
    [],
  );

  const tryReadDate = useCallback(async (entry: SheetEntry): Promise<string | null> => {
    try {
      const fullDataUrl = `data:${entry.decoded!.mime};base64,${entry.decoded!.imageBase64}`;
      const full = await dataUrlToCanvas(fullDataUrl);
      const crop = enhance(cropROI(full, roiInCrop(DATE_ROI), 3));
      const r = await ocrDate(crop);
      return r.value;
    } catch {
      return null;
    }
  }, []);

  const addFiles = useCallback(
    async (files: FileList | File[], method: "pdf" | "photo" | "scan") => {
      const incoming = Array.from(files);
      const list: { file: File; method: "pdf" | "photo" | "scan" }[] = [];
      for (const f of incoming) {
        if (isPdfFile(f)) {
          try {
            const pages = await rasterizePdfToImages(f);
            pages.forEach((p) => list.push({ file: p, method: "pdf" }));
            if (pages.length > 1) toast.success(`${pages.length} páginas extraídas de "${f.name}"`);
          } catch {
            toast.error(`Não foi possível abrir o PDF "${f.name}"`);
          }
        } else if (f.type.startsWith("image/")) {
          list.push({ file: f, method });
        }
      }
      if (list.length === 0) {
        toast.error("Selecione PDFs ou imagens (JPG, PNG, WEBP)");
        return;
      }

      for (const { file, method: m } of list) {
        const placeholderId = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`;
        const fallbackUrl = URL.createObjectURL(file);
        const placeholder: SheetEntry = {
          id: placeholderId,
          fileName: file.name,
          sheetIndex: 0,
          sheetsInFile: 1,
          previewUrl: fallbackUrl,
          status: "decoding",
          startedAt: Date.now(),
          importMethod: m,
        };
        setEntries((prev) => [...prev, placeholder]);

        let decodedList: DecodedSheet[] = [];
        try {
          decodedList = await decodeSheetsInImage(file);
        } catch (err) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === placeholderId
                ? { ...e, status: "error", error: err instanceof Error ? err.message : "Falha ao ler QR" }
                : e,
            ),
          );
          continue;
        }
        if (decodedList.length > 1) toast.success(`${decodedList.length} fichas detectadas em "${file.name}"`);

        const expanded: SheetEntry[] = decodedList.map((dec, idx) => ({
          id: `${placeholderId}-${idx}`,
          fileName: file.name,
          sheetIndex: idx,
          sheetsInFile: decodedList.length,
          previewUrl: dec.previewDataUrl,
          status: "ocr",
          decoded: dec,
          startedAt: Date.now(),
          importMethod: m,
        }));
        setEntries((prev) => {
          const out = [...prev];
          const i = out.findIndex((e) => e.id === placeholderId);
          if (i >= 0) out.splice(i, 1, ...expanded);
          else out.push(...expanded);
          return out;
        });

        for (const entry of expanded) {
          try {
            // 1) Resolve aluno via servidor (sem IA).
            const student = await resolveFn({ data: { token: entry.decoded!.token } });

            // 2) OCR local + tentativa de data, em paralelo.
            const [fields, isoDate] = await Promise.all([
              runLocalOCR(entry),
              tryReadDate(entry),
            ]);

            setEntries((prev) =>
              prev.map((e) =>
                e.id === entry.id
                  ? {
                      ...e,
                      status: "ready",
                      student,
                      fields,
                      evaluatedAt: isoDate ?? "",
                      observations: "",
                      durationMs: Date.now() - (e.startedAt ?? Date.now()),
                    }
                  : e,
              ),
            );
          } catch (err) {
            setEntries((prev) =>
              prev.map((e) =>
                e.id === entry.id
                  ? { ...e, status: "error", error: err instanceof Error ? err.message : "Falha desconhecida" }
                  : e,
              ),
            );
          }
        }
      }
    },
    [resolveFn, runLocalOCR, tryReadDate],
  );

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setLastSource("files");
      void addFiles(e.target.files, "photo");
    }
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      setLastSource("files");
      void addFiles(e.dataTransfer.files, "photo");
    }
  };

  const onCameraCapture = useCallback(
    (file: File) => {
      setCameraOpen(false);
      setLastSource("camera");
      void addFiles([file], "scan");
    },
    [addFiles],
  );

  const updateField = (id: string, key: OCRFieldKey, value: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id && e.fields
          ? {
              ...e,
              fields: {
                ...e.fields,
                [key]: { ...e.fields[key], value, source: "manual", confidence: 1 },
              },
            }
          : e,
      ),
    );
  };
  const updateDate = (id: string, value: string) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, evaluatedAt: value } : e)));
  const updateObs = (id: string, value: string) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, observations: value } : e)));

  const removeEntry = (id: string) =>
    setEntries((prev) => {
      const e = prev.find((x) => x.id === id);
      if (e) URL.revokeObjectURL(e.previewUrl);
      return prev.filter((x) => x.id !== id);
    });

  /** Recurso opcional: substitui a leitura pelo OCR da IA configurada no tenant. */
  const aiAssist = useMutation({
    mutationFn: async (entry: SheetEntry) => {
      if (!entry.decoded) throw new Error("Imagem indisponível");
      const res = await aiFn({
        data: {
          token: entry.decoded.token,
          imageBase64: entry.decoded.imageBase64,
          mime: entry.decoded.mime,
        },
      });
      return res;
    },
    onSuccess: (res, entry) => {
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entry.id) return e;
          const fields = { ...(e.fields ?? ({} as Record<OCRFieldKey, FieldState>)) };
          for (const k of OCR_FIELD_KEYS) {
            const v = res.ocr.fields[k].value;
            fields[k] = {
              value: v == null ? "" : String(v),
              confidence: res.ocr.fields[k].confidence,
              source: "ai",
            };
          }
          return {
            ...e,
            fields,
            evaluatedAt: e.evaluatedAt || res.ocr.evaluated_at || "",
            observations: e.observations || res.ocr.observations || "",
            usedAI: true,
          };
        }),
      );
      toast.success(`IA reinterpretou a ficha de ${entry.student?.studentName ?? "aluno"}`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao chamar IA"),
  });

  const saveOne = useMutation({
    mutationFn: async (entry: SheetEntry) => {
      if (!entry.student || !entry.fields || !tenantId) throw new Error("Dados incompletos");
      if (!entry.evaluatedAt) throw new Error("Informe a data da avaliação antes de salvar");

      const numeric: Partial<Record<OCRFieldKey, number | null>> = {};
      for (const k of OCR_FIELD_KEYS) {
        const raw = (entry.fields[k].value ?? "").trim();
        if (raw === "") numeric[k] = null;
        else {
          const n = parseFloat(raw.replace(",", "."));
          numeric[k] = Number.isFinite(n) ? n : null;
        }
      }
      const date = entry.evaluatedAt;
      const age = ageFromBirth(entry.student.birthDate, new Date(date));
      const payload: Record<string, unknown> = {
        tenant_id: tenantId,
        student_id: entry.student.studentId,
        evaluated_at: date,
        age_years: age,
      };
      for (const k of OCR_FIELD_KEYS) payload[k] = numeric[k] ?? null;
      payload.imc = calcImc(payload.weight_kg as number | null, payload.height_cm as number | null);
      payload.rce = calcRce(payload.waist_cm as number | null, payload.height_cm as number | null);
      payload.classifications = classifyAll({
        sex: entry.student.sex as Sex,
        age,
        weight_kg: payload.weight_kg as number | null,
        height_cm: payload.height_cm as number | null,
        waist_cm: payload.waist_cm as number | null,
        sit_and_reach_cm: payload.sit_and_reach_cm as number | null,
        abdominal_reps: payload.abdominal_reps as number | null,
        horizontal_jump_cm: payload.horizontal_jump_cm as number | null,
        medicine_ball_m: payload.medicine_ball_m as number | null,
        square_test_s: payload.square_test_s as number | null,
        sprint_20m_s: payload.sprint_20m_s as number | null,
        run_6min_m: payload.run_6min_m as number | null,
      });
      // Avaliação importada entra como uma nova avaliação no histórico do aluno
      // (não há unique constraint em student_id,evaluated_at — usar INSERT puro).
      const { data: u0 } = await supabase.auth.getUser();
      if (u0.user?.id) payload.evaluator_id = u0.user.id;
      const { error } = await supabase
        .from("evaluations")
        .insert(payload as never);
      if (error) throw error;

      // Log de auditoria (não bloqueia; respeita RLS exigindo actor_id = auth.uid()).
      const confidences = OCR_FIELD_KEYS.map((k) => entry.fields![k].confidence);
      const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u.user?.id) {
          await supabase.from("audit_logs").insert({
            actor_id: u.user.id,
            actor_email: u.user.email ?? null,
            tenant_id: tenantId,
            action: "evaluation.import",
            entity_type: "evaluation",
            entity_id: entry.student.studentId,
            metadata: {
              method: entry.importMethod ?? "photo",
              avg_confidence: Number(avg.toFixed(3)),
              used_ai: !!entry.usedAI,
              duration_ms: entry.durationMs ?? null,
            },
          } as never);
        }
      } catch {
        /* logs não devem bloquear */
      }
    },
    onSuccess: (_d, entry) => {
      toast.success(`${entry.student?.studentName ?? "Aluno"} — avaliação salva`, {
        action:
          lastSource === "camera"
            ? { label: "Escanear próxima", onClick: () => setCameraOpen(true) }
            : undefined,
        duration: lastSource === "camera" ? 8000 : 4000,
      });
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: "saved" } : e)));
    },
    onError: (err: unknown) => {
      const msg =
        (err as { message?: string; details?: string; hint?: string } | null)?.message ||
        (err as { details?: string } | null)?.details ||
        (typeof err === "string" ? err : "Erro ao salvar");
      toast.error(`Erro ao salvar: ${msg}`);
      // Loga no console para inspeção do desenvolvedor.
      // eslint-disable-next-line no-console
      console.error("[evaluations.import] save failed", err);
    },
  });

  const progress = useMemo(() => {
    if (entries.length === 0) return 0;
    const done = entries.filter((e) => e.status === "ready" || e.status === "saved" || e.status === "error").length;
    return Math.round((done / entries.length) * 100);
  }, [entries]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Importar fichas (Modo Prancheta)"
        description="Pipeline híbrido: o QR identifica o aluno, o OCR tradicional lê campo por campo pelo layout fixo da ficha. A IA do seu espaço é opcional, apenas como apoio."
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/evaluations" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
        }
      />

      <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className={cn(
            "group flex items-center gap-4 rounded-2xl border bg-card p-5 text-left shadow-soft transition hover:border-primary/60 hover:shadow-md",
            isMobile ? "order-1 ring-2 ring-primary/40" : "order-2",
          )}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Camera className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-display text-base font-semibold">Escanear fichas</div>
            <div className="text-xs text-muted-foreground">
              {isMobile ? "Aponte a câmera para a ficha — captura automática" : "Use a webcam para escanear uma ficha por vez"}
            </div>
          </div>
          <Badge variant="secondary" className="hidden text-[10px] sm:inline-flex">
            <Zap className="mr-1 h-3 w-3" /> Auto
          </Badge>
        </button>

        <button
          type="button"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group flex w-full items-center gap-4 rounded-2xl border-2 border-dashed bg-card p-5 text-left shadow-soft transition hover:border-primary/60",
            isMobile ? "order-2" : "order-1 ring-2 ring-primary/40",
          )}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-display text-base font-semibold">Importar arquivos</div>
            <div className="text-xs text-muted-foreground">
              PDF, JPG, PNG ou WEBP — arraste aqui ou{" "}
              <span className="font-medium text-primary underline-offset-2 group-hover:underline">escolha um arquivo</span>.
            </div>
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onSelect}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        <Upload className="mr-1 inline h-3 w-3" />
        Leitura padrão por <strong>OCR tradicional</strong> (sem custo de IA). Use o botão{" "}
        <strong>Interpretar com IA</strong> em caso de baixa confiança — usa a IA configurada em{" "}
        <strong>Configurações → Inteligência Artificial</strong>.
      </p>

      <CameraScanner open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={onCameraCapture} />

      {entries.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso de leitura</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      <div className="space-y-4">
        {entries.map((e) => (
          <SheetCard
            key={e.id}
            entry={e}
            students={studentsList.data ?? []}
            onChangeStudent={(sid) => changeStudent(e.id, sid)}
            onChangeField={(k, v) => updateField(e.id, k, v)}
            onChangeDate={(v) => updateDate(e.id, v)}
            onChangeObs={(v) => updateObs(e.id, v)}
            onSave={() => saveOne.mutate(e)}
            onAI={() => aiAssist.mutate(e)}
            onRemove={() => removeEntry(e.id)}
            saving={saveOne.isPending && saveOne.variables?.id === e.id}
            aiBusy={aiAssist.isPending && aiAssist.variables?.id === e.id}
          />

        ))}
      </div>
    </div>
  );
}

function SheetCard({
  entry,
  students,
  onChangeStudent,
  onChangeField,
  onChangeDate,
  onChangeObs,
  onSave,
  onAI,
  onRemove,
  saving,
  aiBusy,
}: {
  entry: SheetEntry;
  students: Array<{ id: string; full_name: string; class: { name?: string | null } | null }>;
  onChangeStudent: (studentId: string) => void;
  onChangeField: (k: OCRFieldKey, v: string) => void;
  onChangeDate: (v: string) => void;
  onChangeObs: (v: string) => void;
  onSave: () => void;
  onAI: () => void;
  onRemove: () => void;
  saving: boolean;
  aiBusy: boolean;
}) {
  const statusLabel: Record<SheetEntry["status"], string> = {
    decoding: "Lendo QR Code…",
    ocr: "Lendo campos (OCR local)…",
    ready: "Revisar e salvar",
    saved: "Salva",
    error: "Erro",
  };

  const avgConfidence = useMemo(() => {
    if (!entry.fields) return 0;
    const arr = OCR_FIELD_KEYS.map((k) => entry.fields![k].confidence);
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }, [entry.fields]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="space-y-2">
          <img
            src={entry.previewUrl}
            alt={entry.sheetsInFile > 1 ? `${entry.fileName} — ficha ${entry.sheetIndex + 1}/${entry.sheetsInFile}` : entry.fileName}
            className="aspect-[3/4] w-full rounded-lg border border-border object-cover"
          />
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant={entry.status === "saved" ? "default" : entry.status === "error" ? "destructive" : "secondary"}
              className="gap-1"
            >
              {entry.status === "decoding" || entry.status === "ocr" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : entry.status === "saved" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : entry.status === "error" ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <ScanLine className="h-3 w-3" />
              )}
              {statusLabel[entry.status]}
            </Badge>
            <Button size="icon" variant="ghost" onClick={onRemove} aria-label="Remover">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {entry.fields && (
            <div className="text-[11px] text-muted-foreground">
              Confiança média: <strong>{Math.round(avgConfidence * 100)}%</strong>
              {entry.usedAI && <Badge variant="outline" className="ml-1 text-[10px]">IA usada</Badge>}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {entry.status === "error" && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {entry.error}
            </div>
          )}

          {entry.student && entry.fields && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-[240px] space-y-1">
                  <Label className="text-xs">Aluno avaliado *</Label>
                  <Select
                    value={entry.student.studentId}
                    onValueChange={onChangeStudent}
                    disabled={entry.status === "saved"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name}
                          {s.class?.name ? ` — ${s.class.name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-[11px] text-muted-foreground">
                    QR identificou <strong>{entry.student.studentName}</strong> · você pode trocar o aluno antes de salvar.
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onAI}
                  disabled={aiBusy || entry.status === "saved"}
                  className="gap-1"
                >
                  {aiBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Interpretar com IA
                </Button>
              </div>


              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Data da avaliação *</Label>
                  <Input
                    type="date"
                    value={entry.evaluatedAt ?? ""}
                    onChange={(ev) => onChangeDate(ev.target.value)}
                    disabled={entry.status === "saved"}
                    className={cn(!entry.evaluatedAt && "border-amber-400")}
                  />
                  {!entry.evaluatedAt && (
                    <p className="text-[10px] text-amber-600">
                      Não foi possível identificar a data na ficha — informe manualmente.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {OCR_FIELD_KEYS.map((k) => {
                  const f = entry.fields![k];
                  const low = f.confidence < OCR_CONFIDENCE_THRESHOLD;
                  const numeric = f.value === "" ? null : parseFloat(f.value.replace(",", "."));
                  const oor = isOutOfRange(k, Number.isFinite(numeric ?? NaN) ? numeric : null);
                  const sourceBadge =
                    f.source === "ai" ? "IA" : f.source === "manual" ? "Manual" : "OCR";
                  return (
                    <div key={k} className="space-y-1">
                      <Label className="flex items-center justify-between text-xs">
                        <span>
                          {OCR_FIELD_LABEL[k].label}{" "}
                          <span className="text-muted-foreground">({OCR_FIELD_LABEL[k].unit})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[9px] px-1 py-0">{sourceBadge}</Badge>
                          <span className={cn("text-[10px]", low ? "text-amber-600" : "text-muted-foreground")}>
                            {Math.round(f.confidence * 100)}%
                          </span>
                        </span>
                      </Label>
                      <Input
                        inputMode="decimal"
                        value={f.value}
                        onChange={(ev) => onChangeField(k, ev.target.value)}
                        disabled={entry.status === "saved"}
                        className={cn(
                          oor && "border-amber-400 bg-amber-50 dark:bg-amber-950/30",
                          low && !oor && "border-amber-300",
                        )}
                      />
                      {oor && (
                        <p className="text-[10px] text-amber-600">Valor fora da faixa esperada — confirme.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Observações</Label>
                <Textarea
                  rows={2}
                  value={entry.observations ?? ""}
                  onChange={(ev) => onChangeObs(ev.target.value)}
                  disabled={entry.status === "saved"}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={onSave}
                  disabled={entry.status === "saved" || saving || !entry.evaluatedAt}
                  className="bg-gradient-brand text-primary-foreground"
                >
                  {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
                  {entry.status === "saved" ? "Salva" : "Confirmar e salvar"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
