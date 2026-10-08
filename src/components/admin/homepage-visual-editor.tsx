import React, { useState, useEffect } from "react";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  HomePageConfig,
  FaqItem,
  TestimonialItem,
  mergeWithDefaultConfig,
} from "@/lib/homepage-cms";
import { useHomePageConfig } from "@/hooks/use-homepage-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  ChevronDown,
  Download,
  Eye,
  ExternalLink,
  Laptop,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Upload,
  Globe,
  Sliders,
  Layers,
  HelpCircle,
  MessageSquare,
  Users,
  Shield,
  Activity,
  Award,
  DollarSign,
  AlertCircle,
  Building2,
  HeartPulse,
  Timer,
  Dumbbell,
  Megaphone,
  Compass,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { PrometricIcon } from "@/components/brand/prometric-logo";

function StringListEditor({
  title,
  items = [],
  onChange,
  placeholder = "Novo item...",
  addButtonLabel = "Adicionar",
}: {
  title: string;
  items?: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addButtonLabel?: string;
}) {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft("");
  };

  const handleUpdate = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  };

  const handleRemove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-semibold">{title}</Label>
        <span className="text-[10px] text-muted-foreground">{items.length} itens</span>
      </div>
      <div className="space-y-1.5">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <Input
              className="h-7 text-xs flex-1"
              value={it}
              onChange={(e) => handleUpdate(idx, e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => handleRemove(idx)}
              title="Remover item"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Input
            className="h-7 text-xs flex-1"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs shrink-0"
            onClick={handleAdd}
          >
            <Plus className="mr-1 h-3 w-3" /> {addButtonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HomepageVisualEditor() {
  const { config: initialConfig, isSaving, saveConfig, resetConfig } = useHomePageConfig();
  const [form, setForm] = useState<HomePageConfig>(initialConfig);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fullPreview, setFullPreview] = useState(false);

  // Sincroniza quando os dados do servidor chegam
  useEffect(() => {
    if (initialConfig) {
      setForm(initialConfig);
      setHasUnsavedChanges(false);
    }
  }, [initialConfig]);

  const updateSection = <K extends keyof HomePageConfig>(
    section: K,
    patch: Partial<HomePageConfig[K]>
  ) => {
    setForm((prev) => {
      const current = prev[section];
      if (typeof current === "object" && current !== null) {
        return {
          ...prev,
          [section]: {
            ...current,
            ...patch,
          },
        };
      }
      return {
        ...prev,
        [section]: patch as any,
      };
    });
    setHasUnsavedChanges(true);
  };

  const updateVisibility = (key: keyof HomePageConfig["visibility"], val: boolean) => {
    setForm((prev) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [key]: val,
      },
      ...(key === "showWhatsapp"
        ? {
            whatsapp: {
              ...prev.whatsapp,
              enabled: val,
            },
          }
        : {}),
    }));
    setHasUnsavedChanges(true);
  };

  const updateWhatsapp = (patch: Partial<HomePageConfig["whatsapp"]>) => {
    setForm((prev) => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        ...patch,
      },
      ...(patch.enabled !== undefined
        ? {
            visibility: {
              ...prev.visibility,
              showWhatsapp: patch.enabled,
            },
          }
        : {}),
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await saveConfig(form);
      setHasUnsavedChanges(false);
    } catch {
      // toast já tratado no hook
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Deseja realmente restaurar todos os textos e seções para o padrão original da ProMetric?")) {
      return;
    }
    await resetConfig();
    setForm(DEFAULT_HOMEPAGE_CONFIG);
    setHasUnsavedChanges(false);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(form, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `prometric_homepage_config_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    toast.success("Backup do modelo exportado em JSON.");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const merged = mergeWithDefaultConfig(parsed);
        setForm(merged);
        setHasUnsavedChanges(true);
        toast.success("Configuração importada com sucesso! Clique em 'Salvar e Publicar' para aplicar.");
      } catch (err) {
        toast.error("Arquivo JSON inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Funções para gerenciar FAQs
  const addFaqItem = () => {
    const newItem: FaqItem = {
      id: "f_" + Date.now(),
      q: "Nova Pergunta Frequente?",
      a: "Insira aqui a resposta explicativa clara e objetiva para seus visitantes.",
    };
    updateSection("faq", { items: [...form.faq.items, newItem] });
  };

  const updateFaqItem = (id: string, field: "q" | "a", value: string) => {
    const updated = form.faq.items.map((it) => (it.id === id ? { ...it, [field]: value } : it));
    updateSection("faq", { items: updated });
  };

  const removeFaqItem = (id: string) => {
    const updated = form.faq.items.filter((it) => it.id !== id);
    updateSection("faq", { items: updated });
  };

  // Funções para gerenciar Depoimentos
  const addTestimonialItem = () => {
    const newItem: TestimonialItem = {
      id: "t_" + Date.now(),
      name: "Nome do Profissional",
      role: "Cargo / Especialidade",
      organization: "Instituição / Escola",
      quote: "Insira aqui o relato do profissional sobre o impacto do ProMetric.",
      rating: 5,
    };
    updateSection("testimonials", { items: [...form.testimonials.items, newItem] });
  };

  const updateTestimonialItem = (id: string, field: keyof TestimonialItem, value: any) => {
    const updated = form.testimonials.items.map((it) => (it.id === id ? { ...it, [field]: value } : it));
    updateSection("testimonials", { items: updated });
  };

  const removeTestimonialItem = (id: string) => {
    const updated = form.testimonials.items.filter((it) => it.id !== id);
    updateSection("testimonials", { items: updated });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ─── Top Bar / Header de Ações ─── */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                Editor Visual da Página Inicial
              </h1>
              <Badge variant="outline" className="bg-primary/5 text-[10px] text-primary">
                Super Admin
              </Badge>
              {hasUnsavedChanges ? (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Alterações não salvas
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" />
                  Publicado
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Personalize textos, seções, métricas e destaques sem alterar nenhuma fórmula ou regra de negócio.
            </p>
          </div>
        </div>

        {/* Controles de visualização e ações rápidas */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dispositivo */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1">
            <Button
              type="button"
              variant={device === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => setDevice("desktop")}
              title="Visualização Desktop"
            >
              <Laptop className="mr-1.5 h-3.5 w-3.5" />
              Desktop
            </Button>
            <Button
              type="button"
              variant={device === "tablet" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => setDevice("tablet")}
              title="Visualização Tablet"
            >
              <Tablet className="mr-1.5 h-3.5 w-3.5" />
              Tablet
            </Button>
            <Button
              type="button"
              variant={device === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => setDevice("mobile")}
              title="Visualização Mobile"
            >
              <Smartphone className="mr-1.5 h-3.5 w-3.5" />
              Mobile
            </Button>
          </div>

          {/* Toggle Full Preview */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFullPreview(!fullPreview)}
          >
            {fullPreview ? <Minimize2 className="mr-1.5 h-3.5 w-3.5" /> : <Maximize2 className="mr-1.5 h-3.5 w-3.5" />}
            {fullPreview ? "Modo Dividido" : "Expandir Preview"}
          </Button>

          {/* Exportar / Importar */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleExportJson}
            title="Exportar configuração em JSON"
          >
            <Download className="mr-1 h-3.5 w-3.5" />
            Backup
          </Button>

          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs pointer-events-none">
              <Upload className="mr-1 h-3.5 w-3.5" />
              Importar
            </Button>
          </label>

          {/* Restaurar padrão */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
            onClick={handleReset}
            title="Restaurar padrão original ProMetric"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Restaurar padrão
          </Button>

          {/* Visualizar Home */}
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              Visualizar Home
            </a>
          </Button>

          {/* Salvar e publicar */}
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 bg-gradient-brand text-xs font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            {isSaving ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Salvar e publicar
          </Button>
        </div>
      </div>

      {/* ─── Grid Principal: Lado Esquerdo (Controles) e Lado Direito (Preview) ─── */}
      <div className={`grid gap-6 ${fullPreview ? "grid-cols-1" : "lg:grid-cols-12"}`}>
        {/* Painel de Controles (WordPress Customizer Style) */}
        {!fullPreview && (
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Seções & Conteúdo da Home</h2>
                </div>
                <span className="text-[11px] text-muted-foreground">Editor Visual v1.0</span>
              </div>

              <Accordion type="single" collapsible defaultValue="hero" className="w-full space-y-2">
                {/* 1. Visibilidade das Seções */}
                <AccordionItem value="visibility" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-indigo-500" />
                      Visibilidade dos Blocos (Ligar / Desligar)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Ative ou desative a exibição dos blocos na página inicial pública:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: "showAnnouncement", label: "Aviso do Topo" },
                        { key: "showHero", label: "Hero (Capa)" },
                        { key: "showStats", label: "Indicadores & Métricas" },
                        { key: "showWhatIs", label: "O que é o ProMetric" },
                        { key: "showMethodology", label: "Método (5 Dimensões)" },
                        { key: "showHowItWorks", label: "Como Funciona" },
                        { key: "showForSchools", label: "Para Escolas" },
                        { key: "showForTeachers", label: "Para Professores" },
                        { key: "showTestimonials", label: "Depoimentos" },
                        { key: "showPricing", label: "Planos & Preços" },
                        { key: "showFaq", label: "FAQ / Dúvidas" },
                        { key: "showCtaBanner", label: "CTA de Conversão" },
                        { key: "showFooter", label: "Rodapé" },
                        { key: "showWhatsapp", label: "Botão WhatsApp" },
                      ].map((s) => (
                        <label
                          key={s.key}
                          className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2 hover:bg-muted/40 cursor-pointer"
                        >
                          <span className="text-xs font-medium">{s.label}</span>
                          <Switch
                            checked={form.visibility[s.key as keyof HomePageConfig["visibility"]]}
                            onCheckedChange={(val) => updateVisibility(s.key as keyof HomePageConfig["visibility"], val)}
                          />
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 2. Aviso (Announcement Bar) */}
                <AccordionItem value="announcement" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-amber-500" />
                      Aviso do Topo
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Aviso no Topo</span>
                        <p className="text-[11px] text-muted-foreground">Barra destacada acima do menu</p>
                      </div>
                      <Switch
                        checked={form.visibility.showAnnouncement}
                        onCheckedChange={(val) => updateVisibility("showAnnouncement", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Texto do Aviso</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.announcement.text}
                        onChange={(e) => updateSection("announcement", { text: e.target.value })}
                        placeholder="Mensagem do anúncio..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Texto do Link</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.announcement.linkText}
                          onChange={(e) => updateSection("announcement", { linkText: e.target.value })}
                          placeholder="Saiba mais"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">URL do Link</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.announcement.linkUrl}
                          onChange={(e) => updateSection("announcement", { linkUrl: e.target.value })}
                          placeholder="#metodo ou /register"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 3. Hero Principal */}
                <AccordionItem value="hero" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Hero Principal (Capa)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Hero</span>
                        <p className="text-[11px] text-muted-foreground">Seção principal de abertura</p>
                      </div>
                      <Switch
                        checked={form.visibility.showHero}
                        onCheckedChange={(val) => updateVisibility("showHero", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge Superior</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.hero.badge}
                        onChange={(e) => updateSection("hero", { badge: e.target.value })}
                        placeholder="Ex: Método ProMetric® · Avaliação Física Inteligente"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título Principal (Primeira Parte)</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-semibold"
                        value={form.hero.headline}
                        onChange={(e) => updateSection("hero", { headline: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Texto em Destaque (Gradiente Colorido)</Label>
                      <Input
                        className="mt-1 h-8 text-xs text-primary font-semibold"
                        value={form.hero.headlineHighlight}
                        onChange={(e) => updateSection("hero", { headlineHighlight: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Subtítulo Explicativo</Label>
                      <Textarea
                        rows={3}
                        className="mt-1 text-xs"
                        value={form.hero.subheadline}
                        onChange={(e) => updateSection("hero", { subheadline: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Botão Primário (Texto)</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.hero.primaryCtaText}
                          onChange={(e) => updateSection("hero", { primaryCtaText: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Botão Primário (Link)</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.hero.primaryCtaLink}
                          onChange={(e) => updateSection("hero", { primaryCtaLink: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Botão Secundário (Texto)</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.hero.secondaryCtaText}
                          onChange={(e) => updateSection("hero", { secondaryCtaText: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Botão Secundário (Link)</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.hero.secondaryCtaLink}
                          onChange={(e) => updateSection("hero", { secondaryCtaLink: e.target.value })}
                        />
                      </div>
                    </div>

                    <StringListEditor
                      title="Tags de Destaque no Hero"
                      items={form.hero.tags || []}
                      onChange={(newTags) => updateSection("hero", { tags: newTags })}
                      placeholder="Ex: Gratuito até 30 alunos..."
                      addButtonLabel="Adicionar Tag"
                    />

                    <div>
                      <Label className="text-xs">Nota de Rodapé do Hero</Label>
                      <Input
                        className="mt-1 h-8 text-xs text-muted-foreground"
                        value={form.hero.quickNote}
                        onChange={(e) => updateSection("hero", { quickNote: e.target.value })}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 4. Indicadores & Estatísticas */}
                <AccordionItem value="stats" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      Indicadores & Métricas
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Indicadores</span>
                        <p className="text-[11px] text-muted-foreground">Números e métricas de impacto</p>
                      </div>
                      <Switch
                        checked={form.visibility.showStats}
                        onCheckedChange={(val) => updateVisibility("showStats", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título da Seção de Indicadores</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.stats.title || ""}
                        onChange={(e) => updateSection("stats", { title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border/70 p-2.5 bg-muted/20">
                        <Label className="text-[11px] font-semibold">Indicador 1 (Valor)</Label>
                        <Input
                          className="mt-1 h-7 text-xs font-bold text-primary"
                          value={form.stats.item1.value}
                          onChange={(e) =>
                            updateSection("stats", {
                              item1: { ...form.stats.item1, value: e.target.value },
                            })
                          }
                        />
                        <Label className="mt-1.5 block text-[11px]">Rótulo</Label>
                        <Input
                          className="mt-1 h-7 text-xs"
                          value={form.stats.item1.label}
                          onChange={(e) =>
                            updateSection("stats", {
                              item1: { ...form.stats.item1, label: e.target.value },
                            })
                          }
                        />
                        <Label className="mt-1.5 block text-[11px]">Sub-rótulo</Label>
                        <Input
                          className="mt-1 h-7 text-xs"
                          value={form.stats.item1.sublabel || ""}
                          onChange={(e) =>
                            updateSection("stats", {
                              item1: { ...form.stats.item1, sublabel: e.target.value },
                            })
                          }
                        />
                      </div>

                      <div className="rounded-lg border border-border/70 p-2.5 bg-muted/20">
                        <Label className="text-[11px] font-semibold">Indicador 2 (Valor)</Label>
                        <Input
                          className="mt-1 h-7 text-xs font-bold text-primary"
                          value={form.stats.item2.value}
                          onChange={(e) =>
                            updateSection("stats", {
                              item2: { ...form.stats.item2, value: e.target.value },
                            })
                          }
                        />
                        <Label className="mt-1.5 block text-[11px]">Rótulo</Label>
                        <Input
                          className="mt-1 h-7 text-xs"
                          value={form.stats.item2.label}
                          onChange={(e) =>
                            updateSection("stats", {
                              item2: { ...form.stats.item2, label: e.target.value },
                            })
                          }
                        />
                        <Label className="mt-1.5 block text-[11px]">Sub-rótulo</Label>
                        <Input
                          className="mt-1 h-7 text-xs"
                          value={form.stats.item2.sublabel || ""}
                          onChange={(e) =>
                            updateSection("stats", {
                              item2: { ...form.stats.item2, sublabel: e.target.value },
                            })
                          }
                        />
                      </div>

                      <div className="rounded-lg border border-border/70 p-2.5 bg-muted/20">
                        <Label className="text-[11px] font-semibold">Indicador 3 (Valor)</Label>
                        <Input
                          className="mt-1 h-7 text-xs font-bold text-primary"
                          value={form.stats.item3.value}
                          onChange={(e) =>
                            updateSection("stats", {
                              item3: { ...form.stats.item3, value: e.target.value },
                            })
                          }
                        />
                        <Label className="mt-1.5 block text-[11px]">Rótulo</Label>
                        <Input
                          className="mt-1 h-7 text-xs"
                          value={form.stats.item3.label}
                          onChange={(e) =>
                            updateSection("stats", {
                              item3: { ...form.stats.item3, label: e.target.value },
                            })
                          }
                        />
                        <Label className="mt-1.5 block text-[11px]">Sub-rótulo</Label>
                        <Input
                          className="mt-1 h-7 text-xs"
                          value={form.stats.item3.sublabel || ""}
                          onChange={(e) =>
                            updateSection("stats", {
                              item3: { ...form.stats.item3, sublabel: e.target.value },
                            })
                          }
                        />
                      </div>

                      <div className="rounded-lg border border-border/70 p-2.5 bg-muted/20">
                        <Label className="text-[11px] font-semibold">Indicador 4 (Valor)</Label>
                        <Input
                          className="mt-1 h-7 text-xs font-bold text-primary"
                          value={form.stats.item4.value}
                          onChange={(e) =>
                            updateSection("stats", {
                              item4: { ...form.stats.item4, value: e.target.value },
                            })
                          }
                        />
                        <Label className="mt-1.5 block text-[11px]">Rótulo</Label>
                        <Input
                          className="mt-1 h-7 text-xs"
                          value={form.stats.item4.label}
                          onChange={(e) =>
                            updateSection("stats", {
                              item4: { ...form.stats.item4, label: e.target.value },
                            })
                          }
                        />
                        <Label className="mt-1.5 block text-[11px]">Sub-rótulo</Label>
                        <Input
                          className="mt-1 h-7 text-xs"
                          value={form.stats.item4.sublabel || ""}
                          onChange={(e) =>
                            updateSection("stats", {
                              item4: { ...form.stats.item4, sublabel: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 5. O que é o ProMetric */}
                <AccordionItem value="whatis" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-500" />
                      O que é o ProMetric
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir "O que é"</span>
                        <p className="text-[11px] text-muted-foreground">Âncora #o-que-e</p>
                      </div>
                      <Switch
                        checked={form.visibility.showWhatIs}
                        onCheckedChange={(val) => updateVisibility("showWhatIs", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.whatIs.badge}
                        onChange={(e) => updateSection("whatIs", { badge: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título da Seção</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-semibold"
                        value={form.whatIs.title}
                        onChange={(e) => updateSection("whatIs", { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição Geral</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.whatIs.description}
                        onChange={(e) => updateSection("whatIs", { description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="p-2.5 rounded-lg bg-muted/20 space-y-1.5">
                        <Label className="text-[11px] font-semibold">Card 1 (Título & Descrição)</Label>
                        <Input
                          className="h-7 text-xs font-medium"
                          value={form.whatIs.card1Title}
                          onChange={(e) => updateSection("whatIs", { card1Title: e.target.value })}
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={form.whatIs.card1Desc}
                          onChange={(e) => updateSection("whatIs", { card1Desc: e.target.value })}
                        />
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/20 space-y-1.5">
                        <Label className="text-[11px] font-semibold">Card 2 (Título & Descrição)</Label>
                        <Input
                          className="h-7 text-xs font-medium"
                          value={form.whatIs.card2Title}
                          onChange={(e) => updateSection("whatIs", { card2Title: e.target.value })}
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={form.whatIs.card2Desc}
                          onChange={(e) => updateSection("whatIs", { card2Desc: e.target.value })}
                        />
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/20 space-y-1.5">
                        <Label className="text-[11px] font-semibold">Card 3 (Título & Descrição)</Label>
                        <Input
                          className="h-7 text-xs font-medium"
                          value={form.whatIs.card3Title}
                          onChange={(e) => updateSection("whatIs", { card3Title: e.target.value })}
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={form.whatIs.card3Desc}
                          onChange={(e) => updateSection("whatIs", { card3Desc: e.target.value })}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 6. Método ProMetric® (5 Dimensões) */}
                <AccordionItem value="methodology" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-violet-500" />
                      Método ProMetric® (5 Dimensões)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Metodologia</span>
                        <p className="text-[11px] text-muted-foreground">Âncora #metodo</p>
                      </div>
                      <Switch
                        checked={form.visibility.showMethodology}
                        onCheckedChange={(val) => updateVisibility("showMethodology", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.methodology.badge}
                        onChange={(e) => updateSection("methodology", { badge: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título da Metodologia</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-semibold"
                        value={form.methodology.title}
                        onChange={(e) => updateSection("methodology", { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição Geral</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.methodology.description}
                        onChange={(e) => updateSection("methodology", { description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="p-2.5 rounded-lg bg-muted/20 space-y-1.5">
                        <Label className="text-[11px] font-semibold">Dimensão 1: Saúde Corporal & Antropometria</Label>
                        <Input
                          className="h-7 text-xs font-medium"
                          value={form.methodology.dim1Title}
                          onChange={(e) => updateSection("methodology", { dim1Title: e.target.value })}
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={form.methodology.dim1Desc}
                          onChange={(e) => updateSection("methodology", { dim1Desc: e.target.value })}
                        />
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/20 space-y-1.5">
                        <Label className="text-[11px] font-semibold">Dimensão 2: Resistência</Label>
                        <Input
                          className="h-7 text-xs font-medium"
                          value={form.methodology.dim2Title}
                          onChange={(e) => updateSection("methodology", { dim2Title: e.target.value })}
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={form.methodology.dim2Desc}
                          onChange={(e) => updateSection("methodology", { dim2Desc: e.target.value })}
                        />
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/20 space-y-1.5">
                        <Label className="text-[11px] font-semibold">Dimensão 3: Mobilidade & Flexibilidade</Label>
                        <Input
                          className="h-7 text-xs font-medium"
                          value={form.methodology.dim3Title}
                          onChange={(e) => updateSection("methodology", { dim3Title: e.target.value })}
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={form.methodology.dim3Desc}
                          onChange={(e) => updateSection("methodology", { dim3Desc: e.target.value })}
                        />
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/20 space-y-1.5">
                        <Label className="text-[11px] font-semibold">Dimensão 4: Potência & Força</Label>
                        <Input
                          className="h-7 text-xs font-medium"
                          value={form.methodology.dim4Title}
                          onChange={(e) => updateSection("methodology", { dim4Title: e.target.value })}
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={form.methodology.dim4Desc}
                          onChange={(e) => updateSection("methodology", { dim4Desc: e.target.value })}
                        />
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/20 space-y-1.5">
                        <Label className="text-[11px] font-semibold">Dimensão 5: Velocidade & Agilidade</Label>
                        <Input
                          className="h-7 text-xs font-medium"
                          value={form.methodology.dim5Title}
                          onChange={(e) => updateSection("methodology", { dim5Title: e.target.value })}
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={form.methodology.dim5Desc}
                          onChange={(e) => updateSection("methodology", { dim5Desc: e.target.value })}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 7. Como Funciona */}
                <AccordionItem value="howItWorks" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-emerald-500" />
                      Como Funciona
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir "Como Funciona"</span>
                        <p className="text-[11px] text-muted-foreground">Âncora #como-funciona (4 passos estruturais)</p>
                      </div>
                      <Switch
                        checked={form.visibility.showHowItWorks}
                        onCheckedChange={(val) => updateVisibility("showHowItWorks", val)}
                      />
                    </div>
                    <div className="rounded-lg border border-border/60 p-3 bg-muted/10 text-xs text-muted-foreground space-y-1">
                      <p><strong>1. Cadastre os alunos:</strong> Importe planilha ou cadastre em minutos.</p>
                      <p><strong>2. Realize as avaliações:</strong> Modo Quadra no celular sem retrabalho.</p>
                      <p><strong>3. Gere os relatórios:</strong> PDFs com Índice 0–100 e Radar.</p>
                      <p><strong>4. Acompanhe a evolução:</strong> Diagnóstico contínuo e laudos IA.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 8. Para Escolas */}
                <AccordionItem value="forSchools" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-500" />
                      Para Escolas & Gestão
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Bloco "Para Escolas"</span>
                        <p className="text-[11px] text-muted-foreground">Foco em coordenação e direção</p>
                      </div>
                      <Switch
                        checked={form.visibility.showForSchools}
                        onCheckedChange={(val) => updateVisibility("showForSchools", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.forSchools.badge}
                        onChange={(e) => updateSection("forSchools", { badge: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-semibold"
                        value={form.forSchools.title}
                        onChange={(e) => updateSection("forSchools", { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.forSchools.description}
                        onChange={(e) => updateSection("forSchools", { description: e.target.value })}
                      />
                    </div>

                    <StringListEditor
                      title="Benefícios / Itens da Lista"
                      items={form.forSchools.bullets || []}
                      onChange={(newBullets) => updateSection("forSchools", { bullets: newBullets })}
                      placeholder="Novo benefício para escolas..."
                    />

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <Label className="text-xs">Texto do Botão CTA</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.forSchools.ctaText}
                          onChange={(e) => updateSection("forSchools", { ctaText: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Link do Botão CTA</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.forSchools.ctaLink}
                          onChange={(e) => updateSection("forSchools", { ctaLink: e.target.value })}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 9. Para Professores */}
                <AccordionItem value="forTeachers" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-500" />
                      Para Professores & Treinadores
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Bloco "Para Professores"</span>
                        <p className="text-[11px] text-muted-foreground">Foco no dia a dia da quadra</p>
                      </div>
                      <Switch
                        checked={form.visibility.showForTeachers}
                        onCheckedChange={(val) => updateVisibility("showForTeachers", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.forTeachers.badge}
                        onChange={(e) => updateSection("forTeachers", { badge: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-semibold"
                        value={form.forTeachers.title}
                        onChange={(e) => updateSection("forTeachers", { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.forTeachers.description}
                        onChange={(e) => updateSection("forTeachers", { description: e.target.value })}
                      />
                    </div>

                    <StringListEditor
                      title="Benefícios / Itens da Lista"
                      items={form.forTeachers.bullets || []}
                      onChange={(newBullets) => updateSection("forTeachers", { bullets: newBullets })}
                      placeholder="Novo benefício para professores..."
                    />

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <Label className="text-xs">Texto do Botão CTA</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.forTeachers.ctaText}
                          onChange={(e) => updateSection("forTeachers", { ctaText: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Link do Botão CTA</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.forTeachers.ctaLink}
                          onChange={(e) => updateSection("forTeachers", { ctaLink: e.target.value })}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 10. Depoimentos */}
                <AccordionItem value="testimonials" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-rose-500" />
                      Depoimentos ({form.testimonials.items.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Depoimentos</span>
                        <p className="text-[11px] text-muted-foreground">Prova social com avaliadores</p>
                      </div>
                      <Switch
                        checked={form.visibility.showTestimonials}
                        onCheckedChange={(val) => updateVisibility("showTestimonials", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.testimonials.badge}
                        onChange={(e) => updateSection("testimonials", { badge: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-semibold"
                        value={form.testimonials.title}
                        onChange={(e) => updateSection("testimonials", { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.testimonials.description}
                        onChange={(e) => updateSection("testimonials", { description: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Label className="text-xs font-semibold">Lista de Depoimentos</Label>
                      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={addTestimonialItem}>
                        <Plus className="mr-1 h-3 w-3" /> Adicionar Depoimento
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {form.testimonials.items.map((it, idx) => (
                        <div key={it.id} className="rounded-xl border border-border/80 p-3 bg-muted/20 space-y-2 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary">Depoimento #{idx + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeTestimonialItem(it.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-[11px]">Nome</Label>
                              <Input
                                className="mt-1 h-7 text-xs"
                                value={it.name}
                                onChange={(e) => updateTestimonialItem(it.id, "name", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-[11px]">Cargo / Instituição</Label>
                              <Input
                                className="mt-1 h-7 text-xs"
                                value={it.role}
                                onChange={(e) => updateTestimonialItem(it.id, "role", e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-[11px]">Depoimento</Label>
                            <Textarea
                              rows={2}
                              className="mt-1 text-xs"
                              value={it.quote}
                              onChange={(e) => updateTestimonialItem(it.id, "quote", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 11. Planos & Preços */}
                <AccordionItem value="pricing" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      Planos & Preços
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Seção de Planos</span>
                        <p className="text-[11px] text-muted-foreground">Gratuito até 30 alunos / Pro a partir de 30</p>
                      </div>
                      <Switch
                        checked={form.visibility.showPricing}
                        onCheckedChange={(val) => updateVisibility("showPricing", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge da Seção</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.pricing.badge}
                        onChange={(e) => updateSection("pricing", { badge: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título Principal da Seção</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-semibold"
                        value={form.pricing.title}
                        onChange={(e) => updateSection("pricing", { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição da Seção</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.pricing.description}
                        onChange={(e) => updateSection("pricing", { description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {/* Plano Gratuito */}
                      <div className="rounded-lg border border-border/70 p-3 bg-muted/20 space-y-2">
                        <span className="text-xs font-bold text-foreground">Plano Gratuito (até 30 usuários)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[11px]">Título do Plano</Label>
                            <Input
                              className="mt-1 h-7 text-xs font-medium"
                              value={form.pricing.freeTitle}
                              onChange={(e) => updateSection("pricing", { freeTitle: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-[11px]">Preço Exibido</Label>
                            <Input
                              className="mt-1 h-7 text-xs font-bold text-foreground"
                              value={form.pricing.freePrice}
                              onChange={(e) => updateSection("pricing", { freePrice: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-[11px]">Descrição</Label>
                          <Textarea
                            rows={2}
                            className="mt-1 text-xs"
                            value={form.pricing.freeDesc}
                            onChange={(e) => updateSection("pricing", { freeDesc: e.target.value })}
                          />
                        </div>
                        <StringListEditor
                          title="Benefícios do Plano Gratuito"
                          items={form.pricing.freeBullets || []}
                          onChange={(newBullets) => updateSection("pricing", { freeBullets: newBullets })}
                          placeholder="Novo benefício do plano gratuito..."
                        />
                      </div>

                      {/* Plano Pro */}
                      <div className="rounded-lg border border-primary/30 p-3 bg-primary/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">Plano Pro (a partir de 30 usuários)</span>
                          <Input
                            className="h-6 w-32 text-[10px] bg-background font-semibold"
                            value={form.pricing.proTag}
                            onChange={(e) => updateSection("pricing", { proTag: e.target.value })}
                            placeholder="Tag (ex: Mais Popular)"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[11px]">Título do Plano</Label>
                            <Input
                              className="mt-1 h-7 text-xs font-medium"
                              value={form.pricing.proTitle}
                              onChange={(e) => updateSection("pricing", { proTitle: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-[11px]">Preço Exibido</Label>
                            <Input
                              className="mt-1 h-7 text-xs font-bold text-primary"
                              value={form.pricing.proPrice}
                              onChange={(e) => updateSection("pricing", { proPrice: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-[11px]">Descrição</Label>
                          <Textarea
                            rows={2}
                            className="mt-1 text-xs"
                            value={form.pricing.proDesc}
                            onChange={(e) => updateSection("pricing", { proDesc: e.target.value })}
                          />
                        </div>
                        <StringListEditor
                          title="Benefícios do Plano Pro"
                          items={form.pricing.proBullets || []}
                          onChange={(newBullets) => updateSection("pricing", { proBullets: newBullets })}
                          placeholder="Novo benefício do plano pro..."
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 12. FAQ (Perguntas Frequentes) */}
                <AccordionItem value="faq" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-cyan-500" />
                      FAQ / Perguntas Frequentes ({form.faq.items.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir FAQ</span>
                        <p className="text-[11px] text-muted-foreground">Alimenta visual da Home e JSON-LD Schema</p>
                      </div>
                      <Switch
                        checked={form.visibility.showFaq}
                        onCheckedChange={(val) => updateVisibility("showFaq", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.faq.badge}
                        onChange={(e) => updateSection("faq", { badge: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-semibold"
                        value={form.faq.title}
                        onChange={(e) => updateSection("faq", { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.faq.description}
                        onChange={(e) => updateSection("faq", { description: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Label className="text-xs font-semibold">Lista de Perguntas & Respostas</Label>
                      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={addFaqItem}>
                        <Plus className="mr-1 h-3 w-3" /> Nova Pergunta
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {form.faq.items.map((it, idx) => (
                        <div key={it.id} className="rounded-xl border border-border/80 p-3 bg-muted/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground">Pergunta #{idx + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFaqItem(it.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Pergunta</Label>
                            <Input
                              className="mt-0.5 h-7 text-xs font-medium"
                              value={it.q}
                              onChange={(e) => updateFaqItem(it.id, "q", e.target.value)}
                              placeholder="Pergunta..."
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Resposta</Label>
                            <Textarea
                              rows={2}
                              className="mt-0.5 text-xs"
                              value={it.a}
                              onChange={(e) => updateFaqItem(it.id, "a", e.target.value)}
                              placeholder="Resposta..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 13. Banner Final CTA */}
                <AccordionItem value="cta" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      Banner de Chamada Final (CTA)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Banner CTA Final</span>
                        <p className="text-[11px] text-muted-foreground">Seção antes do rodapé</p>
                      </div>
                      <Switch
                        checked={form.visibility.showCtaBanner}
                        onCheckedChange={(val) => updateVisibility("showCtaBanner", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.ctaBanner.badge}
                        onChange={(e) => updateSection("ctaBanner", { badge: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título Chamativo</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-semibold"
                        value={form.ctaBanner.title}
                        onChange={(e) => updateSection("ctaBanner", { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição / Convite</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.ctaBanner.description}
                        onChange={(e) => updateSection("ctaBanner", { description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Texto do Botão Principal</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.ctaBanner.buttonText}
                          onChange={(e) => updateSection("ctaBanner", { buttonText: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Link do Botão Principal</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.ctaBanner.buttonLink}
                          onChange={(e) => updateSection("ctaBanner", { buttonLink: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Texto do Botão Secundário</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.ctaBanner.secondaryButtonText}
                          onChange={(e) => updateSection("ctaBanner", { secondaryButtonText: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Link do Botão Secundário</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.ctaBanner.secondaryButtonLink}
                          onChange={(e) => updateSection("ctaBanner", { secondaryButtonLink: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Texto de Garantia / Segurança</Label>
                      <Input
                        className="mt-1 h-8 text-xs text-muted-foreground"
                        value={form.ctaBanner.guaranteeText}
                        onChange={(e) => updateSection("ctaBanner", { guaranteeText: e.target.value })}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 14. Rodapé & Informações */}
                <AccordionItem value="footer" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-500" />
                      Rodapé & Informações Institucionais
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Exibir Rodapé</span>
                        <p className="text-[11px] text-muted-foreground">Copyright e links institucionais</p>
                      </div>
                      <Switch
                        checked={form.visibility.showFooter}
                        onCheckedChange={(val) => updateVisibility("showFooter", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Slogan / Descrição do Rodapé</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.footer.brandTagline}
                        onChange={(e) => updateSection("footer", { brandTagline: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">E-mail de Contato</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.footer.contactEmail}
                          onChange={(e) => updateSection("footer", { contactEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">WhatsApp de Contato (Rodapé)</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          value={form.footer.contactWhatsapp}
                          onChange={(e) => updateSection("footer", { contactWhatsapp: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Endereço / Localização</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={form.footer.addressText}
                        onChange={(e) => updateSection("footer", { addressText: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Texto de Direitos / Copyright</Label>
                      <Input
                        className="mt-1 h-8 text-xs text-muted-foreground"
                        value={form.footer.copyrightText}
                        onChange={(e) => updateSection("footer", { copyrightText: e.target.value })}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 15. WhatsApp Flutuante */}
                <AccordionItem value="whatsapp" className="rounded-xl border border-border/80 px-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-500" />
                      Atendimento WhatsApp Flutuante
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div>
                        <span className="text-xs font-semibold">Ativar Botão Flutuante do WhatsApp</span>
                        <p className="text-[11px] text-muted-foreground">Exibe botão verde discreto no canto inferior direito da Home</p>
                      </div>
                      <Switch
                        checked={form.whatsapp?.enabled ?? form.visibility.showWhatsapp ?? false}
                        onCheckedChange={(val) => updateWhatsapp({ enabled: val })}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Número de WhatsApp (com DDD e código do país)</Label>
                      <Input
                        className="mt-1 h-8 text-xs font-medium"
                        value={form.whatsapp?.phoneNumber || form.footer.contactWhatsapp || ""}
                        onChange={(e) => updateWhatsapp({ phoneNumber: e.target.value })}
                        placeholder="+55 (11) 99999-9999"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Usado para gerar o link oficial wa.me (somente números serão considerados no envio).
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs">Mensagem Padrão Pré-preenchida</Label>
                      <Textarea
                        rows={2}
                        className="mt-1 text-xs"
                        value={form.whatsapp?.defaultMessage || ""}
                        onChange={(e) => updateWhatsapp({ defaultMessage: e.target.value })}
                        placeholder="Ex: Olá! Gostaria de saber mais sobre o ProMetric."
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        A mensagem será codificada automaticamente na URL wa.me.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}

        {/* ─── Lado Direito: Live Preview Interativo em Tempo Real ─── */}
        <div className={`space-y-3 ${fullPreview ? "col-span-1" : "lg:col-span-7"}`}>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Eye className="h-4 w-4 text-primary" />
              <span>Preview Interativo em Tempo Real</span>
              <Badge variant="secondary" className="text-[10px]">
                {device === "desktop" ? "100% Desktop" : device === "tablet" ? "768px Tablet" : "375px Mobile"}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground">Atualiza ao vivo enquanto você digita</span>
          </div>

          <div className="flex justify-center rounded-2xl border border-border/80 bg-neutral-900/10 p-3 shadow-inner dark:bg-black/40">
            <div
              className={`transition-all duration-300 overflow-hidden rounded-xl border border-border/70 bg-background shadow-2xl ${
                device === "mobile"
                  ? "w-[375px] min-h-[640px]"
                  : device === "tablet"
                  ? "w-[768px] min-h-[700px]"
                  : "w-full min-h-[700px]"
              }`}
            >
              {/* Barra de simulação do navegador */}
              <div className="flex h-9 items-center justify-between border-b border-border/60 bg-muted/40 px-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex h-5 w-48 items-center justify-center rounded-md bg-background px-2 text-[10px] text-muted-foreground">
                  https://prometric.app/
                </div>
                <div className="text-[10px] text-muted-foreground">Live</div>
              </div>

              {/* Conteúdo Renderizado da Landing Page com os Dados do Editor */}
              <div className="max-h-[750px] overflow-y-auto">
                <LiveLandingPreview config={form} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de Pré-visualização da Landing Page que consome o estado em edição
 */
function LiveLandingPreview({ config }: { config: HomePageConfig }) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="min-h-full bg-background text-foreground text-sm selection:bg-primary/20">
      {/* Barra de Anúncio Superior se ativa */}
      {config.visibility.showAnnouncement && config.announcement.text && (
        <div className="bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground">
          <span>{config.announcement.text} </span>
          {config.announcement.linkText && (
            <a href={config.announcement.linkUrl} className="underline hover:opacity-80">
              {config.announcement.linkText} →
            </a>
          )}
        </div>
      )}

      {/* Header Falso */}
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PrometricIcon className="h-7 w-7" />
          <span className="font-display font-bold">
            Pro<span className="text-gradient-brand">Metric</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 text-xs">
            Entrar
          </Button>
          <Button size="sm" className="h-7 bg-gradient-brand text-xs text-primary-foreground">
            {config.hero.primaryCtaText || "Criar conta"}
          </Button>
        </div>
      </header>

      {/* 1. Hero */}
      {config.visibility.showHero && (
        <section className="relative px-6 py-12 text-center bg-gradient-to-b from-primary/5 via-transparent to-transparent">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
            {config.hero.headline}{" "}
            {config.hero.headlineHighlight && (
              <span className="text-gradient-brand">{config.hero.headlineHighlight}</span>
            )}
          </h1>
          {config.hero.badge && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary mt-3">
              <Sparkles className="h-3 w-3" />
              {config.hero.badge}
            </div>
          )}
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {config.hero.subheadline}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="sm" className="bg-gradient-brand text-primary-foreground shadow-glow h-9 px-4 text-xs font-semibold">
              {config.hero.primaryCtaText}
            </Button>
            {config.hero.secondaryCtaText && (
              <Button size="sm" variant="outline" className="h-9 px-4 text-xs">
                {config.hero.secondaryCtaText}
              </Button>
            )}
          </div>

          {config.hero.quickNote && (
            <p className="mt-3 text-[11px] text-muted-foreground">{config.hero.quickNote}</p>
          )}

          {config.hero.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {config.hero.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-muted/60 border border-border/60 px-2.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. Stats */}
      {config.visibility.showStats && (
        <section className="border-y border-border/60 bg-muted/20 px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
            {[config.stats.item1, config.stats.item2, config.stats.item3, config.stats.item4].map((s, idx) => (
              <div key={idx} className="p-2">
                <div className="font-display text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs font-semibold text-foreground mt-0.5">{s.label}</div>
                {s.sublabel && <div className="text-[10px] text-muted-foreground mt-0.5">{s.sublabel}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. O que é */}
      {config.visibility.showWhatIs && (
        <section className="px-6 py-12 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <Badge variant="outline" className="mb-2 text-[10px]">
              {config.whatIs.badge}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{config.whatIs.title}</h2>
            <p className="text-xs text-muted-foreground mt-2">{config.whatIs.description}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/80 p-4 bg-card/60">
              <h3 className="font-bold text-sm text-foreground">{config.whatIs.card1Title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{config.whatIs.card1Desc}</p>
            </div>
            <div className="rounded-xl border border-border/80 p-4 bg-card/60">
              <h3 className="font-bold text-sm text-foreground">{config.whatIs.card2Title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{config.whatIs.card2Desc}</p>
            </div>
            <div className="rounded-xl border border-border/80 p-4 bg-card/60">
              <h3 className="font-bold text-sm text-foreground">{config.whatIs.card3Title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{config.whatIs.card3Desc}</p>
            </div>
          </div>
        </section>
      )}

      {/* 4. Metodologia / 5 Dimensões */}
      {config.visibility.showMethodology && (
        <section className="px-6 py-10 bg-muted/10 border-t border-border/60">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <Badge variant="outline" className="mb-2 text-[10px]">
                {config.methodology.badge}
              </Badge>
              <h2 className="text-xl font-bold text-foreground">{config.methodology.title}</h2>
              <p className="text-xs text-muted-foreground mt-1.5">{config.methodology.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-border/60 p-3 bg-card">
                <span className="font-semibold text-primary block">1. {config.methodology.dim1Title}</span>
                <span className="text-muted-foreground text-[11px] mt-1 block">{config.methodology.dim1Desc}</span>
              </div>
              <div className="rounded-lg border border-border/60 p-3 bg-card">
                <span className="font-semibold text-primary block">2. {config.methodology.dim2Title}</span>
                <span className="text-muted-foreground text-[11px] mt-1 block">{config.methodology.dim2Desc}</span>
              </div>
              <div className="rounded-lg border border-border/60 p-3 bg-card">
                <span className="font-semibold text-primary block">3. {config.methodology.dim3Title}</span>
                <span className="text-muted-foreground text-[11px] mt-1 block">{config.methodology.dim3Desc}</span>
              </div>
              <div className="rounded-lg border border-border/60 p-3 bg-card">
                <span className="font-semibold text-primary block">4. {config.methodology.dim4Title}</span>
                <span className="text-muted-foreground text-[11px] mt-1 block">{config.methodology.dim4Desc}</span>
              </div>
              <div className="rounded-lg border border-border/60 p-3 bg-card sm:col-span-2">
                <span className="font-semibold text-primary block">5. {config.methodology.dim5Title}</span>
                <span className="text-muted-foreground text-[11px] mt-1 block">{config.methodology.dim5Desc}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Depoimentos */}
      {config.visibility.showTestimonials && config.testimonials.items?.length > 0 && (
        <section className="px-6 py-12 max-w-5xl mx-auto border-t border-border/60">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-2 text-[10px]">
              {config.testimonials.badge}
            </Badge>
            <h2 className="text-xl font-bold text-foreground">{config.testimonials.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">{config.testimonials.description}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {config.testimonials.items.map((t) => (
              <div key={t.id} className="rounded-xl border border-border/80 p-4 bg-card/60 flex flex-col justify-between">
                <p className="text-xs text-muted-foreground italic">"{t.quote}"</p>
                <div className="mt-4 pt-3 border-t border-border/40">
                  <div className="font-bold text-xs text-foreground">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Planos (Pricing Preview) */}
      {config.visibility.showPricing && (
        <section className="px-6 py-10 bg-muted/20 border-t border-border/60">
          <div className="max-w-4xl mx-auto text-center mb-6">
            <Badge variant="outline" className="mb-2 text-[10px]">
              {config.pricing.badge || "Planos"}
            </Badge>
            <h2 className="text-xl font-bold text-foreground">
              {config.pricing.title || "Planos Simples e Transparentes"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg mx-auto">
              {config.pricing.description}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Gratuito */}
            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm flex flex-col justify-between text-left">
              <div>
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">Até 30 alunos</span>
                <h3 className="font-bold text-base text-foreground mt-0.5">{config.pricing.freeTitle}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-2xl font-bold">{config.pricing.freePrice}</span>
                  <span className="text-[10px] text-muted-foreground">/ sempre grátis</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{config.pricing.freeDesc}</p>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {config.pricing.freeBullets?.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-4 text-xs h-7">
                Começar Grátis
              </Button>
            </div>

            {/* Pro */}
            <div className="rounded-xl border-2 border-primary/60 bg-card p-4 shadow-md flex flex-col justify-between text-left relative">
              <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-brand px-2 py-0.5 text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                {config.pricing.proTag || "Recomendado"}
              </span>
              <div>
                <span className="text-[10px] font-semibold uppercase text-primary">A partir de 30 alunos</span>
                <h3 className="font-bold text-base text-foreground mt-0.5">{config.pricing.proTitle}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-2xl font-bold">{config.pricing.proPrice}</span>
                  <span className="text-[10px] text-muted-foreground">/mês</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{config.pricing.proDesc}</p>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {config.pricing.proBullets?.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button size="sm" className="w-full mt-4 text-xs h-7 bg-gradient-brand text-primary-foreground shadow-glow">
                Assinar Pro
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 7. FAQ */}
      {config.visibility.showFaq && config.faq.items?.length > 0 && (
        <section className="px-6 py-12 max-w-3xl mx-auto border-t border-border/60">
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-2 text-[10px]">
              {config.faq.badge}
            </Badge>
            <h2 className="text-xl font-bold text-foreground">{config.faq.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">{config.faq.description}</p>
          </div>

          <div className="space-y-2">
            {config.faq.items.map((it) => (
              <div key={it.id} className="rounded-lg border border-border/70 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === it.id ? null : it.id)}
                  className="w-full text-left p-3 text-xs font-semibold flex items-center justify-between hover:bg-muted/30"
                >
                  <span>{it.q}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${openFaq === it.id ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === it.id && (
                  <div className="p-3 pt-0 text-xs text-muted-foreground bg-muted/10 border-t border-border/40">
                    {it.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Banner CTA Final */}
      {config.visibility.showCtaBanner && (
        <section className="px-6 py-12 bg-gradient-brand text-primary-foreground text-center">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold">{config.ctaBanner.title}</h2>
            <p className="text-xs sm:text-sm opacity-90 max-w-lg mx-auto">{config.ctaBanner.description}</p>
            <div className="pt-2 flex justify-center gap-3">
              <Button size="sm" variant="secondary" className="font-semibold text-xs h-9 px-4">
                {config.ctaBanner.buttonText}
              </Button>
            </div>
            {config.ctaBanner.guaranteeText && (
              <p className="text-[10px] opacity-80 pt-1">{config.ctaBanner.guaranteeText}</p>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      {config.visibility.showFooter && (
        <footer className="border-t border-border/70 bg-card/60 px-6 py-8 text-center text-xs text-muted-foreground">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-2 font-display font-bold text-foreground">
              <PrometricIcon className="h-5 w-5" /> ProMetric
            </div>
            <p className="text-[11px]">{config.footer.brandTagline}</p>
            <p className="text-[10px] pt-2">{config.footer.copyrightText}</p>
          </div>
        </footer>
      )}
    </div>
  );
}
