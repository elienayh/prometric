import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarRange,
  Check,
  CheckCircle2,
  Clock,
  ClipboardList,
  Filter,
  GraduationCap,
  Loader2,
  Plus,
  Radio,
  Table2,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { ageFromBirth } from "@/lib/proesp";
import { cn } from "@/lib/utils";
import { Run6MinInput } from "@/components/evaluations/run6min-input";
import {
  buildBatteries,
  buildConsolidatedPayload,
  EVALUATION_FIELDS,
  formatDateBr,
  type EvaluationBattery,
  type FieldKey,
  type RawEvaluation,
  type StudentBatteryProgress,
  type StudentLite,
} from "@/lib/evaluation-batteries";

export const Route = createFileRoute("/_authenticated/quick-eval")({
  head: () => ({ meta: [{ title: "Modo Quadra — ProMetric" }] }),
  validateSearch: (s: Record<string, unknown>): {
    school?: string; class?: string; group?: string; student?: string; evaluation?: string;
  } => ({
    school: typeof s.school === "string" ? s.school : undefined,
    class: typeof s.class === "string" ? s.class : undefined,
    group: typeof s.group === "string" ? s.group : undefined,
    student: typeof s.student === "string" ? s.student : undefined,
    evaluation: typeof s.evaluation === "string" ? s.evaluation : undefined,
  }),
  component: QuickEvalPage,
});

type SchoolLite = { id: string; name: string };
type ClassLite = { id: string; name: string; school_id: string | null };
type GroupLite = { id: string; name: string };
type Scope = { kind: "class" | "group"; id: string } | null;

type SavedSession = {
  scopeKind: "class" | "group";
  schoolId: string;
  classId: string;
  groupId: string;
  tab: "estacao" | "quadra" | "planilha";
  field?: FieldKey;
  filter?: string;
  filledCount?: number;
  currentIdx?: number | null;
  contextName?: string;
  lastAccess: number;
};
const SESSION_KEY = "pm:quick-eval:session";

function readSession(): SavedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SavedSession;
    if (!s || (!s.classId && !s.groupId)) return null;
    return s;
  } catch { return null; }
}
function writeSession(patch: Partial<SavedSession>) {
  if (typeof window === "undefined") return;
  try {
    const cur = readSession() ?? ({} as SavedSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...cur, ...patch, lastAccess: Date.now() }));
  } catch { /* noop */ }
}
function clearSession() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
}

function parseNum(s: string | undefined | null): number | null {
  if (s == null || s === "") return null;
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) ? null : n;
}

// ===========================================================================
// QuickEvalPage
// ===========================================================================
function QuickEvalPage() {
  const { tenantId } = useCurrentTenant();
  const initial = Route.useSearch();
  const hasUrlContext = !!(initial.school || initial.class || initial.group || initial.student || initial.evaluation);

  // Resolve evaluation → student + date when editing an existing record
  const evalCtx = useQuery({
    queryKey: ["qe-eval-ctx", initial.evaluation],
    enabled: !!initial.evaluation && !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("id,student_id,evaluated_at")
        .eq("id", initial.evaluation!)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; student_id: string; evaluated_at: string } | null;
    },
  });

  const effectiveStudentId = initial.student ?? evalCtx.data?.student_id ?? null;
  const forcedDate = evalCtx.data?.evaluated_at ?? null;

  const [schoolId, setSchoolId] = useState<string>(initial.school ?? "");
  const [classId, setClassId] = useState<string>(initial.class ?? "");
  const [groupId, setGroupId] = useState<string>(initial.group ?? "");
  const [scopeKind, setScopeKind] = useState<"class" | "group">(initial.group ? "group" : "class");
  const [tab, setTab] = useState<"estacao" | "quadra" | "planilha">(initial.student || initial.evaluation ? "quadra" : "estacao");
  const [resume, setResume] = useState<SavedSession | null>(null);

  // Controle de Baterias de Testes
  const [selectedBatteryDate, setSelectedBatteryDate] = useState<string | null>(forcedDate);
  const [newBatteryModalOpen, setNewBatteryModalOpen] = useState(false);
  const [newBatteryDate, setNewBatteryDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // If a student id is provided (or resolved via evaluation), hydrate scope from the student record.
  const studentCtx = useQuery({
    queryKey: ["qe-student-ctx", effectiveStudentId],
    enabled: !!effectiveStudentId && !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,full_name,class_id,group_id,class:classes(id,school_id)")
        .eq("id", effectiveStudentId!)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; full_name: string; class_id: string | null; group_id: string | null; class: { id: string; school_id: string | null } | null } | null;
    },
  });

  useEffect(() => {
    const s = studentCtx.data;
    if (!s) return;
    if (s.class_id) {
      setScopeKind("class");
      setClassId(s.class_id);
      if (s.class?.school_id) setSchoolId(s.class.school_id);
    } else if (s.group_id) {
      setScopeKind("group");
      setGroupId(s.group_id);
    }
    setTab("quadra");
  }, [studentCtx.data]);

  // Detect resumable session on mount (only when user arrived clean)
  useEffect(() => {
    if (hasUrlContext) return;
    const s = readSession();
    if (s) setResume(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist context as it changes
  useEffect(() => {
    if (!classId && !groupId) return;
    writeSession({ scopeKind, schoolId, classId, groupId, tab });
  }, [scopeKind, schoolId, classId, groupId, tab]);

  const applyResume = (s: SavedSession) => {
    setScopeKind(s.scopeKind);
    setSchoolId(s.schoolId ?? "");
    setClassId(s.classId ?? "");
    setGroupId(s.groupId ?? "");
    setTab(s.tab ?? "estacao");
    setResume(null);
  };
  const discardResume = () => { clearSession(); setResume(null); };

  const schools = useQuery({
    queryKey: ["qe-schools", tenantId], enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id,name").eq("tenant_id", tenantId!).order("name");
      if (error) throw error;
      return data as SchoolLite[];
    },
  });

  const classes = useQuery({
    queryKey: ["qe-classes", tenantId, schoolId], enabled: !!tenantId && scopeKind === "class",
    queryFn: async () => {
      let q = supabase.from("classes").select("id,name,school_id").eq("tenant_id", tenantId!).order("name");
      if (schoolId) q = q.eq("school_id", schoolId);
      const { data, error } = await q;
      if (error) throw error;
      return data as ClassLite[];
    },
  });

  const groups = useQuery({
    queryKey: ["qe-groups", tenantId], enabled: !!tenantId && scopeKind === "group",
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("id,name").eq("tenant_id", tenantId!).order("name");
      if (error) throw error;
      return data as GroupLite[];
    },
  });

  const scope: Scope =
    scopeKind === "class" && classId && classId !== "__all__" ? { kind: "class", id: classId } :
    scopeKind === "group" && groupId ? { kind: "group", id: groupId } : null;

  // Carrega alunos e todas as avaliações no escopo selecionado para agrupamento multiaula em baterias
  const studentsQuery = useScopedStudents(scope);
  const scopeStudentList = studentsQuery.data ?? [];
  const scopeEvaluationsQuery = useScopeEvaluations(scopeStudentList.map((s) => s.id));

  // Processa as baterias e identifica a bateria ativa
  const { batteries, activeBattery } = useMemo(() => {
    return buildBatteries(
      scopeStudentList,
      scopeEvaluationsQuery.data ?? [],
      selectedBatteryDate,
    );
  }, [scopeStudentList, scopeEvaluationsQuery.data, selectedBatteryDate]);

  const handleStartNewBattery = () => {
    setSelectedBatteryDate(newBatteryDate);
    setNewBatteryModalOpen(false);
    toast.success(`Nova bateria iniciada com referência em ${formatDateBr(newBatteryDate)}!`);
  };

  return (
    <div className="space-y-5">
      {resume && (
        <ResumeDialog session={resume} onContinue={() => applyResume(resume)} onDiscard={discardResume} />
      )}
      <PageHeader
        title="Modo Quadra"
        description="Otimizado para celular e tablet — aplique testes ao longo de várias aulas mantendo tudo consolidado no mesmo conjunto."
        action={
          <Link to="/evaluations" className="text-xs text-muted-foreground hover:text-foreground">
            <ClipboardList className="mr-1 inline h-3.5 w-3.5" /> Ver todas avaliações
          </Link>
        }
      />

      <div className="space-y-3 rounded-2xl border border-border bg-gradient-card p-4 shadow-soft">
        <div className="flex gap-2">
          <Button
            type="button" size="sm"
            variant={scopeKind === "class" ? "default" : "outline"}
            onClick={() => { setScopeKind("class"); setGroupId(""); setSelectedBatteryDate(null); }}
            className={scopeKind === "class" ? "bg-gradient-brand text-primary-foreground" : ""}
          >
            <GraduationCap className="mr-1 h-3.5 w-3.5" /> Turma
          </Button>
          <Button
            type="button" size="sm"
            variant={scopeKind === "group" ? "default" : "outline"}
            onClick={() => { setScopeKind("group"); setClassId(""); setSchoolId(""); setSelectedBatteryDate(null); }}
            className={scopeKind === "group" ? "bg-gradient-brand text-primary-foreground" : ""}
          >
            <UsersRound className="mr-1 h-3.5 w-3.5" /> Grupo
          </Button>
        </div>

        {scopeKind === "class" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs"><Building2 className="h-3 w-3" /> Escola</Label>
              <Select value={schoolId} onValueChange={(v) => { setSchoolId(v === "__all__" ? "" : v); setClassId(""); setSelectedBatteryDate(null); }}>
                <SelectTrigger><SelectValue placeholder="Todas as escolas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas as escolas</SelectItem>
                  {(schools.data ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs"><GraduationCap className="h-3 w-3" /> Turma*</Label>
              <Select value={classId} onValueChange={(v) => { setClassId(v); setSelectedBatteryDate(null); }}>
                <SelectTrigger><SelectValue placeholder="Selecione uma turma" /></SelectTrigger>
                <SelectContent>
                  {(classes.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs"><UsersRound className="h-3 w-3" /> Grupo*</Label>
            <Select value={groupId} onValueChange={(v) => { setGroupId(v); setSelectedBatteryDate(null); }}>
              <SelectTrigger><SelectValue placeholder="Selecione um grupo" /></SelectTrigger>
              <SelectContent>
                {(groups.data ?? []).map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!scope ? (
        <EmptyState
          title={scopeKind === "class" ? "Escolha uma turma" : "Escolha um grupo"}
          description="Selecione o contexto para começar. O Modo Quadra consolida testes feitos em aulas diferentes na mesma bateria avaliativa."
        />
      ) : (
        <div className="space-y-4">
          {/* Barra de Controle de Bateria Avaliativa */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-gradient-card p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <CalendarRange className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground">Bateria de Avaliação:</span>
              <Select
                value={activeBattery.id}
                onValueChange={(v) => setSelectedBatteryDate(v)}
              >
                <SelectTrigger className="h-8 w-auto min-w-[200px] max-w-[320px] text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {batteries.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.name} ({b.completeCount}/{b.studentCount} prontos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">{activeBattery.completeCount}</span> de {activeBattery.studentCount} alunos com testes concluídos
                {activeBattery.partialCount > 0 && (
                  <span> · <span className="text-warning font-medium">{activeBattery.partialCount}</span> com testes parciais</span>
                )}
                {activeBattery.emptyCount > 0 && (
                  <span> · {activeBattery.emptyCount} não iniciados</span>
                )}
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setNewBatteryModalOpen(true)}
              className="h-8 shrink-0 text-xs font-medium hover:border-primary/50"
            >
              <Plus className="mr-1 h-3.5 w-3.5 text-primary" /> Nova Bateria de Testes
            </Button>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "estacao" | "quadra" | "planilha")} className="w-full">
            <TabsList className="grid w-full max-w-xl grid-cols-3">
              <TabsTrigger value="estacao"><Radio className="mr-1.5 h-3.5 w-3.5" /> Estação</TabsTrigger>
              <TabsTrigger value="quadra"><Zap className="mr-1.5 h-3.5 w-3.5" /> Por Aluno</TabsTrigger>
              <TabsTrigger value="planilha"><Table2 className="mr-1.5 h-3.5 w-3.5" /> Planilha</TabsTrigger>
            </TabsList>
            <TabsContent value="estacao" className="mt-4">
              <StationMode scope={scope} tenantId={tenantId!} battery={activeBattery} />
            </TabsContent>
            <TabsContent value="quadra" className="mt-4">
              <QuadraFlow
                scope={scope}
                tenantId={tenantId!}
                battery={activeBattery}
                forcedStudentId={effectiveStudentId}
                forcedDate={forcedDate}
                isNew={!initial.evaluation}
              />
            </TabsContent>
            <TabsContent value="planilha" className="mt-4">
              <SpreadsheetMode scope={scope} tenantId={tenantId!} battery={activeBattery} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Diálogo para Nova Bateria de Testes */}
      <Dialog open={newBatteryModalOpen} onOpenChange={setNewBatteryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Plus className="h-5 w-5 text-primary" /> Iniciar Nova Bateria de Testes
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Use esta opção quando for iniciar um novo período avaliativo (ex.: início de semestre, 2º bimestre ou reteste geral).
              Os dados e relatórios da bateria anterior serão integralmente preservados para comparações e gráficos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Data de Referência da Nova Bateria</Label>
              <Input
                type="date"
                value={newBatteryDate}
                onChange={(e) => setNewBatteryDate(e.target.value)}
                className="h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                Os testes realizados nesta e nas próximas aulas deste período serão agrupados a partir desta data de referência.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" size="sm" onClick={() => setNewBatteryModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-gradient-brand text-primary-foreground"
              onClick={handleStartNewBattery}
            >
              Iniciar Nova Bateria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===========================================================================
// Shared data hooks
// ===========================================================================
function useScopedStudents(scope: Scope) {
  return useQuery({
    queryKey: ["qe-students", scope?.kind, scope?.id],
    enabled: !!scope,
    queryFn: async () => {
      const col = scope!.kind === "class" ? "class_id" : "group_id";
      const { data, error } = await supabase
        .from("students").select("id,full_name,sex,birth_date,photo_url")
        .eq(col, scope!.id).eq("is_active", true).order("full_name");
      if (error) throw error;
      return data as StudentLite[];
    },
    staleTime: 60_000,
  });
}

function useScopeEvaluations(studentIds: string[]) {
  return useQuery({
    queryKey: ["qe-scope-evals", ...studentIds],
    enabled: studentIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*")
        .in("student_id", studentIds)
        .order("evaluated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RawEvaluation[];
    },
  });
}

// ===========================================================================
// Tag Discreta de Status (Anti-Slop: texto limpo, sem pills pesadas)
// ===========================================================================
function DiscreteProgressTag({ progress }: { progress?: StudentBatteryProgress }) {
  if (!progress) return null;

  if (progress.isComplete) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
        <CheckCircle2 className="h-3 w-3 shrink-0" />
        <span>11/11 testes · Concluído</span>
      </span>
    );
  }

  if (progress.isPartial) {
    const missingLabels = progress.missingFields.slice(0, 3).map((f) => f.short).join(", ");
    const moreCount = progress.missingFields.length - 3;
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3 shrink-0 text-warning" />
        <span className="font-medium text-warning">{progress.filledCount}/11 testes</span>
        <span>· Faltam: {missingLabels}{moreCount > 0 ? ` +${moreCount}` : ""}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70">
      <span>0/11 testes · Pendente</span>
    </span>
  );
}

// ===========================================================================
// MODO ESTAÇÃO — um teste, todos os alunos, entrada única + autosave
// ===========================================================================
type StationFilter = "all" | "pending_this" | "pending_battery" | "done_this";

function StationMode({
  scope,
  tenantId,
  battery,
}: {
  scope: Scope;
  tenantId: string;
  battery: EvaluationBattery;
}) {
  const qc = useQueryClient();
  const students = useScopedStudents(scope);
  const list = students.data ?? [];

  const [field, setField] = useState<FieldKey>("sit_and_reach_cm");
  const [filter, setFilter] = useState<StationFilter>("all");

  // Edições locais
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, "pending" | "done">>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Inicializa valores com o histórico consolidado da bateria
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const s of list) {
      const val = battery.consolidatedByStudent[s.id]?.[field];
      if (val !== null && val !== undefined && val !== "") {
        next[s.id] = String(val);
      }
    }
    setValues(next);
    setSaving({});
  }, [field, battery.id, battery.consolidatedByStudent, list]);

  const persist = (student: StudentLite, raw: string) => {
    const sid = student.id;
    setSaving((p) => ({ ...p, [sid]: "pending" }));
    clearTimeout(timers.current[sid]);
    timers.current[sid] = setTimeout(async () => {
      try {
        const payload = buildConsolidatedPayload(
          student,
          tenantId,
          battery.startDate,
          { [field]: parseNum(raw) } as Partial<Record<FieldKey, number | null>>,
          battery.consolidatedByStudent[sid] ?? null,
        );
        const { error } = await supabase
          .from("evaluations")
          .upsert(payload as never, { onConflict: "student_id,evaluated_at" });
        if (error) throw error;
        setSaving((p) => ({ ...p, [sid]: "done" }));
        qc.invalidateQueries({ queryKey: ["qe-scope-evals"] });
        qc.invalidateQueries({ queryKey: ["evaluations"] });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao salvar");
        setSaving((p) => { const n = { ...p }; delete n[sid]; return n; });
      }
    }, 900);
  };

  const hasDoneThisTest = (sid: string): boolean => {
    const v = values[sid];
    return v !== undefined && v !== "";
  };

  const counts = useMemo(() => {
    let doneThis = 0;
    let pendingThis = 0;
    let pendingBattery = 0;

    for (const s of list) {
      const isDone = hasDoneThisTest(s.id);
      if (isDone) doneThis++;
      else pendingThis++;

      const prog = battery.progressByStudent[s.id];
      if (!prog || !prog.isComplete) pendingBattery++;
    }

    return { total: list.length, doneThis, pendingThis, pendingBattery };
  }, [list, values, battery.progressByStudent]);

  const filtered = useMemo(() => {
    return list.filter((s) => {
      const doneThis = hasDoneThisTest(s.id);
      const prog = battery.progressByStudent[s.id];
      if (filter === "pending_this") return !doneThis;
      if (filter === "done_this") return doneThis;
      if (filter === "pending_battery") return !prog || !prog.isComplete;
      return true;
    });
  }, [list, values, filter, battery.progressByStudent]);

  const activeFieldDef = EVALUATION_FIELDS.find((f) => f.key === field) ?? EVALUATION_FIELDS[0];

  if (students.isLoading) return <div className="text-sm text-muted-foreground">Carregando alunos…</div>;
  if (!list.length) return <EmptyState title="Sem alunos" description="Cadastre alunos neste contexto antes de avaliar." />;

  return (
    <div className="space-y-4">
      {/* Barra de Seleção de Teste */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-gradient-card p-3 shadow-soft">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Teste da Estação</Label>
          <Select value={field} onValueChange={(v) => setField(v as FieldKey)}>
            <SelectTrigger className="h-9 w-auto min-w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVALUATION_FIELDS.map((f) => (
                <SelectItem key={f.key} value={f.key}>
                  {f.label} ({f.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro Segmentado */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted/50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todos ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending_this")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "pending_this" ? "bg-card text-warning font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Faltam este teste ({counts.pendingThis})
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending_battery")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "pending_battery" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Com pendências ({counts.pendingBattery})
          </button>
          <button
            type="button"
            onClick={() => setFilter("done_this")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "done_this" ? "bg-card text-success font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Feitos ({counts.doneThis})
          </button>
        </div>
      </div>

      {/* Lista de Alunos na Estação */}
      <div className="space-y-2">
        {filtered.map((s) => {
          const sid = s.id;
          const prog = battery.progressByStudent[sid];
          const isDone = hasDoneThisTest(sid);
          const isSaving = saving[sid] === "pending";

          return (
            <div
              key={sid}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border p-3 shadow-soft transition",
                isDone ? "border-success/30 bg-success/5" : "border-border bg-gradient-card",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-sm font-semibold">{s.full_name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {s.sex === "male" ? "Masc." : "Fem."} • {ageFromBirth(s.birth_date, new Date(battery.startDate))} anos
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <DiscreteProgressTag progress={prog} />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {field === "run_6min_m" ? (
                  <Run6MinInput
                    value={values[sid] ? Number(values[sid]) : null}
                    onChange={(n) => {
                      const str = n != null ? String(n) : "";
                      setValues((p) => ({ ...p, [sid]: str }));
                      persist(s, str);
                    }}
                  />
                ) : (
                  <div className="relative">
                    <Input
                      type="number"
                      step={activeFieldDef.step ?? "1"}
                      inputMode="decimal"
                      placeholder="—"
                      value={values[sid] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValues((p) => ({ ...p, [sid]: val }));
                        persist(s, val);
                      }}
                      className="h-10 w-24 text-center font-display text-base font-bold pr-7"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      {activeFieldDef.unit}
                    </span>
                  </div>
                )}

                <div className="w-5 grid place-items-center">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin text-warning" />
                  ) : isDone ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Nenhum aluno encontrado para o filtro selecionado.
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        💡 O Modo Estação salva automaticamente após a digitação. Os testes são consolidados na bateria ativa, mantendo dados lançados em outras aulas.
      </p>
    </div>
  );
}

// ===========================================================================
// MODO POR ALUNO — lista → form → próximo aluno
// ===========================================================================
type StudentFilter = "all" | "pending" | "complete";

function QuadraFlow({
  scope,
  tenantId,
  battery,
  forcedStudentId,
  forcedDate,
  isNew,
}: {
  scope: Scope;
  tenantId: string;
  battery: EvaluationBattery;
  forcedStudentId?: string | null;
  forcedDate?: string | null;
  isNew?: boolean;
}) {
  const navigate = useNavigate();
  const students = useScopedStudents(scope);
  const list = students.data ?? [];

  const [currentIdx, setCurrentIdx] = useState<number | null>(() => {
    const s = readSession();
    const idx = s?.currentIdx;
    return typeof idx === "number" ? idx : null;
  });
  const [filter, setFilter] = useState<StudentFilter>("all");
  const [savedForced, setSavedForced] = useState(false);

  // Auto-seleciona aluno forçado via query param
  useEffect(() => {
    if (!forcedStudentId || !list.length) return;
    const idx = list.findIndex((s) => s.id === forcedStudentId);
    if (idx >= 0) setCurrentIdx(idx);
  }, [forcedStudentId, list]);

  const current = currentIdx != null ? list[currentIdx] : null;

  // Filtragem de alunos
  const filteredIndices = useMemo(() => {
    const indices: number[] = [];
    list.forEach((s, i) => {
      const prog = battery.progressByStudent[s.id];
      const isComplete = prog?.isComplete ?? false;
      if (filter === "pending" && isComplete) return;
      if (filter === "complete" && !isComplete) return;
      indices.push(i);
    });
    return indices;
  }, [list, filter, battery.progressByStudent]);

  if (students.isLoading) return <div className="text-sm text-muted-foreground">Carregando alunos…</div>;
  if (!list.length) return <EmptyState title="Sem alunos" description="Cadastre alunos neste contexto antes de avaliar." />;

  if (forcedStudentId && savedForced && current) {
    return (
      <div className="space-y-3 rounded-2xl border border-success/30 bg-success/5 p-6 text-center shadow-soft">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/20 text-success">
          <Check className="h-6 w-6" />
        </div>
        <div className="font-display text-lg font-bold">Avaliação salva com sucesso</div>
        <div className="text-sm text-muted-foreground">{current.full_name}</div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => navigate({ to: "/students/$id", params: { id: forcedStudentId } })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para ficha do aluno
          </Button>
          <Button className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90" onClick={() => setSavedForced(false)}>
            <Zap className="mr-1 h-4 w-4" /> Nova avaliação
          </Button>
        </div>
      </div>
    );
  }

  if (current) {
    const currentProg = battery.progressByStudent[current.id];
    return (
      <StudentEvalForm
        student={current}
        tenantId={tenantId}
        battery={battery}
        forcedDate={forcedDate}
        isNew={!!isNew}
        progress={{
          done: battery.completeCount,
          total: list.length,
          index: currentIdx! + 1,
          studentProgress: currentProg,
        }}
        onBack={() => {
          if (forcedStudentId) navigate({ to: "/students/$id", params: { id: forcedStudentId } });
          else setCurrentIdx(null);
        }}
        onSaved={() => {
          if (forcedStudentId) { setSavedForced(true); return; }
          // Avança para o próximo aluno com testes pendentes
          const next = list.findIndex(
            (s, i) => i > currentIdx! && (!battery.progressByStudent[s.id] || !battery.progressByStudent[s.id].isComplete),
          );
          if (next >= 0) setCurrentIdx(next);
          else { setCurrentIdx(null); toast.success("Todos os alunos pendentes foram concluídos! 🎉"); }
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Progresso e Filtro */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-gradient-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{list.length} alunos</span>
            <span>·</span>
            <span className="font-medium text-success">{battery.completeCount} prontos</span>
            <span>·</span>
            <span className="font-medium text-warning">{battery.partialCount + battery.emptyCount} com testes pendentes</span>
          </div>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-brand transition-all"
              style={{ width: `${list.length ? Math.round((battery.completeCount / list.length) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Filtro Segmentado */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todos ({list.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "pending" ? "bg-card text-warning font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Pendentes ({battery.partialCount + battery.emptyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("complete")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "complete" ? "bg-card text-success font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Completos ({battery.completeCount})
          </button>
        </div>
      </div>

      {/* Grade de Alunos */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIndices.map((i) => {
          const s = list[i];
          const prog = battery.progressByStudent[s.id];
          const isComplete = prog?.isComplete ?? false;

          return (
            <button
              key={s.id}
              onClick={() => setCurrentIdx(i)}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-2xl border p-4 text-left shadow-soft transition active:scale-[0.98]",
                isComplete
                  ? "border-success/30 bg-success/5 hover:border-success/50"
                  : "border-border bg-gradient-card hover:border-primary/40",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-base font-semibold">{s.full_name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {s.sex === "male" ? "Masc." : "Fem."} • {ageFromBirth(s.birth_date, new Date(battery.startDate))} anos
                </div>
                <div className="mt-1.5">
                  <DiscreteProgressTag progress={prog} />
                </div>
              </div>

              {isComplete ? (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success/20 text-success">
                  <Check className="h-4 w-4" />
                </span>
              ) : (
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          );
        })}

        {filteredIndices.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            Nenhum aluno encontrado para este filtro na bateria selecionada.
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// StudentEvalForm — Formulário focado com preenchimento da bateria
// ===========================================================================
function StudentEvalForm({
  student,
  tenantId,
  battery,
  forcedDate,
  isNew,
  progress,
  onBack,
  onSaved,
}: {
  student: StudentLite;
  tenantId: string;
  battery: EvaluationBattery;
  forcedDate?: string | null;
  isNew?: boolean;
  progress: {
    done: number;
    total: number;
    index: number;
    studentProgress?: StudentBatteryProgress;
  };
  onBack: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const targetDate = forcedDate ?? battery.startDate;

  const [values, setValues] = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);

  // Preenche com os dados consolidados da bateria
  useEffect(() => {
    const existing = battery.consolidatedByStudent[student.id];
    const initialValues: Record<string, string> = {};
    for (const f of EVALUATION_FIELDS) {
      const v = existing?.[f.key];
      if (v !== null && v !== undefined && v !== "") {
        initialValues[f.key] = String(v);
      }
    }
    setValues(initialValues as Record<FieldKey, string>);
  }, [student.id, battery.consolidatedByStudent]);

  const save = useMutation({
    mutationFn: async () => {
      const numeric: Partial<Record<FieldKey, number | null>> = {};
      for (const f of EVALUATION_FIELDS) numeric[f.key] = parseNum(values[f.key]);

      const payload = buildConsolidatedPayload(
        student,
        tenantId,
        targetDate,
        numeric,
        battery.consolidatedByStudent[student.id] ?? null,
      );

      const { error } = await supabase
        .from("evaluations")
        .upsert(payload as never, { onConflict: "student_id,evaluated_at" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${student.full_name} salvo!`);
      qc.invalidateQueries({ queryKey: ["qe-scope-evals"] });
      qc.invalidateQueries({ queryKey: ["evaluations"] });
      qc.invalidateQueries({ queryKey: ["class-stats"] });
      qc.invalidateQueries({ queryKey: ["group-stats"] });
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });

  const filledCountNow = Object.values(values).filter((v) => v !== "" && v != null).length;
  const isCompleteNow = filledCountNow === EVALUATION_FIELDS.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para lista
        </Button>
        <div className="text-xs text-muted-foreground">
          Aluno {progress.index} de {progress.total} • {progress.done} concluídos na bateria
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-card p-4 shadow-soft">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-display text-xl font-bold">{student.full_name}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{student.sex === "male" ? "Masculino" : "Feminino"} • {ageFromBirth(student.birth_date, new Date(targetDate))} anos</span>
              <span>·</span>
              <span className="font-medium text-foreground">{battery.name}</span>
            </div>
          </div>

          <div className="text-right">
            <span className={cn(
              "text-xs font-semibold",
              isCompleteNow ? "text-success" : "text-warning",
            )}>
              {filledCountNow} de 11 testes preenchidos
            </span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="space-y-4"
        >
          {/* Seção Antropometria */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Antropometria
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
              {EVALUATION_FIELDS.filter((f) => f.category === "anthropometry").map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs">{f.label} ({f.unit})</Label>
                  <Input
                    type="number"
                    step={f.step ?? "1"}
                    inputMode="decimal"
                    placeholder="—"
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="h-9"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Seção Aptidão Motora */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aptidão Física e Motora (ProESP)
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {EVALUATION_FIELDS.filter((f) => f.category === "motor" && f.key !== "run_6min_m").map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs">{f.label} ({f.unit})</Label>
                  <Input
                    type="number"
                    step={f.step ?? "1"}
                    inputMode="decimal"
                    placeholder="—"
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="h-9"
                  />
                </div>
              ))}

              {/* Caso especial: Corrida 6 minutos */}
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Corrida 6 minutos (m)</Label>
                <Run6MinInput
                  value={values.run_6min_m ? Number(values.run_6min_m) : null}
                  onChange={(n) => setValues((p) => ({ ...p, run_6min_m: n != null ? String(n) : "" }))}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="submit"
              disabled={save.isPending}
              className="bg-gradient-brand text-primary-foreground shadow-glow"
            >
              {save.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
              Salvar e Próximo Aluno
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===========================================================================
// MODO PLANILHA — matriz completa de alunos × testes da bateria
// ===========================================================================
type SheetFilter = "all" | "pending" | "complete";

function SpreadsheetMode({
  scope,
  tenantId,
  battery,
}: {
  scope: Scope;
  tenantId: string;
  battery: EvaluationBattery;
}) {
  const qc = useQueryClient();
  const students = useScopedStudents(scope);
  const list = students.data ?? [];

  const [filter, setFilter] = useState<SheetFilter>("all");
  const [cells, setCells] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<Record<string, "pending" | "done">>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Inicializa a planilha com os dados consolidados da bateria
  useEffect(() => {
    const next: Record<string, Record<string, string>> = {};
    for (const s of list) {
      const existing = battery.consolidatedByStudent[s.id];
      next[s.id] = {};
      for (const f of EVALUATION_FIELDS) {
        const v = existing?.[f.key];
        if (v !== null && v !== undefined && v !== "") {
          next[s.id][f.key] = String(v);
        }
      }
    }
    setCells(next);
  }, [battery.id, battery.consolidatedByStudent, list]);

  const persist = (student: StudentLite) => {
    const sid = student.id;
    setSaving((p) => ({ ...p, [sid]: "pending" }));
    clearTimeout(saveTimers.current[sid]);
    saveTimers.current[sid] = setTimeout(async () => {
      try {
        const v = cells[sid] ?? {};
        const numeric: Partial<Record<FieldKey, number | null>> = {};
        for (const f of EVALUATION_FIELDS) numeric[f.key] = parseNum(v[f.key]);

        const payload = buildConsolidatedPayload(
          student,
          tenantId,
          battery.startDate,
          numeric,
          battery.consolidatedByStudent[sid] ?? null,
        );

        const { error } = await supabase
          .from("evaluations")
          .upsert(payload as never, { onConflict: "student_id,evaluated_at" });
        if (error) throw error;
        setSaving((p) => ({ ...p, [sid]: "done" }));
        qc.invalidateQueries({ queryKey: ["qe-scope-evals"] });
        qc.invalidateQueries({ queryKey: ["evaluations"] });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao salvar linha");
        setSaving((p) => { const n = { ...p }; delete n[sid]; return n; });
      }
    }, 1200);
  };

  const filteredList = useMemo(() => {
    return list.filter((s) => {
      const prog = battery.progressByStudent[s.id];
      const isComplete = prog?.isComplete ?? false;
      if (filter === "pending" && isComplete) return false;
      if (filter === "complete" && !isComplete) return false;
      return true;
    });
  }, [list, filter, battery.progressByStudent]);

  const pendingCount = useMemo(() => Object.values(saving).filter((s) => s === "pending").length, [saving]);

  if (students.isLoading) return <div className="text-sm text-muted-foreground">Carregando…</div>;
  if (!list.length) return <EmptyState title="Sem alunos" description="Cadastre alunos neste contexto antes de usar a planilha." />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-gradient-card p-3 shadow-soft">
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted/50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todos ({list.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "pending" ? "bg-card text-warning font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Pendentes ({battery.partialCount + battery.emptyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("complete")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === "complete" ? "bg-card text-success font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Completos ({battery.completeCount})
          </button>
        </div>

        <div className="text-xs text-muted-foreground">
          {pendingCount > 0 ? (
            <span className="text-warning">
              <Loader2 className="mr-1 inline h-3 w-3 animate-spin" /> salvando {pendingCount}…
            </span>
          ) : (
            <span className="text-success font-medium">✓ Tudo consolidado na {battery.name}</span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border shadow-soft">
        <table className="w-full min-w-[900px] border-collapse text-xs">
          <thead className="bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-10 border-b border-border bg-muted/80 px-3 py-2 text-left">Aluno</th>
              <th className="border-b border-border px-2 py-2 text-center">Status</th>
              {EVALUATION_FIELDS.map((f) => (
                <th key={f.key} className="border-b border-border px-1 py-2 text-center font-medium">
                  {f.short}
                  <div className="text-[9px] font-normal opacity-70">
                    {f.key === "run_6min_m" ? "voltas + adic." : f.unit}
                  </div>
                </th>
              ))}
              <th className="border-b border-border px-2 py-2 text-center">✓</th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {filteredList.map((s) => {
              const prog = battery.progressByStudent[s.id];
              return (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="sticky left-0 z-10 bg-card px-3 py-2 text-sm font-medium whitespace-nowrap">
                    {s.full_name}
                  </td>
                  <td className="px-2 py-1 text-center whitespace-nowrap">
                    <DiscreteProgressTag progress={prog} />
                  </td>
                  {EVALUATION_FIELDS.map((f) => (
                    <td key={f.key} className="px-0.5 py-0.5">
                      {f.key === "run_6min_m" ? (
                        <Run6MinCell
                          value={cells[s.id]?.[f.key] ?? ""}
                          onChange={(v) => {
                            setCells((p) => ({ ...p, [s.id]: { ...(p[s.id] ?? {}), [f.key]: v } }));
                            persist(s);
                          }}
                        />
                      ) : (
                        <input
                          type="number"
                          step={f.step ?? "1"}
                          inputMode="decimal"
                          value={cells[s.id]?.[f.key] ?? ""}
                          onChange={(e) => {
                            setCells((p) => ({ ...p, [s.id]: { ...(p[s.id] ?? {}), [f.key]: e.target.value } }));
                            persist(s);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.currentTarget.closest("td")?.nextElementSibling?.querySelector("input") as HTMLInputElement | null)?.focus();
                            }
                          }}
                          className="h-8 w-16 rounded border border-transparent bg-transparent px-1 text-center text-xs focus:border-primary focus:outline-none focus:ring-0"
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-2 text-center">
                    {saving[s.id] === "pending" ? (
                      <Loader2 className="mx-auto h-3 w-3 animate-spin text-warning" />
                    ) : saving[s.id] === "done" ? (
                      <Check className="mx-auto h-3 w-3 text-success" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        💡 Alterações na planilha são consolidadas ~1,2s após digitar. Use Tab/Enter para navegar entre células.
      </p>
    </div>
  );
}

// ===========================================================================
// Resume Dialog — "Continuar avaliação?"
// ===========================================================================
function ResumeDialog({
  session, onContinue, onDiscard,
}: { session: SavedSession; onContinue: () => void; onDiscard: () => void }) {
  const ago = (() => {
    const diff = Date.now() - session.lastAccess;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "agora há pouco";
    if (m < 60) return `há ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `há ${h}h`;
    return `há ${Math.floor(h / 24)}d`;
  })();
  const fieldLabel = session.field ? EVALUATION_FIELDS.find((f) => f.key === session.field)?.label : null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-pop">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-display text-base font-bold">Continuar avaliação?</h2>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Encontramos uma sessão anterior do Modo Quadra. Deseja retomar exatamente de onde parou?
        </p>
        <dl className="mb-4 space-y-1.5 rounded-xl bg-muted/40 p-3 text-xs">
          <div className="flex justify-between"><dt className="text-muted-foreground">Contexto</dt>
            <dd className="font-medium">{session.scopeKind === "class" ? "Turma" : "Grupo"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Modo</dt>
            <dd className="font-medium capitalize">{session.tab}</dd></div>
          {fieldLabel && (
            <div className="flex justify-between"><dt className="text-muted-foreground">Teste</dt>
              <dd className="font-medium">{fieldLabel}</dd></div>
          )}
          {typeof session.filledCount === "number" && (
            <div className="flex justify-between"><dt className="text-muted-foreground">Preenchidos</dt>
              <dd className="font-medium">{session.filledCount}</dd></div>
          )}
          {typeof session.currentIdx === "number" && (
            <div className="flex justify-between"><dt className="text-muted-foreground">Posição</dt>
              <dd className="font-medium">Aluno #{session.currentIdx + 1}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-muted-foreground">Último acesso</dt>
            <dd className="font-medium">{ago}</dd></div>
        </dl>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onDiscard}>Descartar</Button>
          <Button type="button" className="flex-1 bg-gradient-brand text-primary-foreground" onClick={onContinue}>
            Continuar <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Célula compacta para lançamento de Corrida 6min na Planilha
function Run6MinCell({ value, onChange }: { value: string; onChange: (total: string) => void }) {
  const total = parseFloat((value ?? "").replace(",", "."));
  const safe = isFinite(total) && total > 0 ? total : 0;
  const laps = safe > 0 ? Math.floor(safe / 40) : 0;
  const rem = safe > 0 ? Math.round(safe - laps * 40) : 0;
  const extras = [0, 10, 20, 30] as const;
  const extra = extras.reduce((b, v) => (Math.abs(v - rem) < Math.abs(b - rem) ? v : b), 0 as number);

  const emit = (l: number, e: number) => onChange(l > 0 || e > 0 ? String(l * 40 + e) : "");

  return (
    <div className="flex items-center justify-center gap-1">
      <input
        type="number" min={0} step={1} inputMode="numeric"
        value={safe > 0 ? String(laps) : ""}
        placeholder="v"
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
          emit(isFinite(n) ? n : 0, extra);
        }}
        className="h-8 w-12 rounded border border-transparent bg-transparent px-1 text-center text-xs focus:border-primary focus:outline-none"
      />
      <select
        value={String(extra)}
        onChange={(e) => emit(laps, Number(e.target.value))}
        className="h-8 rounded border border-transparent bg-transparent px-1 text-center text-xs focus:border-primary focus:outline-none"
      >
        {extras.map((m) => <option key={m} value={m}>+{m}</option>)}
      </select>
    </div>
  );
}
