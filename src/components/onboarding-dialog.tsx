import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type TenantType = "professor" | "school" | "academy" | "club" | "personal_trainer";

const typeOptions: { value: TenantType; label: string }[] = [
  { value: "professor", label: "Professor independente" },
  { value: "school", label: "Escola" },
  { value: "academy", label: "Academia" },
  { value: "club", label: "Clube esportivo" },
  { value: "personal_trainer", label: "Personal Trainer" },
];

export function OnboardingDialog() {
  const [name, setName] = useState("");
  const [type, setType] = useState<TenantType>("professor");
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("create_tenant_with_owner", { _name: name.trim(), _type: type });
      if (error) throw error;
      return data as string;
    },
    onSuccess: async () => {
      toast.success("Espaço criado! Bem-vindo.");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["current-tenant"] }),
        qc.invalidateQueries({ queryKey: ["tenant-membership"] }),
        qc.invalidateQueries({ queryKey: ["user-profile"] }),
        qc.invalidateQueries({ queryKey: ["onboarding-status"] }),
        qc.refetchQueries({ queryKey: ["my-memberships"] }),
        qc.refetchQueries({ queryKey: ["profile"] }),
      ]);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao criar espaço"),
  });


  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">Vamos configurar seu espaço</DialogTitle>
          <DialogDescription className="text-center">
            Dê um nome ao seu ambiente — pode ser sua escola, academia ou seu próprio nome.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); if (name.trim().length >= 2) create.mutate(); }}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="tname">Nome do espaço</Label>
            <Input id="tname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Escola Estrela / Academia X / Prof. João" required minLength={2} maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as TenantType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {typeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90" disabled={create.isPending || name.trim().length < 2}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar meu espaço
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
