import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, DollarSign } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/financial")({ component: FinancialPage });

const fmt = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function FinancialPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const payments = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id, amount_cents, status, method, paid_at, notes, tenant:tenants(name)")
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const subs = useQuery({
    queryKey: ["admin-subs-finance"],
    queryFn: async () => (await supabase.from("subscriptions").select("status, amount_cents, billing_cycle")).data ?? [],
  });

  const tenants = useQuery({
    queryKey: ["admin-tenants-list"],
    queryFn: async () => (await supabase.from("tenants").select("id, name").order("name")).data ?? [],
  });

  const [form, setForm] = useState({ tenant_id: "", amount: "", status: "paid" as "paid" | "pending" | "failed" | "refunded", method: "pix", notes: "" });
  const create = useMutation({
    mutationFn: async () => {
      if (!form.tenant_id) throw new Error("Selecione um cliente");
      const { error } = await supabase.from("payments").insert({
        tenant_id: form.tenant_id,
        amount_cents: Math.round(parseFloat(form.amount) * 100),
        status: form.status,
        method: form.method,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success("Pagamento registrado");
      setOpen(false);
      setForm({ tenant_id: "", amount: "", status: "paid", method: "pix", notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = (subs.data ?? []).filter((s) => s.status === "active");
  const mrr = active.reduce((a, s) => a + (s.billing_cycle === "yearly" ? s.amount_cents / 12 : s.amount_cents), 0);
  const arr = mrr * 12;
  const payingClients = new Set(active.map((_, i) => i)).size;
  const ticket = active.length > 0 ? mrr / active.length : 0;

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startYear = new Date(now.getFullYear(), 0, 1);
  const paid = (payments.data ?? []).filter((p) => p.status === "paid");
  const monthRev = paid.filter((p) => p.paid_at && new Date(p.paid_at) >= startMonth).reduce((a, p) => a + p.amount_cents, 0);
  const yearRev = paid.filter((p) => p.paid_at && new Date(p.paid_at) >= startYear).reduce((a, p) => a + p.amount_cents, 0);

  const kpis = [
    { label: "MRR", value: fmt(mrr) },
    { label: "ARR", value: fmt(arr) },
    { label: "Receita do mês", value: fmt(monthRev) },
    { label: "Receita do ano", value: fmt(yearRev) },
    { label: "Clientes pagantes", value: payingClients.toString() },
    { label: "Ticket médio", value: fmt(ticket) },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Financeiro</h1>
          <p className="text-sm text-muted-foreground">MRR, ARR e histórico de pagamentos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Lançar pagamento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo pagamento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Cliente</Label>
                <Select value={form.tenant_id} onValueChange={(v) => setForm({ ...form, tenant_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {(tenants.data ?? []).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div>
                  <Label>Método</Label>
                  <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="credit_card">Cartão</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Observações</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button className="w-full" onClick={() => create.mutate()} disabled={create.isPending}>Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <DollarSign className="h-4 w-4 text-success" />
            <div className="mt-2 text-xl font-bold">{k.value}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        <div className="px-1 text-sm font-semibold">Pagamentos recentes</div>
        {payments.isLoading && <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">Carregando...</div>}
        {!payments.isLoading && (payments.data ?? []).length === 0 && <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">Nenhum pagamento registrado.</div>}
        {(payments.data ?? []).map((p: { id: string; paid_at: string | null; amount_cents: number; method: string | null; status: string; tenant: { name: string } | null }) => (
          <Card key={p.id} className="p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{p.tenant?.name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString("pt-BR") : "—"}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-bold">{fmt(p.amount_cents)}</div>
                <div className="text-[11px] uppercase text-muted-foreground">{p.status}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Método: {p.method ?? "—"}</div>
          </Card>
        ))}
      </div>

      {/* Tablet/Desktop: table */}
      <Card className="hidden overflow-hidden md:block">
        <div className="border-b border-border/60 px-4 py-3 text-sm font-semibold">Pagamentos recentes</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Valor</th>
                <th className="px-4 py-3 text-left">Método</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>}
              {!payments.isLoading && (payments.data ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum pagamento registrado.</td></tr>
              )}
              {(payments.data ?? []).map((p: { id: string; paid_at: string | null; amount_cents: number; method: string | null; status: string; tenant: { name: string } | null }) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="px-4 py-3 text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString("pt-BR") : "—"}</td>
                  <td className="px-4 py-3 font-medium">{p.tenant?.name ?? "—"}</td>
                  <td className="px-4 py-3">{fmt(p.amount_cents)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.method ?? "—"}</td>
                  <td className="px-4 py-3">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
