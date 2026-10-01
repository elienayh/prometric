import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Brain, ClipboardList, Download, ExternalLink, Eye, Layers, LineChart, Loader2, Pencil, Plus, ScanLine, Search, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import {
  TEST_META, ageFromBirth, calcImc, calcRce, classifyAll, overallScore, zoneColor,
  type Classifications, type Sex,
} from "@/lib/proesp";
import { ageInYears, ageInMonths } from "@/lib/age";
import { prometricIndex, categoryColor } from "@/lib/prometric-method";
import { consolidatedClassifications, currentEvaluation } from "@/lib/student-metrics";
import {
  validateField, validateEvaluation, normalizeHeight, normalizeEvaluationValues,
  isAgeInProespRange, PROESP_AGE_WARNING,
} from "@/lib/validation";
import type { ReportEval } from "@/lib/pdf-report";
import { downloadStudentEvolutionPDF } from "@/lib/pdf-evolution-report";
import { generateDiagnosis } from "@/lib/ai-diagnosis.functions";
import { buildDeterministicDiagnosis } from "@/lib/deterministic-diagnosis";
import { cn } from "@/lib/utils";
import { Run6MinInput } from "@/components/evaluations/run6min-input";

export const Route = createFileRoute("/_authenticated/evaluations/")({
  head: () => ({ meta: [{ title: "Avaliações — ProMetric" }] }),
  component: EvaluationsPage,
});

type StudentLite = { id: string; full_name: string; sex: Sex; birth_date: string };

type EvalRow = {
  id: string; student_id: string; evaluated_at: string; age_years: number | null;
  weight_kg: number | null; height_cm: number | null; imc: number | null;
  classifications: Classifications; ai_diagnosis: string | null;
  student: { full_name: string; sex: Sex; birth_date: string };
};

function EvaluationsPage() {
  const { tenantId, tenant } = useCurrentTenant();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [openDetail, setOpenDetail] = useState<string | null>(null);

  const students = useQuery({
    queryKey: ["students-lite", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students").select("id,full_name,sex,birth_date")
        .eq("tenant_id", tenantId!).eq("is_active", true).order("full_name");
      if (error) throw error;
      return data as StudentLite[];
    },
  });

  const list = useQuery({
    queryKey: ["evaluations", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("id,student_id,tenant_id,evaluated_at,age_years,weight_kg,height_cm,imc,classifications,ai_diagnosis,student:students(full_name,sex,birth_date)")
        .eq("tenant_id", tenantId!)
        .order("evaluated_at", { ascending: false });
      if (error) throw error;
      return data as unknown as EvalRow[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("evaluations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Avaliação removida"); qc.invalidateQueries({ queryKey: ["evaluations"] }); qc.invalidateQueries({ queryKey: ["class-stats"] }); qc.invalidateQueries({ queryKey: ["group-stats"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div>
      <PageHeader
        title="Central de Avaliações"
        description="Visão operacional das avaliações — o cadastro principal acontece na ficha do aluno."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/evaluations/import">
                <ScanLine className="mr-1.5 h-4 w-4" /> Importar fichas
              </Link>
            </Button>
            <Button onClick={() => setOpenNew(true)} className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">

              <Plus className="mr-1.5 h-4 w-4" /> Nova
            </Button>
          </div>
        }
      />

      {list.isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : !list.data?.length ? (
        <EmptyState
          title="Sem avaliações"
          description="Aplique os 7 testes ProMetric — IMC, RCE, classificações e PDF são gerados automaticamente."
          actionLabel="Nova avaliação"
          onAction={() => setOpenNew(true)}
        />
      ) : (
        <CentralSections
          all={list.data}
          tenantName={tenant?.name ?? "ProMetric"}
        />
      )}

      {openNew && (
        <EvaluationDialog
          mode="single" tenantId={tenantId} students={students.data ?? []}
          onClose={() => setOpenNew(false)}
        />
      )}
      {openDetail && (
        <EvaluationDetail
          id={openDetail} tenantName={tenant?.name ?? "ProMetric"}
          onClose={() => setOpenDetail(null)} onDelete={(id) => { del.mutate(id); setOpenDetail(null); }}
        />
      )}
    </div>
  );
}

type StudentSummary = {
  student_id: string;
  full_name: string;
  count: number;
  lastDate: string;
  lastEvalId: string;
  score: number;
  category: string | null;
  tenantId: string;
};

function StudentCard({ s, tenantName }: { s: StudentSummary; tenantName: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<null | "evolutivo" | "portal">(null);

  const openFicha = () => navigate({ to: "/students/$id", params: { id: s.student_id } });


  const reportEvolutivo = async () => {
    try {
      setBusy("evolutivo");
      const { data, error } = await supabase
        .from("evaluations")
        .select("*, student:students(full_name,sex,birth_date)")
        .eq("id", s.lastEvalId).single();
      if (error) throw error;
      await downloadStudentEvolutionPDF(s.student_id, s.tenantId, tenantName);
      void (data as unknown as ReportEval);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar PDF");
    } finally { setBusy(null); }
  };

  const openPortal = async () => {
    try {
      setBusy("portal");
      const { data, error } = await supabase
        .from("students").select("portal_enabled,portal_token")
        .eq("id", s.student_id).maybeSingle();
      if (error) throw error;
      if (!data?.portal_enabled || !data?.portal_token) {
        toast.info("Portal ainda não ativado. Ative na ficha do aluno.");
        openFicha();
        return;
      }
      window.open(`${window.location.origin}/portal/aluno/${data.portal_token}`, "_blank");
      qc.invalidateQueries({ queryKey: ["student-portal", s.student_id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao abrir portal");
    } finally { setBusy(null); }
  };

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button
            type="button"
            onClick={openFicha}
            className="truncate text-left font-display text-base font-semibold hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label={`Abrir ficha de ${s.full_name}`}
          >
            {s.full_name}
          </button>
          <p className="text-xs text-muted-foreground">
            {s.count} avaliaç{s.count === 1 ? "ão" : "ões"} realizada{s.count === 1 ? "" : "s"}
          </p>
        </div>
        {s.category && (
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", categoryColor(s.category as any))}>
            {s.category}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/40 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Última</div>
          <div className="font-display text-sm font-bold">{new Date(s.lastDate).toLocaleDateString("pt-BR")}</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Índice</div>
          <div className="font-display text-sm font-bold tabular-nums">{s.score}</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Perfil</div>
          <div className="font-display text-[11px] font-bold leading-tight">{s.category ?? "—"}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" onClick={openFicha} className="min-h-10">
          <Eye className="mr-1 h-3.5 w-3.5" /> Ficha
        </Button>
        <Button size="sm" variant="outline" onClick={openPortal} disabled={busy === "portal"} className="min-h-10">
          {busy === "portal" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="mr-1 h-3.5 w-3.5" />}
          Portal
        </Button>
        <Button size="sm" onClick={reportEvolutivo} disabled={busy === "evolutivo"}
          className="min-h-10 bg-gradient-brand text-primary-foreground hover:opacity-90">
          {busy === "evolutivo" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <LineChart className="mr-1 h-3.5 w-3.5" />}
          Relatório Evolutivo
        </Button>

      </div>
    </div>
  );
}

function CentralSections({ all, tenantName }: {
  all: EvalRow[]; tenantName: string;
}) {
  const [query, setQuery] = useState("");

  const summaries = useMemo<StudentSummary[]>(() => {
    const map = new Map<string, EvalRow[]>();
    for (const ev of all) {
      if (!map.has(ev.student_id)) map.set(ev.student_id, []);
      map.get(ev.student_id)!.push(ev);
    }
    const out: StudentSummary[] = [];
    for (const [sid, evs] of map) {
      const sorted = [...evs].sort((a, b) => b.evaluated_at.localeCompare(a.evaluated_at));
      const last = sorted[0];
      const current = currentEvaluation(evs) ?? last;
      const classifications = consolidatedClassifications(evs);
      const pm = prometricIndex(classifications);
      const fallback = overallScore(classifications).label;
      out.push({
        student_id: sid,
        full_name: last.student.full_name,
        count: evs.length,
        lastDate: last.evaluated_at,
        lastEvalId: current.id,
        score: pm.score,
        category: pm.category ?? fallback ?? null,
        tenantId: (last as any).tenant_id ?? "",
      });
    }
    out.sort((a, b) => b.lastDate.localeCompare(a.lastDate));
    return out;
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return summaries;
    return summaries.filter((s) => s.full_name.toLowerCase().includes(q));
  }, [summaries, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} aluno{filtered.length === 1 ? "" : "s"} avaliado{filtered.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <StudentCard key={s.student_id} s={s} tenantName={tenantName} />
        ))}
      </div>
    </div>
  );
}

// =================================================================
// Dialog: criação (single ou batch)
// =================================================================
type FieldKey =
  | "weight_kg" | "height_cm" | "wingspan_cm" | "waist_cm" | "hip_cm"
  | "sit_and_reach_cm" | "abdominal_reps" | "horizontal_jump_cm"
  | "medicine_ball_m" | "square_test_s" | "sprint_20m_s" | "run_6min_m";

const FIELDS: { key: FieldKey; label: string; unit: string; step?: string }[] = [
  { key: "weight_kg", label: "Peso", unit: "kg", step: "0.1" },
  { key: "height_cm", label: "Estatura", unit: "cm", step: "0.1" },
  { key: "wingspan_cm", label: "Envergadura", unit: "cm", step: "0.1" },
  { key: "waist_cm", label: "Cintura", unit: "cm", step: "0.1" },
  { key: "hip_cm", label: "Quadril", unit: "cm", step: "0.1" },
  { key: "sit_and_reach_cm", label: "Flexibilidade", unit: "cm", step: "0.1" },
  { key: "abdominal_reps", label: "Abdominal 1min", unit: "reps" },
  { key: "horizontal_jump_cm", label: "Salto horizontal", unit: "cm", step: "0.1" },
  { key: "medicine_ball_m", label: "Medicine ball 2kg", unit: "m", step: "0.01" },
  { key: "square_test_s", label: "Agilidade (quadrado)", unit: "s", step: "0.01" },
  { key: "sprint_20m_s", label: "Velocidade 20m", unit: "s", step: "0.01" },
  { key: "run_6min_m", label: "Corrida 6min", unit: "m", step: "1" },
];

function EvaluationDialog({
  mode, tenantId, students, onClose,
}: {
  mode: "single" | "batch"; tenantId: string | null; students: StudentLite[]; onClose: () => void;
}) {
  const qc = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [singleId, setSingleId] = useState<string>("");
  const [evaluatedAt, setEvaluatedAt] = useState(new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState<Record<FieldKey, string>>({} as any);
  const [notes, setNotes] = useState("");

  // Validações em tempo real e aviso de faixa etária PROESP
  const selectedStudent = useMemo(() => students.find((x) => x.id === singleId), [students, singleId]);
  const selectedStudentAge = useMemo(() => {
    if (!selectedStudent) return null;
    return ageInYears(selectedStudent.birth_date, evaluatedAt);
  }, [selectedStudent, evaluatedAt]);

  const save = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Sem tenant");
      const ids = mode === "single" ? (singleId ? [singleId] : []) : selectedIds;
      if (!ids.length) throw new Error("Selecione aluno(s)");

      const numeric = (k: FieldKey): number | null => {
        const v = values[k]; if (v == null || v === "") return null;
        if (k === "height_cm") {
          const norm = normalizeHeight(v);
          return norm.normalized;
        }
        const n = parseFloat(v.replace(",", ".")); return isNaN(n) ? null : n;
      };

      const rows = ids.map((sid) => {
        const s = students.find((x) => x.id === sid)!;
        const age = ageInYears(s.birth_date, evaluatedAt);
        const ageMonths = ageInMonths(s.birth_date, evaluatedAt);
        const base: any = {
          tenant_id: tenantId, student_id: sid, evaluated_at: evaluatedAt,
          age_years: age,
          age_months: ageMonths,
          notes: notes || null,
        };
        for (const f of FIELDS) base[f.key] = numeric(f.key);

        // Validação estrita de integridade
        const valRes = validateEvaluation(base, age);
        if (valRes.hasBlockingErrors) {
          const firstErr = Object.values(valRes.errors)[0];
          throw new Error(`${s.full_name}: ${firstErr}`);
        }

        base.imc = calcImc(base.weight_kg, base.height_cm);
        base.rce = calcRce(base.waist_cm, base.height_cm);
        base.classifications = classifyAll({
          sex: s.sex, age, age_months: ageMonths,
          weight_kg: base.weight_kg, height_cm: base.height_cm,
          waist_cm: base.waist_cm, hip_cm: base.hip_cm,
          sit_and_reach_cm: base.sit_and_reach_cm,
          abdominal_reps: base.abdominal_reps,
          horizontal_jump_cm: base.horizontal_jump_cm,
          medicine_ball_m: base.medicine_ball_m,
          square_test_s: base.square_test_s,
          sprint_20m_s: base.sprint_20m_s,
          run_6min_m: base.run_6min_m,
        });
        return base;
      });

      const { error } = await supabase.from("evaluations").insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (n) => {
      toast.success(`${n} avaliação(ões) registrada(s)`);
      qc.invalidateQueries({ queryKey: ["evaluations"] });
      qc.invalidateQueries({ queryKey: ["class-stats"] });
      qc.invalidateQueries({ queryKey: ["group-stats"] });

      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar avaliação"),
  });

  // Preview de classificação (single)
  const preview = useMemo(() => {
    const s = students.find((x) => x.id === singleId);
    if (!s || mode !== "single") return null;
    const age = ageInYears(s.birth_date, evaluatedAt);
    const ageMonths = ageInMonths(s.birth_date, evaluatedAt);
    const n = (k: FieldKey) => {
      const v = values[k]; if (!v) return null;
      const p = parseFloat(v.replace(",", ".")); return isNaN(p) ? null : p;
    };
    return classifyAll({
      sex: s.sex, age, age_months: ageMonths,
      weight_kg: n("weight_kg"), height_cm: n("height_cm"),
      waist_cm: n("waist_cm"), hip_cm: n("hip_cm"),
      sit_and_reach_cm: n("sit_and_reach_cm"), abdominal_reps: n("abdominal_reps"),
      horizontal_jump_cm: n("horizontal_jump_cm"), medicine_ball_m: n("medicine_ball_m"),
      square_test_s: n("square_test_s"), sprint_20m_s: n("sprint_20m_s"),
      run_6min_m: n("run_6min_m"),
    });
  }, [singleId, values, evaluatedAt, students, mode]);

  return (
    <Dialog open onOpenChange={(b) => !b && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "batch" ? <Layers className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
            {mode === "batch" ? "Avaliação em lote" : "Nova avaliação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Data</Label>
              <Input type="date" value={evaluatedAt} onChange={(e) => setEvaluatedAt(e.target.value)} />
            </div>
            {mode === "single" ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Aluno*</Label>
                <Select value={singleId} onValueChange={setSingleId}>
                  <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs">Alunos selecionados</Label>
                <div className="text-sm">{selectedIds.length} de {students.length}</div>
              </div>
            )}
          </div>

          {mode === "single" && selectedStudentAge != null && !isAgeInProespRange(selectedStudentAge) && (
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
              <p className="font-semibold">Faixa etária ({selectedStudentAge} anos):</p>
              <p>{PROESP_AGE_WARNING}</p>
            </div>
          )}

          {mode === "batch" && (
            <div className="max-h-48 overflow-auto rounded-lg border border-border p-2">
              <div className="mb-2 flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedIds(students.map((s) => s.id))}>Todos</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Nenhum</Button>
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                {students.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-muted/50">
                    <input
                      type="checkbox" checked={selectedIds.includes(s.id)}
                      onChange={(e) => setSelectedIds((p) => e.target.checked ? [...p, s.id] : p.filter((x) => x !== s.id))}
                    />
                    <span className="truncate">{s.full_name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {FIELDS.map((f) => {
              const valResult = validateField(f.key, values[f.key]);
              return (
                <div key={f.key} className={cn("space-y-1.5", f.key === "run_6min_m" && "sm:col-span-2")}>
                  <Label className="text-xs">
                    {f.label} <span className="text-muted-foreground">({f.unit})</span>
                  </Label>
                  {f.key === "run_6min_m" ? (
                    <Run6MinInput
                      value={values[f.key] ?? ""}
                      onChange={(v) => setValues((p) => ({ ...p, [f.key]: v }))}
                    />
                  ) : (
                    <Input
                      type="number" step={f.step ?? "1"} inputMode="decimal"
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                      onBlur={() => {
                        if (f.key === "height_cm" && values[f.key]) {
                          const hRes = normalizeHeight(values[f.key]);
                          if (hRes.convertedFromMeters && hRes.normalized != null) {
                            setValues((p) => ({ ...p, height_cm: String(hRes.normalized) }));
                            toast.info(`Altura convertida para ${hRes.normalized} cm`);
                          }
                        }
                      }}
                      className={cn(
                        valResult.severity === "error" && "border-destructive focus-visible:ring-destructive",
                        valResult.severity === "warning" && "border-warning focus-visible:ring-warning",
                      )}
                    />
                  )}
                  {valResult.message && (
                    <p className={cn("text-[10px]", valResult.severity === "error" ? "text-destructive font-medium" : "text-warning")}>
                      {valResult.message}
                    </p>
                  )}
                  {mode === "single" && preview?.[mapKey(f.key)] && (
                    <span className={cn("inline-block rounded-full border px-1.5 py-0.5 text-[10px]", zoneColor(preview[mapKey(f.key)]))}>
                      {preview[mapKey(f.key)]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Observações</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function mapKey(k: FieldKey): keyof Classifications {
  const m: Partial<Record<FieldKey, keyof Classifications>> = {
    sit_and_reach_cm: "flex", abdominal_reps: "abdo", horizontal_jump_cm: "jump",
    medicine_ball_m: "mball", square_test_s: "square", sprint_20m_s: "sprint", run_6min_m: "run6",
  };
  return (m[k] ?? "imc") as keyof Classifications;
}

// =================================================================
// Detail dialog: PDF + IA
// =================================================================
function EvaluationDetail({
  id, tenantName, onClose, onDelete,
}: { id: string; tenantName: string; onClose: () => void; onDelete: (id: string) => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const aiFn = useServerFn(generateDiagnosis);
  const [activeTab, setActiveTab] = useState<"diagnosis" | "technical" | "family" | "goals">("diagnosis");
  const [copied, setCopied] = useState(false);

  const detail = useQuery({
    queryKey: ["evaluation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*, student:students(full_name,sex,birth_date)")
        .eq("id", id).single();
      if (error) throw error;
      return data as unknown as ReportEval;
    },
  });

  const ai = useMutation({
    mutationFn: async () => {
      try {
        return await aiFn({ data: { evaluationId: id } });
      } catch (err) {
        console.warn("[evaluations] Server RPC falhou, acionando gerador determinístico local:", err);
        if (ev) {
          const res = buildDeterministicDiagnosis(ev as any);
          await supabase
            .from("evaluations")
            .update({
              ai_diagnosis: res.diagnosis + res.signature,
              ai_technical: res.technical + res.signature,
              ai_family: res.family + res.signature,
              ai_goals: res.goals,
            })
            .eq("id", id);
          return res;
        }
        throw err;
      }
    },
    onSuccess: () => {
      toast.success("Diagnóstico gerado pelo Modelo ProMetric®");
      qc.invalidateQueries({ queryKey: ["evaluation", id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro IA"),
  });

  const ev = detail.data;
  const overall = ev ? overallScore(ev.classifications ?? {}) : null;

  const copyCurrentText = () => {
    if (!ev) return;
    let text = "";
    if (activeTab === "diagnosis") text = ev.ai_diagnosis ?? "";
    else if (activeTab === "technical") text = ev.ai_technical ?? ev.ai_diagnosis ?? "";
    else if (activeTab === "family") text = ev.ai_family ?? ev.ai_diagnosis ?? "";
    else if (activeTab === "goals") {
      const g = ev.ai_goals;
      if (g) {
        text = `Metas 30 dias:\n${g["30_days"]?.join("\n") || "—"}\n\nMetas 60 dias:\n${g["60_days"]?.join("\n") || "—"}\n\nMetas 90 dias:\n${g["90_days"]?.join("\n") || "—"}`;
      } else {
        text = ev.ai_diagnosis ?? "";
      }
    }
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copiado para a área de transferência");
    }
  };

  return (
    <Dialog open onOpenChange={(b) => !b && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{ev?.student.full_name ?? "Avaliação"}</DialogTitle>
        </DialogHeader>

        {!ev ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(ev.evaluated_at).toLocaleDateString("pt-BR")}</span>
              <span>•</span>
              <span>{ev.age_years} anos</span>
              {overall?.label && (
                <span className={cn("ml-auto rounded-full border px-2 py-0.5", zoneColor(overall.label))}>
                  Perfil: {overall.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(TEST_META).map(([k, m]) => {
                const v = (ev as any)[m.field];
                const z = ev.classifications?.[k as keyof Classifications];
                return (
                  <div key={k} className="rounded-lg border border-border bg-gradient-card p-2">
                    <div className="text-[10px] uppercase text-muted-foreground">{m.label}</div>
                    <div className="font-display text-sm font-bold">{v ?? "—"}<span className="text-[10px] font-normal text-muted-foreground"> {m.unit}</span></div>
                    {z && <span className={cn("mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[10px]", zoneColor(z))}>{z}</span>}
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-border bg-gradient-card p-3.5 shadow-soft">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-display text-sm font-semibold">
                  <Brain className="h-4 w-4 text-accent" /> Diagnóstico e Pareceres (Modelo ProMetric®)
                </div>
                <div className="flex items-center gap-2">
                  {(ev.ai_diagnosis || ev.ai_technical || ev.ai_family) && (
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={copyCurrentText}>
                      <span className="text-xs">{copied ? "✓ Copiado" : "Copiar"}</span>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => ai.mutate()} disabled={ai.isPending}>
                    {ai.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span className="ml-1">{ev.ai_diagnosis ? "Regenerar" : "Gerar com IA / Especialista"}</span>
                  </Button>
                </div>
              </div>

              {ev.ai_diagnosis || ev.ai_technical || ev.ai_family ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5 border-b border-border/60 pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("diagnosis")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                        activeTab === "diagnosis"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Diagnóstico Geral
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("technical")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                        activeTab === "technical"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Parecer Técnico (Coordenação)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("family")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                        activeTab === "family"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Parecer para Família
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("goals")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                        activeTab === "goals"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Metas 30/60/90d
                    </button>
                  </div>

                  {activeTab === "diagnosis" && (
                    <div className="rounded-lg bg-background/50 p-2.5">
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">{ev.ai_diagnosis}</p>
                    </div>
                  )}

                  {activeTab === "technical" && (
                    <div className="rounded-lg bg-background/50 p-2.5">
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                        {ev.ai_technical || ev.ai_diagnosis || "Parecer técnico não gerado nesta avaliação. Clique em Regenerar."}
                      </p>
                    </div>
                  )}

                  {activeTab === "family" && (
                    <div className="rounded-lg bg-background/50 p-2.5">
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                        {ev.ai_family || ev.ai_diagnosis || "Parecer para a família não gerado nesta avaliação. Clique em Regenerar."}
                      </p>
                    </div>
                  )}

                  {activeTab === "goals" && (
                    <div className="space-y-2 rounded-lg bg-background/50 p-2.5 text-xs">
                      {ev.ai_goals ? (
                        <>
                          <div>
                            <div className="font-semibold text-primary">Plano 30 dias</div>
                            <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
                              {ev.ai_goals["30_days"]?.map((g: string, i: number) => <li key={i}>{g}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="font-semibold text-primary">Plano 60 dias</div>
                            <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
                              {ev.ai_goals["60_days"]?.map((g: string, i: number) => <li key={i}>{g}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="font-semibold text-primary">Plano 90 dias</div>
                            <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
                              {ev.ai_goals["90_days"]?.map((g: string, i: number) => <li key={i}>{g}</li>)}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">Metas estruturadas disponíveis ao clicar em Regenerar.</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Gere pareceres técnicos e orientações para os pais com base na metodologia ProMetric®.</p>
              )}
            </div>

            <DialogFooter className="flex-wrap gap-2 sm:gap-2">
              <Button variant="ghost" onClick={() => onDelete(id)} className="text-destructive">
                <Trash2 className="mr-1 h-4 w-4" /> Excluir
              </Button>
              <Button
                variant="outline"
                onClick={() => { onClose(); navigate({ to: "/quick-eval", search: { evaluation: id } }); }}
              >
                <Pencil className="mr-1 h-4 w-4" /> Editar avaliação
              </Button>
              <Button
                onClick={() => ev && downloadStudentEvolutionPDF((ev as any).student_id, (ev as any).tenant_id, tenantName)}
                className="bg-gradient-brand text-primary-foreground hover:opacity-90"
              >
                <Download className="mr-1 h-4 w-4" /> Gerar Relatório
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
