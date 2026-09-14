import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, ClipboardList, GraduationCap, Loader2, Radio, Table2, Users, UsersRound, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTenant } from "@/hooks/use-tenant";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { ageFromBirth, calcImc, calcRce, classifyAll, type Sex } from "@/lib/proesp";
import { cn } from "@/lib/utils";
import { Run6MinInput } from "@/components/evaluations/run6min-input";

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
type StudentLite = { id: string; full_name: string; sex: Sex; birth_date: string; photo_url: string | null };

type Scope = { kind: "class" | "group"; id: string } | null;

type FieldKey =
  | "weight_kg" | "height_cm" | "waist_cm" | "wingspan_cm"
  | "sit_and_reach_cm" | "abdominal_reps" | "run_6min_m"
  | "medicine_ball_m" | "horizontal_jump_cm" | "square_test_s" | "sprint_20m_s";

const FIELDS: { key: FieldKey; label: string; short: string; unit: string; step?: string }[] = [
  { key: "weight_kg",          label: "Peso",                short: "Peso",  unit: "kg", step: "0.1" },
  { key: "height_cm",          label: "Altura",              short: "Alt.",  unit: "cm", step: "0.1" },
  { key: "waist_cm",           label: "Cintura",             short: "Cint.", unit: "cm", step: "0.1" },
  { key: "wingspan_cm",        label: "Envergadura",         short: "Env.",  unit: "cm", step: "0.1" },
  { key: "sit_and_reach_cm",   label: "Sentar e Alcançar",   short: "Flex",  unit: "cm", step: "0.1" },
  { key: "abdominal_reps",     label: "Abdominal 1min",      short: "Abdo",  unit: "reps" },
  { key: "run_6min_m",         label: "Corrida 6 minutos",   short: "6min",  unit: "m",  step: "1" },
  { key: "medicine_ball_m",    label: "Medicine Ball 2kg",   short: "MBall", unit: "m",  step: "0.01" },
  { key: "horizontal_jump_cm", label: "Salto Horizontal",    short: "Salto", unit: "cm", step: "0.1" },
  { key: "square_test_s",      label: "Agilidade (Quadrado)",short: "Agil",  unit: "s",  step: "0.01" },
  { key: "sprint_20m_s",       label: "Corrida 20 metros",   short: "20m",   unit: "s",  step: "0.01" },
];

type SavedSession = {
  scopeKind: "class" | "group";
  schoolId: string;
  classId: string;
  groupId: string;
  tab: "estacao" | "quadra" | "planilha";
  field?: FieldKey;
  filter?: StatusFilter;
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

  return (
    <div className="space-y-5">
      {resume && (
        <ResumeDialog session={resume} onContinue={() => applyResume(resume)} onDiscard={discardResume} />
      )}
      <PageHeader
        title="Modo Quadra"
        description="Otimizado para celular e tablet — selecione turma ou grupo e avalie todos os alunos sem voltar à lista."
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
            onClick={() => { setScopeKind("class"); setGroupId(""); }}
            className={scopeKind === "class" ? "bg-gradient-brand text-primary-foreground" : ""}
          >
            <GraduationCap className="mr-1 h-3.5 w-3.5" /> Turma
          </Button>
          <Button
            type="button" size="sm"
            variant={scopeKind === "group" ? "default" : "outline"}
            onClick={() => { setScopeKind("group"); setClassId(""); setSchoolId(""); }}
            className={scopeKind === "group" ? "bg-gradient-brand text-primary-foreground" : ""}
          >
            <UsersRound className="mr-1 h-3.5 w-3.5" /> Grupo
          </Button>
        </div>

        {scopeKind === "class" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs"><Building2 className="h-3 w-3" /> Escola</Label>
              <Select value={schoolId} onValueChange={(v) => { setSchoolId(v === "__all__" ? "" : v); setClassId(""); }}>
                <SelectTrigger><SelectValue placeholder="Todas as escolas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas as escolas</SelectItem>
                  {(schools.data ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs"><GraduationCap className="h-3 w-3" /> Turma*</Label>
              <Select value={classId} onValueChange={setClassId}>
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
            <Select value={groupId} onValueChange={setGroupId}>
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
          description="Selecione o contexto para começar. Dica: o Modo Estação é o mais rápido em campo — escolha um teste e percorra todos os alunos."
        />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as "estacao" | "quadra" | "planilha")} className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="estacao"><Radio className="mr-1.5 h-3.5 w-3.5" /> Estação</TabsTrigger>
            <TabsTrigger value="quadra"><Zap className="mr-1.5 h-3.5 w-3.5" /> Por Aluno</TabsTrigger>
            <TabsTrigger value="planilha"><Table2 className="mr-1.5 h-3.5 w-3.5" /> Planilha</TabsTrigger>
          </TabsList>
          <TabsContent value="estacao" className="mt-4">
            <StationMode scope={scope} tenantId={tenantId!} />
          </TabsContent>
          <TabsContent value="quadra" className="mt-4">
            <QuadraFlow scope={scope} tenantId={tenantId!} forcedStudentId={effectiveStudentId} forcedDate={forcedDate} isNew={!initial.evaluation} />
          </TabsContent>
          <TabsContent value="planilha" className="mt-4">
            <SpreadsheetMode scope={scope} tenantId={tenantId!} />
          </TabsContent>
        </Tabs>
      )}
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

function useTodayEvaluations(studentIds: string[], date: string) {
  return useQuery({
    queryKey: ["qe-today-evals", date, ...studentIds],
    enabled: studentIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations").select("*")
        .eq("evaluated_at", date)
        .in("student_id", studentIds);
      if (error) throw error;
      return (data ?? []) as Record<string, unknown>[];
    },
  });
}

function buildEvaluationPayload(
  student: StudentLite, tenantId: string, date: string,
  values: Partial<Record<FieldKey, number | null>>,
  existing?: Record<string, unknown> | null,
) {
  const age = ageFromBirth(student.birth_date, new Date(date));
  const payload: Record<string, unknown> = {
    tenant_id: tenantId, student_id: student.id, evaluated_at: date, age_years: age,
  };
  // Merge with existing values (so saving one field doesn't wipe others)
  for (const f of FIELDS) {
    const next = values[f.key];
    const prev = existing ? (existing[f.key] as number | null | undefined) : undefined;
    payload[f.key] = next !== undefined ? next : (prev ?? null);
  }
  payload.imc = calcImc(payload.weight_kg as number | null, payload.height_cm as number | null);
  payload.rce = calcRce(payload.waist_cm as number | null, payload.height_cm as number | null);
  payload.classifications = classifyAll({
    sex: student.sex, age,
    weight_kg: payload.weight_kg as number | null, height_cm: payload.height_cm as number | null,
    waist_cm: payload.waist_cm as number | null,
    sit_and_reach_cm: payload.sit_and_reach_cm as number | null,
    abdominal_reps: payload.abdominal_reps as number | null,
    horizontal_jump_cm: payload.horizontal_jump_cm as number | null,
    medicine_ball_m: payload.medicine_ball_m as number | null,
    square_test_s: payload.square_test_s as number | null,
    sprint_20m_s: payload.sprint_20m_s as number | null,
    run_6min_m: payload.run_6min_m as number | null,
  });
  return payload;
}

function parseNum(s: string | undefined | null): number | null {
  if (s == null || s === "") return null;
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) ? null : n;
}

// ===========================================================================
// MODO ESTAÇÃO — um teste, todos os alunos, entrada única + autosave
// ===========================================================================
type StatusFilter = "all" | "pending" | "done";

function StationMode({ scope, tenantId }: { scope: Scope; tenantId: string }) {
  const qc = useQueryClient();
  const students = useScopedStudents(scope);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [field, setField] = useState<FieldKey>("sit_and_reach_cm");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const list = students.data ?? [];

  const evals = useTodayEvaluations(list.map((s) => s.id), date);
  const evalByStudent = useMemo(() => {
    const m: Record<string, Record<string, unknown>> = {};
    for (const e of evals.data ?? []) m[e.student_id as string] = e;
    return m;
  }, [evals.data]);

  // Local edits
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, "pending" | "done">>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Hydrate from db when field/date/data changes
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const sid of Object.keys(evalByStudent)) {
      const v = evalByStudent[sid][field];
      if (v != null) next[sid] = String(v);
    }
    setValues(next);
    setSaving({});
  }, [field, date, evals.data]);

  const persist = (student: StudentLite, raw: string) => {
    const sid = student.id;
    setSaving((p) => ({ ...p, [sid]: "pending" }));
    clearTimeout(timers.current[sid]);
    timers.current[sid] = setTimeout(async () => {
      try {
        const payload = buildEvaluationPayload(
          student, tenantId, date,
          { [field]: parseNum(raw) } as Partial<Record<FieldKey, number | null>>,
          evalByStudent[sid] ?? null,
        );
        const { error } = await supabase.from("evaluations").upsert(payload as never, { onConflict: "student_id,evaluated_at" });
        if (error) throw error;
        setSaving((p) => ({ ...p, [sid]: "done" }));
        qc.invalidateQueries({ queryKey: ["qe-today-evals"] });
        qc.invalidateQueries({ queryKey: ["evaluations"] });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao salvar");
        setSaving((p) => { const n = { ...p }; delete n[sid]; return n; });
      }
    }, 900);
  };

  const statusOf = (sid: string): "done" | "pending" | "empty" => {
    if (values[sid]) return "done";
    const e = evalByStudent[sid];
    if (e && Object.values(e).some((v, i) => i > 4 && v != null)) return "pending";
    return "empty";
  };

  const filtered = list.filter((s) => {
    const st = statusOf(s.id);
    if (filter === "pending") return st !== "done";
    if (filter === "done") return st === "done";
    return true;
  });

  const counts = {
    total: list.length,
    done: list.filter((s) => statusOf(s.id) === "done").length,
    pending: list.filter((s) => statusOf(s.id) !== "done").length,
  };
  const progress = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;
  const pendingSaves = Object.values(saving).filter((s) => s === "pending").length;

  // Persist station state for resume
  useEffect(() => {
    if (!scope) return;
    writeSession({ field, filter, filledCount: counts.done });
  }, [field, filter, counts.done, scope]);

  if (students.isLoading) return <div className="text-sm text-muted-foreground">Carregando alunos…</div>;
  if (!list.length) return <EmptyState title="Sem alunos" description="Cadastre alunos neste contexto antes de avaliar." />;

  const currentField = FIELDS.find((f) => f.key === field)!;

  return (
    <div className="space-y-3">
      {/* Header: teste + data + progresso */}
      <div className="space-y-3 rounded-2xl border border-border bg-gradient-card p-4 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label className="text-xs">Estação (teste)</Label>
            <Select value={field} onValueChange={(v) => setField(v as FieldKey)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FIELDS.map((f) => (
                  <SelectItem key={f.key} value={f.key}>{f.label} ({f.unit})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 sm:w-44" />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground"><Users className="mr-1 inline h-3 w-3" /> {counts.done}/{counts.total} concluídos</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "pending", "done"] as const).map((k) => (
            <Button key={k} type="button" size="sm" variant={filter === k ? "default" : "outline"}
              className={cn("h-8", filter === k && "bg-gradient-brand text-primary-foreground")}
              onClick={() => setFilter(k)}
            >
              {k === "all" ? `Todos (${counts.total})` : k === "pending" ? `Pendentes (${counts.pending})` : `Concluídos (${counts.done})`}
            </Button>
          ))}
          <div className="ml-auto text-xs text-muted-foreground">
            {pendingSaves > 0
              ? <span className="text-warning"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" /> salvando {pendingSaves}…</span>
              : <span className="text-success">✓ tudo salvo</span>}
          </div>
        </div>
      </div>

      {/* Lista de alunos */}
      <div className="grid gap-2">
        {filtered.map((s) => {
          const st = statusOf(s.id);
          const dotClass =
            st === "done" ? "bg-success" :
            st === "pending" ? "bg-warning" : "bg-muted-foreground/40";
          const borderClass =
            st === "done" ? "border-success/30 bg-success/5" :
            st === "pending" ? "border-warning/30 bg-warning/5" : "border-border bg-gradient-card";
          return (
            <div key={s.id}
              className={cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3 shadow-soft transition", borderClass)}
            >
              <div className="relative">
                {s.photo_url
                  ? <img src={s.photo_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  : <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-muted font-display text-sm font-bold text-muted-foreground">
                      {s.full_name.slice(0, 1).toUpperCase()}
                    </div>}
                <span className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-card", dotClass)} />
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-semibold">{s.full_name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {s.sex === "male" ? "Masc." : "Fem."} • {ageFromBirth(s.birth_date, new Date(date))} anos
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {currentField.key === "run_6min_m" ? (
                  <div className="w-[260px]">
                    <Run6MinInput
                      compact
                      value={values[s.id] ?? ""}
                      onChange={(v) => {
                        setValues((p) => ({ ...p, [s.id]: v }));
                        persist(s, v);
                      }}
                    />
                  </div>
                ) : (
                  <Input
                    type="number" step={currentField.step ?? "1"} inputMode="decimal"
                    placeholder={currentField.unit}
                    value={values[s.id] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setValues((p) => ({ ...p, [s.id]: v }));
                      persist(s, v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-station="1"]'));
                        const idx = inputs.findIndex((i) => i === e.currentTarget);
                        inputs[idx + 1]?.focus();
                      }
                    }}
                    data-station="1"
                    className="h-11 w-24 text-center text-base font-semibold"
                  />
                )}
                <span className="w-6 text-center">
                  {saving[s.id] === "pending"
                    ? <Loader2 className="mx-auto h-4 w-4 animate-spin text-warning" />
                    : saving[s.id] === "done"
                    ? <Check className="mx-auto h-4 w-4 text-success" />
                    : <span className="text-xs text-muted-foreground">{currentField.unit}</span>}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum aluno neste filtro.
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        💡 Dica de campo: Selecione um teste, percorra os alunos um a um. Salvamento automático após digitar. Pressione Enter para pular ao próximo.
      </p>
    </div>
  );
}

// ===========================================================================
// MODO POR ALUNO — lista → form → próximo aluno
// ===========================================================================
function QuadraFlow({ scope, tenantId, forcedStudentId, forcedDate, isNew }: { scope: Scope; tenantId: string; forcedStudentId?: string | null; forcedDate?: string | null; isNew?: boolean }) {
  const navigate = useNavigate();
  const students = useScopedStudents(scope);
  const today = forcedDate ?? new Date().toISOString().slice(0, 10);
  const list = students.data ?? [];
  const evals = useTodayEvaluations(list.map((s) => s.id), today);
  const evaluatedIds = useMemo(() => new Set((evals.data ?? []).map((e) => e.student_id as string)), [evals.data]);
  const [currentIdx, setCurrentIdx] = useState<number | null>(() => {
    const s = readSession();
    const idx = s?.currentIdx;
    return typeof idx === "number" ? idx : null;
  });
  const [savedForced, setSavedForced] = useState(false);

  // Auto-select the forced student once the list is available.
  useEffect(() => {
    if (!forcedStudentId || !list.length) return;
    const idx = list.findIndex((s) => s.id === forcedStudentId);
    if (idx >= 0) setCurrentIdx(idx);
  }, [forcedStudentId, list]);

  const current = currentIdx != null ? list[currentIdx] : null;
  const doneCount = evaluatedIds.size;
  const progress = list.length ? Math.round((doneCount / list.length) * 100) : 0;

  // Persist position for resume
  useEffect(() => {
    if (!scope) return;
    writeSession({ currentIdx, filledCount: doneCount });
  }, [currentIdx, doneCount, scope]);

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
    return (
      <StudentEvalForm
        student={current}
        tenantId={tenantId}
        date={today}
        isNew={!!isNew}
        progress={{ done: doneCount, total: list.length, index: currentIdx! + 1 }}
        onBack={() => {
          if (forcedStudentId) navigate({ to: "/students/$id", params: { id: forcedStudentId } });
          else setCurrentIdx(null);
        }}
        onSaved={() => {
          if (forcedStudentId) { setSavedForced(true); return; }
          const next = list.findIndex((s, i) => i > currentIdx! && !evaluatedIds.has(s.id));
          if (next >= 0) setCurrentIdx(next);
          else { setCurrentIdx(null); toast.success("Concluído! 🎉"); }
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-gradient-card p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span><Users className="mr-1 inline h-3 w-3" /> {list.length} alunos</span>
          <span className="font-medium text-primary">{doneCount} avaliados hoje ({progress}%)</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s, i) => {
          const done = evaluatedIds.has(s.id);
          return (
            <button
              key={s.id}
              onClick={() => setCurrentIdx(i)}
              className={cn(
                "group flex items-center justify-between gap-2 rounded-2xl border p-4 text-left shadow-soft transition active:scale-[0.98]",
                done ? "border-success/30 bg-success/5" : "border-border bg-gradient-card hover:border-primary/40",
              )}
            >
              <div className="min-w-0">
                <div className="truncate font-display text-base font-semibold">{s.full_name}</div>
                <div className="text-xs text-muted-foreground">{s.sex === "male" ? "Masc." : "Fem."} • {ageFromBirth(s.birth_date)} anos</div>
              </div>
              {done
                ? <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success/20 text-success"><Check className="h-4 w-4" /></span>
                : <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StudentEvalForm({
  student, tenantId, date, isNew, progress, onBack, onSaved,
}: {
  student: StudentLite; tenantId: string; date: string; isNew?: boolean;
  progress: { done: number; total: number; index: number };
  onBack: () => void; onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);
  const [formDate, setFormDate] = useState<string>(date);

  const existing = useQuery({
    queryKey: ["qe-eval", student.id, formDate],
    queryFn: async () => {
      const { data } = await supabase.from("evaluations").select("*")
        .eq("student_id", student.id).eq("evaluated_at", formDate).maybeSingle();
      return data;
    },
  });

  // Pré-preenche somente em modo edição (não em "Nova avaliação").
  useEffect(() => {
    if (isNew) { setValues({} as Record<FieldKey, string>); return; }
    if (existing.data) {
      const v: Record<string, string> = {};
      for (const f of FIELDS) {
        const x = (existing.data as Record<string, unknown>)[f.key];
        if (x != null) v[f.key] = String(x);
      }
      setValues(v as Record<FieldKey, string>);
    }
  }, [existing.data, isNew]);

  const dateConflict = !!(isNew && existing.data);

  const save = useMutation({
    mutationFn: async () => {
      if (dateConflict) {
        throw new Error("Já existe uma avaliação registrada nesta data. Escolha outra data ou edite a existente.");
      }
      const numeric: Partial<Record<FieldKey, number | null>> = {};
      for (const f of FIELDS) numeric[f.key] = parseNum(values[f.key]);
      const payload = buildEvaluationPayload(student, tenantId, formDate, numeric);
      const { error } = await supabase.from("evaluations").upsert(payload as never, { onConflict: "student_id,evaluated_at" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${student.full_name} salvo!`);
      qc.invalidateQueries({ queryKey: ["qe-today-evals"] });
      qc.invalidateQueries({ queryKey: ["qe-eval"] });
      qc.invalidateQueries({ queryKey: ["evaluations"] });
      qc.invalidateQueries({ queryKey: ["class-stats"] });
      qc.invalidateQueries({ queryKey: ["group-stats"] });
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> Lista</Button>
        <div className="text-xs text-muted-foreground">{progress.index} / {progress.total} • {progress.done} avaliados hoje</div>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-card p-4 shadow-soft">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-display text-xl font-bold">{student.full_name}</div>
            <div className="text-xs text-muted-foreground">
              {student.sex === "male" ? "Masculino" : "Feminino"} • {ageFromBirth(student.birth_date, new Date(formDate))} anos
              {isNew && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">Nova avaliação</span>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium">Data da avaliação</Label>
            <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="h-9 w-44" />
          </div>
        </div>

        {dateConflict && (
          <div className="mb-3 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            Já existe uma avaliação registrada para este aluno nesta data. Escolha outra data para criar uma nova avaliação ou volte e edite a existente.
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FIELDS.map((f) => (
              <div key={f.key} className={cn("space-y-1", f.key === "run_6min_m" && "col-span-2 sm:col-span-3")}>
                <Label className="text-[11px] font-medium">{f.label}<span className="ml-1 text-muted-foreground">({f.unit})</span></Label>
                {f.key === "run_6min_m" ? (
                  <Run6MinInput
                    compact
                    value={values[f.key] ?? ""}
                    onChange={(v) => setValues((p) => ({ ...p, [f.key]: v }))}
                  />
                ) : (
                  <Input
                    type="number" step={f.step ?? "1"} inputMode="decimal"
                    value={values[f.key] ?? ""}
                    onChange={(ev) => setValues((p) => ({ ...p, [f.key]: ev.target.value }))}
                    className="h-11 text-base"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onBack}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending || dateConflict} className="flex-1 bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Salvar e próximo <ArrowRight className="ml-1 h-4 w-4" /></>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===========================================================================
// MODO PLANILHA — edição inline, autosave
// ===========================================================================
function SpreadsheetMode({ scope, tenantId }: { scope: Scope; tenantId: string }) {
  const students = useScopedStudents(scope);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const qc = useQueryClient();
  const list = students.data ?? [];

  const evals = useQuery({
    queryKey: ["qe-sheet", scope?.kind, scope?.id, date], enabled: !!scope && list.length > 0,
    queryFn: async () => {
      const sids = list.map((s) => s.id);
      if (!sids.length) return [];
      const { data, error } = await supabase
        .from("evaluations").select("*")
        .in("student_id", sids).eq("evaluated_at", date);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });

  const existingByStudent = useMemo(() => {
    const m: Record<string, Record<string, unknown>> = {};
    for (const e of evals.data ?? []) m[e.student_id as string] = e;
    return m;
  }, [evals.data]);

  const [cells, setCells] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<Record<string, "pending" | "done">>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!evals.data) return;
    const next: Record<string, Record<string, string>> = {};
    for (const e of evals.data) {
      const sid = e.student_id as string;
      next[sid] = {};
      for (const f of FIELDS) {
        const v = e[f.key]; if (v != null) next[sid][f.key] = String(v);
      }
    }
    setCells(next);
  }, [evals.data]);

  const persist = (student: StudentLite) => {
    const sid = student.id;
    setSaving((p) => ({ ...p, [sid]: "pending" }));
    clearTimeout(saveTimers.current[sid]);
    saveTimers.current[sid] = setTimeout(async () => {
      try {
        const v = cells[sid] ?? {};
        const numeric: Partial<Record<FieldKey, number | null>> = {};
        for (const f of FIELDS) numeric[f.key] = parseNum(v[f.key]);
        const payload = buildEvaluationPayload(student, tenantId, date, numeric, existingByStudent[sid] ?? null);
        const { error } = await supabase.from("evaluations").upsert(payload as never, { onConflict: "student_id,evaluated_at" });
        if (error) throw error;
        setSaving((p) => ({ ...p, [sid]: "done" }));
        qc.invalidateQueries({ queryKey: ["evaluations"] });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao salvar");
        setSaving((p) => { const n = { ...p }; delete n[sid]; return n; });
      }
    }, 1200);
  };

  const pendingCount = useMemo(() => Object.values(saving).filter((s) => s === "pending").length, [saving]);

  if (students.isLoading) return <div className="text-sm text-muted-foreground">Carregando…</div>;
  if (!list.length) return <EmptyState title="Sem alunos" description="Cadastre alunos neste contexto antes de usar a planilha." />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-gradient-card p-3">
        <div className="space-y-1">
          <Label className="text-xs">Data</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-44" />
        </div>
        <div className="text-xs text-muted-foreground">
          {pendingCount > 0
            ? <span className="text-warning"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" /> salvando {pendingCount}…</span>
            : <span className="text-success">✓ tudo salvo</span>}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[900px] border-collapse text-xs">
          <thead className="bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-10 border-b border-border bg-muted/80 px-2 py-2 text-left">Aluno</th>
              {FIELDS.map((f) => (
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
            {list.map((s) => (
              <tr key={s.id} className="border-b border-border/50">
                <td className="sticky left-0 z-10 bg-card px-2 py-1.5 text-sm font-medium">{s.full_name}</td>
                {FIELDS.map((f) => (
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
                        type="number" step={f.step ?? "1"} inputMode="decimal"
                        value={cells[s.id]?.[f.key] ?? ""}
                        onChange={(e) => {
                          setCells((p) => ({ ...p, [s.id]: { ...(p[s.id] ?? {}), [f.key]: e.target.value } }));
                          persist(s);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.currentTarget.closest("td")?.nextElementSibling?.querySelector("input") as HTMLInputElement | null)?.focus();
                        }}
                        className="h-8 w-16 rounded border border-transparent bg-transparent px-1 text-center text-xs focus:border-primary focus:outline-none focus:ring-0"
                      />
                    )}
                  </td>
                ))}
                <td className="px-2 text-center">
                  {saving[s.id] === "pending" ? <Loader2 className="mx-auto h-3 w-3 animate-spin text-warning" />
                    : saving[s.id] === "done" ? <Check className="mx-auto h-3 w-3 text-success" />
                    : <span className="text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">💡 Edição é salva automaticamente ~1,2s após digitar. Use Tab/Enter para navegar entre células. Reavalia o mesmo aluno no mesmo dia? Atualiza a avaliação existente.</p>
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
  const fieldLabel = session.field ? FIELDS.find((f) => f.key === session.field)?.label : null;
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

// Célula compacta para lançamento de Corrida 6min na Planilha:
// voltas (× 40 m) + distância adicional (0/10/20/30 m).
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
