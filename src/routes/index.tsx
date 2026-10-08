import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Activity, ArrowRight, BarChart3, Brain, Check, ChevronDown,
  ClipboardCheck, FileText, GraduationCap, LineChart, ShieldCheck,
  Sparkles, Users, Zap, Building2, Dumbbell, HeartPulse, Timer, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PrometricIcon } from "@/components/brand/prometric-logo";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useHomePageConfig } from "@/hooks/use-homepage-config";
import { DEFAULT_HOMEPAGE_CONFIG, type HomePageConfig } from "@/lib/homepage-cms";

const SITE_URL = typeof window !== "undefined" ? window.location.origin : (process.env.APP_URL || "");
const OG_IMAGE = "/og-cover.jpg";

function getStructuredData(faqItems: { q: string; a: string }[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ProMetric",
      url: SITE_URL,
      logo: `${SITE_URL}/prometric-icon.png`,
      description: "Plataforma de Avaliação Física Integrada baseada no Método ProMetric®.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ProMetric",
      url: SITE_URL,
      inLanguage: "pt-BR",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/blog?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ProMetric",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web Browser",
      description: "Sistema de Avaliação Física Inteligente com IA. Método ProMetric®, Índice 0–100, relatórios automáticos e diagnóstico por IA.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "120" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (faqItems || []).map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    },
  ];
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProMetric | Avaliação Física Inteligente com IA" },
      { name: "description", content: "Método ProMetric® de Avaliação Física: Índice 0–100, 5 dimensões, relatórios automáticos e IA diagnóstica para escolas, academias e clubes." },
      { property: "og:title", content: "ProMetric | Avaliação Física Inteligente com IA" },
      { property: "og:description", content: "Método ProMetric® de Avaliação Física Integrada. Índice 0–100, relatórios automáticos e diagnóstico por IA." },
      { property: "og:url", content: SITE_URL },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ProMetric | Avaliação Física Inteligente com IA" },
      { name: "twitter:description", content: "Método ProMetric® — Avaliação Física Integrada com Índice 0–100 e IA diagnóstica." },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: getStructuredData(DEFAULT_HOMEPAGE_CONFIG.faq.items).map((d) => ({
      type: "application/ld+json",
      children: JSON.stringify(d),
    })),
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;
    const { data: roles } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .limit(1);
    throw redirect({ to: roles && roles.length > 0 ? "/admin" : "/dashboard" });
  },
  component: Landing,
});

function Landing() {
  const { config } = useHomePageConfig();
  const currentFaqItems = config.faq?.items?.length ? config.faq.items : DEFAULT_HOMEPAGE_CONFIG.faq.items;
  const structuredData = getStructuredData(currentFaqItems);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* JSON-LD Schema sincronizado com CMS */}
      {structuredData.map((d, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}

      {config.visibility.showAnnouncement && config.announcement.text && (
        <div className="bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground">
          <span>{config.announcement.text} </span>
          {config.announcement.linkText && (
            <a href={config.announcement.linkUrl || "#"} className="ml-1 underline font-semibold hover:opacity-85">
              {config.announcement.linkText} →
            </a>
          )}
        </div>
      )}
      <SiteHeader />
      <main>
        {config.visibility.showHero && <Hero hero={config.hero} stats={config.stats} />}
        {config.visibility.showStats && <Benefits stats={config.stats} />}
        {config.visibility.showWhatIs && <WhatIsProMetric whatIs={config.whatIs} />}
        {config.visibility.showMethodology && <Methodology methodology={config.methodology} />}
        {config.visibility.showHowItWorks && <HowItWorks />}
        {config.visibility.showForSchools && <ForSchools forSchools={config.forSchools} />}
        {config.visibility.showForTeachers && <ForTeachers forTeachers={config.forTeachers} />}
        {config.visibility.showTestimonials && config.testimonials?.items?.length > 0 && (
          <TestimonialsSection testimonials={config.testimonials} />
        )}
        {config.visibility.showPricing && <GetStartedSection />}
        {config.visibility.showFaq && <Faq faq={config.faq} />}
        {config.visibility.showCtaBanner && <CtaBanner cta={config.ctaBanner} />}
      </main>
      {config.visibility.showFooter && <SiteFooter footer={config.footer} />}
      <FloatingWhatsAppButton whatsapp={config.whatsapp} />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero({ hero, stats }: { hero?: HomePageConfig["hero"]; stats?: HomePageConfig["stats"] }) {
  const badge = hero?.badge || "Método ProMetric® · Avaliação Física Inteligente";
  const headline = hero?.headline || "Avaliação Física Inteligente";
  const headlineHighlight = hero?.headlineHighlight !== undefined ? hero.headlineHighlight : "com IA";
  const subheadline =
    hero?.subheadline ||
    "O ProMetric é a plataforma de Avaliação Física Integrada para escolas, academias e clubes. Aplique o Método ProMetric®, gere relatórios automáticos com o Índice ProMetric® de 0 a 100 e acompanhe a evolução dos alunos em 5 dimensões físicas.";
  const primaryCtaText = hero?.primaryCtaText || "Avaliar minha turma grátis";
  const primaryCtaLink = hero?.primaryCtaLink || "/register";
  const secondaryCtaText = hero?.secondaryCtaText || "Ver em 60 segundos";
  const secondaryCtaLink = hero?.secondaryCtaLink || "#como-funciona";
  const quickNote = hero?.quickNote || "Gratuito até 30 alunos/usuários · A partir de 30: R$ 189,90/mês · Sem cartão";

  const kpis = [
    { kpi: stats?.item1?.value || "−92%", label: stats?.item1?.label || "Tempo de tabulação" },
    { kpi: stats?.item3?.value || "0–100", label: stats?.item3?.label || "Índice ProMetric® por aluno" },
    { kpi: stats?.item4?.value || "<5 min", label: stats?.item4?.label || "Para gerar um relatório" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-90" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            {headline}{" "}
            {headlineHighlight && <span className="text-gradient-brand">{headlineHighlight}</span>}
          </h1>

          {badge && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {badge}
            </div>
          )}

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {subheadline}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
              <Link to={primaryCtaLink}>
                <Zap className="mr-2 h-4 w-4" /> {primaryCtaText}
              </Link>
            </Button>
            {secondaryCtaText && (
              <Button asChild size="lg" variant="outline" className="border-border">
                <a href={secondaryCtaLink}>
                  {secondaryCtaText} <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          {quickNote && (
            <p className="mt-4 text-xs text-muted-foreground">
              {quickNote}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-pop">
            <div className="grid grid-cols-3 divide-x divide-border">
              {kpis.map((s) => (
                <div key={s.label} className="px-6 py-7 text-center">
                  <div className="font-display text-2xl font-bold text-foreground md:text-3xl">{s.kpi}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Benefits ---------- */
function Benefits({ stats }: { stats?: HomePageConfig["stats"] }) {
  const items = [
    {
      icon: ClipboardCheck,
      title: stats?.item1?.label ? `${stats.item1.value} ${stats.item1.label}` : "Avaliação Física Integrada",
      desc: stats?.item1?.sublabel || "Bateria completa com classificação automática por idade e sexo. Zero cálculo manual, zero planilha.",
    },
    {
      icon: FileText,
      title: stats?.item2?.label ? `${stats.item2.value} ${stats.item2.label}` : "Relatórios prontos para entregar",
      desc: stats?.item2?.sublabel || "PDFs profissionais por aluno, turma e escola — gerados em segundos, com a sua identidade visual.",
    },
    {
      icon: Brain,
      title: stats?.item3?.label ? `${stats.item3.value} ${stats.item3.label}` : "Diagnóstico por IA",
      desc: stats?.item3?.sublabel || "Parecer técnico, mensagem para a família e metas de 30/60/90 dias personalizadas para cada aluno.",
    },
    {
      icon: BarChart3,
      title: stats?.item4?.label ? `${stats.item4.value} ${stats.item4.label}` : "Visão de gestão",
      desc: stats?.item4?.sublabel || "Indicadores de saúde e desempenho por turma, escola ou rede. Decisões pedagógicas com dado, não com achismo.",
    },
  ];
  return (
    <section id="beneficios" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="Por que ProMetric"
          title="Menos planilha. Mais aula. Mais resultado."
          description="O professor de Educação Física merece uma ferramenta feita para a rotina real da quadra — não um Excel adaptado."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="card-interactive rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- What is ProMetric ---------- */
function WhatIsProMetric({ whatIs }: { whatIs?: HomePageConfig["whatIs"] }) {
  const eyebrow = whatIs?.badge || "O que é o ProMetric";
  const title = whatIs?.title || "A plataforma de avaliação física do professor moderno";
  const description = whatIs?.description || "Tecnologia, ciência do esporte e gestão pedagógica em um só lugar.";

  return (
    <section id="o-que-e" className="border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="prose-custom mt-10 space-y-5 text-foreground/90 leading-relaxed">
          <p>
            O <strong>ProMetric</strong> é uma plataforma SaaS de Avaliação Física Integrada
            desenvolvida para professores de Educação Física, escolas, academias, clubes esportivos
            e personal trainers que precisam padronizar avaliações, gerar relatórios profissionais
            e acompanhar a evolução de alunos com base em dados objetivos.
          </p>
          <p>
            Diferente de planilhas de Excel adaptadas, o ProMetric foi desenhado a partir da rotina
            real da quadra: o professor coleta os dados pelo celular, o sistema aplica o
            <strong> Método ProMetric®</strong>, calcula o <strong>Índice ProMetric®</strong> de 0 a 100
            e entrega relatórios prontos para a família e a direção no mesmo dia.
          </p>
          <h3 className="font-display text-lg font-semibold pt-2">Quem utiliza o ProMetric</h3>
          <p>
            <strong>Escolas</strong> usam o ProMetric para padronizar a avaliação física de todas
            as turmas, gerar indicadores de saúde da comunidade escolar e diferenciar seu projeto
            pedagógico no mercado. <strong>Professores de Educação Física</strong> ganham horas
            por semana ao automatizar tabulação, classificação e geração de PDF. <strong>Academias
            e clubes esportivos</strong> usam para triagem, controle de cargas e relatórios
            profissionais aos alunos. <strong>Personal trainers</strong> entregam relatórios
            premium para diferenciar seu serviço.
          </p>
          <h3 className="font-display text-lg font-semibold pt-2">Principais benefícios</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Avaliação Física Integrada ProMetric</strong> com bateria completa e protocolos padronizados.</li>
            <li><strong>Índice ProMetric® de 0 a 100</strong> e Perfil de Desenvolvimento Físico por aluno.</li>
            <li><strong>Relatórios em PDF</strong> individuais, por turma e institucionais, gerados em segundos.</li>
            <li><strong>Classificação automática</strong> por idade e sexo, sem cálculo manual nem risco de erro.</li>
            <li><strong>Histórico do aluno</strong> com evolução cronológica e Radar ProMetric® comparativo.</li>
            <li><strong>Inteligência artificial</strong> diagnóstica com parecer técnico e metas personalizadas.</li>
            <li><strong>Dashboard executivo</strong> com indicadores agregados por turma e escola.</li>
            <li><strong>Conformidade LGPD</strong> com dados isolados por instituição e criptografados em repouso.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Methodology — Método ProMetric® ---------- */
function Methodology({ methodology }: { methodology?: HomePageConfig["methodology"] }) {
  const eyebrow = methodology?.badge || "Metodologia";
  const title = methodology?.title || "Método ProMetric® de Avaliação Física";
  const description =
    methodology?.description ||
    "Um sistema próprio que une ciência, tecnologia e inteligência artificial para entregar um diagnóstico claro e acionável em cada avaliação.";

  const dims = [
    { icon: HeartPulse, title: methodology?.dim1Title || "Saúde Corporal", desc: methodology?.dim1Desc || "Composição corporal, IMC e indicadores antropométricos por idade e sexo." },
    { icon: Activity, title: methodology?.dim2Title || "Resistência", desc: methodology?.dim2Desc || "Capacidade cardiorrespiratória e resistência muscular localizada." },
    { icon: Sparkles, title: methodology?.dim3Title || "Mobilidade", desc: methodology?.dim3Desc || "Flexibilidade e amplitude de movimento das principais cadeias musculares." },
    { icon: Dumbbell, title: methodology?.dim4Title || "Potência", desc: methodology?.dim4Desc || "Força explosiva de membros inferiores e superiores em testes padronizados." },
    { icon: Timer, title: methodology?.dim5Title || "Velocidade e Agilidade", desc: methodology?.dim5Desc || "Capacidade de aceleração, deslocamento e mudança de direção." },
  ];
  const cats = [
    { label: "Crítico",            range: "0–24",   tone: "bg-destructive/15 text-destructive border-destructive/30" },
    { label: "Atenção",            range: "25–44",  tone: "bg-warning/20 text-warning border-warning/30" },
    { label: "Em Desenvolvimento", range: "45–64",  tone: "bg-accent/20 text-accent-foreground border-accent/30" },
    { label: "Bom",                range: "65–84",  tone: "bg-primary/15 text-primary border-primary/30" },
    { label: "Excelente",          range: "85–100", tone: "bg-success/20 text-success border-success/30" },
  ];
  return (
    <section id="metodo" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Índice ProMetric®</div>
            <h3 className="mt-2 font-display text-2xl font-bold">Score de 0 a 100 por aluno</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Um único número, fácil de comunicar, que resume o estado físico do aluno e
              permite acompanhar evolução real ao longo do tempo.
            </p>
            <div className="mt-5 space-y-2">
              {cats.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs">
                  <span className={cn("rounded-full border px-2 py-0.5 font-medium", c.tone)}>{c.label}</span>
                  <span className="font-mono text-muted-foreground">{c.range}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">5 Dimensões</div>
            <h3 className="mt-2 font-display text-2xl font-bold">Perfil de Desenvolvimento Físico</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A avaliação é decomposta em 5 dimensões, exibidas no <strong>Radar ProMetric®</strong>,
              para identificar com precisão pontos fortes e oportunidades de desenvolvimento.
            </p>
            <ul className="mt-5 space-y-3">
              {dims.map((d) => (
                <li key={d.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                    <d.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{d.title}</div>
                    <div className="text-xs text-muted-foreground">{d.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-foreground/90">
              Cada avaliação gera, além do Índice ProMetric®, um parecer técnico produzido por
              inteligência artificial: pontos de atenção, recomendações pedagógicas, mensagem
              para a família e metas personalizadas de 30, 60 e 90 dias.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
function HowItWorks() {
  const steps = [
    { icon: Users, title: "1. Cadastre os alunos", desc: "Importe uma planilha ou cadastre manualmente. Leva menos de 2 minutos para uma sala inteira." },
    { icon: ClipboardCheck, title: "2. Realize as avaliações", desc: "Modo Quadra otimizado para mobile: digitou, salvou, próximo aluno. Sem prancheta, sem retrabalho." },
    { icon: FileText, title: "3. Gere os relatórios", desc: "PDFs por aluno e turma com Índice ProMetric®, Radar e parecer da IA — prontos para enviar." },
    { icon: LineChart, title: "4. Acompanhe a evolução", desc: "Compare avaliações ao longo do ano, identifique alunos em atenção e prove o impacto do seu trabalho." },
  ];
  return (
    <section id="como-funciona" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="Como funciona"
          title="Do cadastro ao relatório final em quatro passos"
          description="Fluxo desenhado a partir da rotina real do professor — testado em escolas, clubes e academias."
        />
        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="absolute -top-3 left-6 grid h-7 w-7 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground shadow-glow">
                {i + 1}
              </div>
              <s.icon className="mb-4 h-6 w-6 text-primary" />
              <h3 className="font-display text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- For Schools ---------- */
function ForSchools({ forSchools }: { forSchools?: HomePageConfig["forSchools"] }) {
  const eyebrow = forSchools?.badge || "Para escolas";
  const title = forSchools?.title || "Benefícios para escolas e coordenação";
  const description = forSchools?.description || "Avaliação física como ativo estratégico: gestão, saúde e diferencial pedagógico.";
  const bullets = forSchools?.bullets;

  const items = [
    { icon: Building2, title: "Gestão centralizada", desc: bullets?.[0] || "Visão multi-turma e multi-escola para coordenação e direção em um único painel." },
    { icon: HeartPulse, title: "Indicadores de saúde", desc: bullets?.[1] || "Identifique prevalência de sobrepeso, obesidade e baixa aptidão na comunidade escolar." },
    { icon: FileText, title: "Relatórios institucionais", desc: bullets?.[2] || "PDFs por turma, série ou escola, prontos para reuniões pedagógicas e prestação de contas." },
    { icon: LineChart, title: "Acompanhamento contínuo", desc: bullets?.[3] || "Compare diagnósticos semestrais e meça o impacto pedagógico real do seu programa." },
  ];
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((b) => (
            <div key={b.title} className="card-interactive rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- For Teachers ---------- */
function ForTeachers({ forTeachers }: { forTeachers?: HomePageConfig["forTeachers"] }) {
  const eyebrow = forTeachers?.badge || "Para professores";
  const title = forTeachers?.title || "Benefícios para o professor de Educação Física";
  const description = forTeachers?.description || "Feito a partir da sua rotina: ganhe tempo, padronize e eleve o nível do seu trabalho.";
  const bullets = forTeachers?.bullets;

  const items = [
    { icon: Timer, title: "Economia de tempo", desc: bullets?.[0] || "Reduza em até 92% o tempo gasto com tabulação e geração de relatórios." },
    { icon: ClipboardCheck, title: "Correção automática", desc: bullets?.[1] || "Classificação ProMetric® por idade e sexo aplicada na hora — sem planilhas, sem erro." },
    { icon: FileText, title: "Relatórios profissionais", desc: bullets?.[2] || "Entregue PDFs prontos para a família e a direção no mesmo dia da avaliação." },
    { icon: Brain, title: "Inteligência artificial", desc: bullets?.[3] || "Parecer técnico, mensagem para a família e metas de 30/60/90 dias por aluno." },
    { icon: LineChart, title: "Histórico do aluno", desc: bullets?.[4] || "Acompanhe a evolução cronológica de cada aluno com Radar ProMetric® comparativo." },
    { icon: Dumbbell, title: "Modo Quadra", desc: "Fluxo mobile otimizado para coletar com a turma toda em uma única aula." },
  ];
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <div key={b.title} className="card-interactive rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials Section ---------- */
function TestimonialsSection({ testimonials }: { testimonials: HomePageConfig["testimonials"] }) {
  const items = testimonials?.items || [];
  if (items.length === 0) return null;

  return (
    <section id="depoimentos" className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow={testimonials.badge || "Depoimentos"}
          title={testimonials.title || "Quem usa o ProMetric aprova"}
          description={testimonials.description || "Professores, coordenadores e treinadores que transformaram sua rotina."}
          align="center"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-pop"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 italic">"{t.quote}"</p>
              </div>
              <div className="mt-6 border-t border-border/60 pt-4">
                <div className="font-display font-semibold text-foreground text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role} · {t.organization}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Comece Grátis (Incentivo à Criação de Conta) ---------- */
function GetStartedSection() {
  return (
    <section id="comece-gratis" className="border-t border-border bg-gradient-to-b from-secondary/30 via-background to-secondary/30 py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-card p-8 md:p-12 shadow-glow text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-brand/10 border border-primary/30 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Acesso Imediato
          </div>

          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Comece grátis, sem cartão de crédito
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Crie sua conta em menos de 1 minuto e comece a avaliar seus estudantes hoje mesmo na quadra pelo celular.
          </p>

          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-border/80 bg-background/80 p-6 backdrop-blur-sm shadow-card">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              O que você tem no plano gratuito livre para sempre:
            </div>
            <ul className="space-y-3 text-left text-sm text-foreground/90">
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span><strong>Modo Quadra ultra-rápido:</strong> colete peso, estatura e baterias de testes sem retrabalho.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span><strong>Índice ProMetric® e Radar:</strong> diagnósticos físicos integrados em 5 dimensões com curvas oficiais.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span><strong>Relatórios em PDF e Portal:</strong> emissão individual instantânea e compartilhamento com as famílias.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90 px-8 py-6 text-base font-semibold">
              <Link to="/register">
                Criar conta gratuita agora
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Sem pegadinhas • Não pede cartão • Configuração em 60 segundos
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function Faq({ faq }: { faq?: HomePageConfig["faq"] }) {
  const eyebrow = faq?.badge || "FAQ";
  const title = faq?.title || "Perguntas frequentes sobre o ProMetric";
  const description =
    faq?.description ||
    "Tire suas dúvidas sobre o Método ProMetric®, Avaliação Física Integrada e o uso da plataforma.";
  const items = faq?.items?.length ? faq.items : DEFAULT_HOMEPAGE_CONFIG.faq.items;

  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
        />
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
          {items.map((it) => (
            <FaqItem key={it.id || it.q} q={it.q} a={it.a} />
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-card">
          <ShieldCheck className="h-5 w-5 text-success" />
          <span className="text-sm text-muted-foreground">Conformidade LGPD e dados criptografados em repouso.</span>
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string; key?: React.Key }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/60"
      aria-expanded={open}
    >
      <div className="flex-1">
        <div className="font-medium text-foreground">{q}</div>
        {open && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>}
      </div>
      <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
    </button>
  );
}

/* ---------- CTA Banner ---------- */
function CtaBanner({ cta }: { cta?: HomePageConfig["ctaBanner"] }) {
  const title = cta?.title || "Transforme a Educação Física da sua instituição hoje mesmo";
  const description =
    cta?.description ||
    "Crie sua conta gratuita em menos de 1 minuto e comece a avaliar seus alunos com relatórios profissionais que valorizam seu trabalho.";
  const buttonText = cta?.buttonText || "Criar Conta Gratuita";
  const buttonLink = cta?.buttonLink || "/register";
  const secondaryButtonText = cta?.secondaryButtonText || "Conhecer o método";
  const secondaryButtonLink = cta?.secondaryButtonLink || "#metodo";
  const guaranteeText = cta?.guaranteeText || "Sem cartão de crédito · Ativação imediata · 100% online";

  return (
    <section className="relative overflow-hidden border-t border-border bg-gradient-mesh py-20 text-center">
      <div className="relative mx-auto max-w-4xl px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-95">
            <Link to={buttonLink}>{buttonText}</Link>
          </Button>
          {secondaryButtonText && (
            <Button asChild size="lg" variant="outline">
              <a href={secondaryButtonLink}>{secondaryButtonText}</a>
            </Button>
          )}
        </div>
        {guaranteeText && (
          <p className="mt-4 text-xs text-muted-foreground">{guaranteeText}</p>
        )}
      </div>
    </section>
  );
}

/* ---------- Section header ---------- */
function SectionHeader({
  eyebrow, title, description, align = "left",
}: { eyebrow: string; title: string; description: string; align?: "left" | "center" }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</div>
      <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

/* ---------- Botão Flutuante Discreto WhatsApp ---------- */
function FloatingWhatsAppButton({ whatsapp }: { whatsapp?: HomePageConfig["whatsapp"] }) {
  if (!whatsapp?.enabled) return null;

  const rawNumber = (whatsapp.phoneNumber || "").replace(/\D/g, "");
  const defaultText = whatsapp.defaultMessage || "Olá! Gostaria de saber mais sobre o ProMetric.";
  const encodedMessage = encodeURIComponent(defaultText);
  const href = rawNumber
    ? `https://wa.me/${rawNumber}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  return (
    <aside aria-label="Atendimento via WhatsApp" className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar conosco via WhatsApp"
        className="group flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#20ba5a] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          stroke="currentColor"
          strokeWidth="0"
          fill="currentColor"
          className="h-5 w-5 fill-white"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.65 3.742-.983zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <span className="text-xs font-semibold tracking-wide">WhatsApp</span>
      </a>
    </aside>
  );
}
