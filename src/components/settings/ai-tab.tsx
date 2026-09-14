import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getTenantAiConfig,
  saveTenantAiCredential,
  testTenantAiCredential,
  deleteTenantAiCredential,
} from "@/lib/tenant-ai.functions";
import { DEFAULT_MODELS, HOMOLOGATED_MODELS, type ProviderId } from "@/lib/ai/providers-catalog";
import { PROMETRIC_PROMPT_VERSION } from "@/lib/ai/prometric-system-prompt";
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
import { Switch } from "@/components/ui/switch";



const PROVIDER_LABELS: Record<ProviderId, string> = {
  google: "Google (Gemini)",
  openai: "OpenAI (GPT)",
  anthropic: "Anthropic (Claude)",
  xai: "xAI (Grok)",
};

const PROVIDER_HELP: Record<ProviderId, string> = {
  google: "Obtenha sua chave em aistudio.google.com/app/apikey",
  openai: "Obtenha sua chave em platform.openai.com/api-keys",
  anthropic: "Obtenha sua chave em console.anthropic.com/settings/keys",
  xai: "Obtenha sua chave em console.x.ai",
};

export function AiTab({ tenantId }: { tenantId: string | null }) {
  const qc = useQueryClient();
  const getConfig = useServerFn(getTenantAiConfig);
  const saveCred = useServerFn(saveTenantAiCredential);
  const testCred = useServerFn(testTenantAiCredential);
  const delCred = useServerFn(deleteTenantAiCredential);

  const cfgQuery = useQuery({
    queryKey: ["tenant-ai-config", tenantId],
    enabled: !!tenantId,
    queryFn: () => getConfig({ data: { tenantId: tenantId! } }),
  });

  const [provider, setProvider] = useState<ProviderId>("google");
  const [model, setModel] = useState<string>(DEFAULT_MODELS.google);
  const [apiKey, setApiKey] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Hidrata estado quando carrega config
  useEffect(() => {
    const cfg = cfgQuery.data;
    if (cfg) {
      setProvider(cfg.provider);
      setModel(cfg.model);
      setIsActive(cfg.is_active);
    }
  }, [cfgQuery.data]);

  // Quando troca de provedor, sugere modelo padrão
  function handleProviderChange(p: ProviderId) {
    setProvider(p);
    setModel(DEFAULT_MODELS[p]);
    setApiKey("");
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      return saveCred({
        data: {
          tenantId: tenantId!,
          provider,
          model,
          apiKey: apiKey.length > 0 ? apiKey : undefined,
          isActive,
        },
      });
    },
    onSuccess: () => {
      toast.success("Configuração de IA salva");
      setApiKey("");
      qc.invalidateQueries({ queryKey: ["tenant-ai-config", tenantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testMut = useMutation({
    mutationFn: async () => testCred({ data: { tenantId: tenantId! } }),
    onSuccess: (r) => {
      if (r.ok) toast.success(`Conexão OK em ${r.latencyMs}ms`);
      else toast.error(`Falhou: ${r.error}`);
      qc.invalidateQueries({ queryKey: ["tenant-ai-config", tenantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async () => delCred({ data: { tenantId: tenantId! } }),
    onSuccess: () => {
      toast.success("Configuração removida");
      setApiKey("");
      qc.invalidateQueries({ queryKey: ["tenant-ai-config", tenantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!tenantId) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Selecione um espaço para configurar a IA.
      </div>
    );
  }

  const cfg = cfgQuery.data;
  const needsKey = true;
  const hasStoredKey = cfg?.has_key && cfg?.provider === provider;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">Inteligência Artificial</h2>
          <p className="text-xs text-muted-foreground">
            Configure o provedor de IA do seu espaço. Todas as respostas seguem o{" "}
            <strong>Modelo ProMetric® {PROMETRIC_PROMPT_VERSION}</strong> independente do provedor escolhido.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ai-provider">Provedor</Label>
          <Select value={provider} onValueChange={(v) => handleProviderChange(v as ProviderId)}>
            <SelectTrigger id="ai-provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PROVIDER_LABELS) as ProviderId[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PROVIDER_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">{PROVIDER_HELP[provider]}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ai-model">Modelo</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="ai-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOMOLOGATED_MODELS[provider].map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Apenas modelos homologados pelo ProMetric.
          </p>
        </div>
      </div>

      {needsKey && (
        <div className="space-y-1.5">
          <Label htmlFor="ai-key">Chave de API</Label>
          <Input
            id="ai-key"
            type="password"
            autoComplete="off"
            placeholder={
              hasStoredKey
                ? `Chave salva (••••${cfg?.fingerprint ?? ""}). Deixe em branco para manter.`
                : "Cole sua chave aqui"
            }
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Armazenada criptografada (AES-256-GCM). Nunca é exibida após salvar.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-3">
        <div>
          <Label htmlFor="ai-active" className="text-sm font-medium">
            Ativar esta configuração
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Quando desativada, o sistema usa a IA padrão do ProMetric.
          </p>
        </div>
        <Switch id="ai-active" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {cfg?.last_tested_at && (
        <div
          className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
            cfg.last_test_ok
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {cfg.last_test_ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div className="space-y-0.5">
            <div className="font-medium">
              Último teste:{" "}
              {cfg.last_test_ok
                ? `OK (${cfg.last_test_latency_ms}ms)`
                : `Falhou — ${cfg.last_test_error ?? "erro desconhecido"}`}
            </div>
            <div className="opacity-70">
              {new Date(cfg.last_tested_at).toLocaleString("pt-BR")}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
          {saveMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
        <Button
          variant="outline"
          onClick={() => testMut.mutate()}
          disabled={testMut.isPending || (!hasStoredKey && needsKey && apiKey.length === 0)}
        >
          {testMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Testar conexão
        </Button>
        {cfg && (
          <Button
            variant="ghost"
            className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              if (confirm("Remover configuração de IA? O sistema voltará a usar a IA padrão.")) {
                deleteMut.mutate();
              }
            }}
            disabled={deleteMut.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover
          </Button>
        )}
      </div>
    </div>
  );
}
