import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, GraduationCap, UserPlus, Users, Zap } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState } from "@/components/layout/page-header";

export const Route = createFileRoute("/_authenticated/classes/$id/")({
  head: () => ({ meta: [{ title: "Alunos da Turma — ProMetric" }] }),
  component: ClassStudentsPage,
});

type ClassInfo = {
  id: string; name: string; grade: string | null; school_year: number | null;
  school: { name: string } | null;
};
type StudentRow = {
  id: string; full_name: string; sex: "male" | "female"; birth_date: string; is_active: boolean;
};

function ageFrom(birth: string) {
  const b = new Date(birth);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

function ClassStudentsPage() {
  const { id } = Route.useParams();

  const info = useQuery({
    queryKey: ["class-info", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id,name,grade,school_year,school:schools(name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ClassInfo | null;
    },
  });

  const students = useQuery({
    queryKey: ["class-students", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,full_name,sex,birth_date,is_active")
        .eq("class_id", id)
        .order("full_name");
      if (error) throw error;
      return data as StudentRow[];
    },
  });

  const c = info.data;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Turmas", to: "/classes" }, { label: c?.name ?? "Turma" }]} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/classes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 shrink-0 text-primary" />
              <h1 className="truncate font-display text-xl font-bold sm:text-2xl">{c?.name ?? "Turma"}</h1>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {[c?.grade, c?.school?.name, `${students.data?.length ?? 0} aluno(s)`].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/classes/$id/dashboard" params={{ id }}>
              <BarChart3 className="mr-1.5 h-4 w-4" /> Resumo da turma
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/quick-eval" search={{ class: id }}>
              <Zap className="mr-1.5 h-4 w-4" /> Nova avaliação
            </Link>
          </Button>
        </div>
      </div>

      {students.isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando alunos…</div>
      ) : (students.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Nenhum aluno nesta turma"
          description="Vincule alunos existentes a esta turma na tela de Alunos."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">Alunos cadastrados</h2>
            <span className="text-xs text-muted-foreground">({students.data!.length})</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {students.data!.map((s) => (
              <Link
                key={s.id}
                to="/students/$id"
                params={{ id: s.id }}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.full_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.sex === "male" ? "Masculino" : "Feminino"} • {ageFrom(s.birth_date)} anos
                    {!s.is_active && " • inativo"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/students"><UserPlus className="mr-1.5 h-4 w-4" /> Gerenciar alunos</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
