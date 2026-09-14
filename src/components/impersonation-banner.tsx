import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ShieldAlert, LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useImpersonation } from "@/hooks/use-impersonation";
import { toast } from "sonner";

function formatElapsed(from: Date, to: Date) {
  const s = Math.max(0, Math.floor((to.getTime() - from.getTime()) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function ImpersonationBanner() {
  const state = useImpersonation();
  const qc = useQueryClient();
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!state?.startedAt) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [state?.startedAt]);

  const exit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("end_impersonation");
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.cancelQueries();
      qc.clear();
      toast.success("Voltou para sua conta");
      router.navigate({ to: "/admin/clients", replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!state) return null;

  const startedAt = state.startedAt ? new Date(state.startedAt) : null;
  const elapsed = startedAt ? formatElapsed(startedAt, now) : null;
  const sinceLabel = startedAt
    ? startedAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : null;

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm text-amber-900 backdrop-blur dark:text-amber-100 lg:px-8">
      <ShieldAlert className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">
        Você está acessando como <strong>{state.tenantName}</strong> (modo impersonação). Toda ação é registrada nos logs.
      </span>
      {sinceLabel && (
        <span className="hidden items-center gap-1.5 rounded-md bg-background/50 px-2 py-1 text-xs font-medium md:inline-flex">
          <Clock className="h-3 w-3" />
          desde {sinceLabel}
          {elapsed && <span className="text-amber-700 dark:text-amber-200/80">· {elapsed}</span>}
        </span>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => exit.mutate()}
        disabled={exit.isPending}
        className="gap-1.5 border-amber-600/40 bg-background/60 hover:bg-background"
      >
        <LogOut className="h-3.5 w-3.5" />
        Voltar para minha conta
      </Button>
    </div>
  );
}
