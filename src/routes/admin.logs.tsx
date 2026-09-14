import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/logs")({ component: LogsPage });

function LogsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, actor_email, action, entity_type, entity_id, tenant_id, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((l) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (l.actor_email ?? "").toLowerCase().includes(s) ||
      l.action.toLowerCase().includes(s) ||
      (l.entity_type ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Logs</h1>
          <p className="text-sm text-muted-foreground">Auditoria de ações da plataforma</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Filtrar..." value={q} onChange={(e) => setQ(e.target.value)} className="w-64 pl-9" />
        </div>
      </header>

      {/* Mobile: stacked cards */}
      <div className="space-y-2 md:hidden">
        {isLoading && <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">Carregando...</div>}
        {!isLoading && filtered.length === 0 && <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">Nenhum registro.</div>}
        {filtered.map((l) => (
          <Card key={l.id} className="p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <div className="min-w-0">
                <div className="truncate font-mono text-xs font-semibold">{l.action}</div>
                <div className="truncate text-xs text-muted-foreground">{l.actor_email ?? "—"}</div>
              </div>
              <div className="shrink-0 text-right text-[11px] text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{l.entity_type ?? "—"}</span>
              {l.entity_id && <span className="font-mono">#{l.entity_id.slice(0, 8)}</span>}
            </div>
          </Card>
        ))}
      </div>

      {/* Tablet/Desktop: table */}
      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Quando</th>
                <th className="px-4 py-3 text-left">Quem</th>
                <th className="px-4 py-3 text-left">Ação</th>
                <th className="px-4 py-3 text-left">Entidade</th>
                <th className="px-4 py-3 text-left">ID</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum registro.</td></tr>}
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-border/60">
                  <td className="px-4 py-3 text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3">{l.actor_email ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.entity_type ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.entity_id?.slice(0, 8) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
