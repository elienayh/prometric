import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Activity, ArrowRight, BarChart3, Brain, Check, ChevronDown,
  ClipboardCheck, FileText, GraduationCap, LineChart, ShieldCheck,
  Sparkles, Users, Zap, Building2, Dumbbell, HeartPulse, Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const SITE_URL = typeof window !== "undefined" ? window.location.origin : (process.env.APP_URL || "");
const OG_IMAGE = "/og-cover.jpg";

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "O que é o Método ProMetric®?", a: "É a metodologia proprietária do ProMetric para Avaliação Física Integrada. Combina antropometria, testes motores e cardiorrespiratórios em 5 dimensões (Saúde Corporal, Resistência, Mobilidade, Potência e Velocidade & Agilidade), gerando o Índice ProMetric® de 0 a 100." },
  { q: "Como funciona o Índice ProMetric®?", a: "O Índice ProMetric® é um score de 0 a 100 que sintetiza o desempenho do aluno em 5 dimensões. Os resultados são classificados em 5 categorias: Crítico, Atenção, Em Desenvolvimento, Bom e Excelente — sempre considerando idade e sexo." },
  { q: "Como realizar uma avaliação física escolar?", a: "Cadastre a turma, aplique os testes da Avaliação Física Integrada ProMetric em até duas aulas, registre os resultados pelo celular e o sistema gera o Índice ProMetric® e o relatório individual automaticamente." },
  { q: "Como calcular o IMC escolar?", a: "IMC = peso (kg) ÷ altura² (m). Em escolares, a classificação considera idade e sexo. O ProMetric faz o cálculo e a interpretação automaticamente dentro da dimensão Saúde Corporal." },
  { q: "Como gerar relatórios de avaliação física?", a: "Após registrar as avaliações, basta clicar em Gerar Relatório. O ProMetric monta um PDF profissional individual, por turma ou por escola, em segundos — com o Índice ProMetric® e o Perfil de Desenvolvimento Físico de cada aluno." },
  { q: "Posso usar o ProMetric em academias?", a: "Sim. Personal trainers e academias usam o ProMetric para padronizar avaliações físicas, acompanhar evolução e entregar relatórios profissionais aos alunos." },
  { q: "Posso usar em clubes esportivos?", a: "Sim. Clubes utilizam para triagem de atletas, controle de cargas e relatórios de desempenho por categoria." },
  { q: "Como funciona a avaliação em lote?", a: "O Modo Quadra permite avaliar a turma inteira em sequência, sem retrabalho: digitou, salvou, próximo aluno." },
  { q: "Como acompanhar a evolução dos alunos?", a: "Cada aluno tem histórico cronológico com Radar ProMetric® comparativo, permitindo medir o impacto pedagógico ao longo do ano." },
  { q: "O sistema funciona pelo celular?", a: "Sim. O ProMetric é mobile-first e otimizado para uso na quadra, mesmo em conexões instáveis." },
  { q: "O sistema gera PDF?", a: "Sim. Relatórios individuais, por turma e institucionais em PDF profissional, prontos para enviar à família e à direção." },
  { q: "O sistema possui inteligência artificial?", a: "Sim. A IA gera parecer técnico, mensagem para a família e metas personalizadas de 30/60/90 dias por aluno." },
  { q: "Como funciona o histórico do aluno?", a: "Cada avaliação fica registrada cronologicamente, com Perfil de Desenvolvimento Físico ProMetric em cada momento." },
  { q: "Posso cadastrar turmas?", a: "Sim. Você organiza alunos por turma, série, escola ou clube, com filtros e permissões por professor." },
  { q: "Existe versão gratuita?", a: "Sim. O plano Gratuito é para sempre, até 50 alunos, sem cartão de crédito e sem trial expirando." },
];

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ProMetric",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
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
    mainEntity: FAQ_ITEMS.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  },
];

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
    scripts: STRUCTURED_DATA.map((d) => ({
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
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <Benefits />
        <WhatIsProMetric />
        <Methodology />
        <HowItWorks />
        <ForSchools />
        <ForTeachers />
        <Pricing />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------- Header ---------- */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="ProMetric — página inicial">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
            <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Pro<span className="text-gradient-brand">Metric</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#o-que-e" className="transition-colors hover:text-foreground">O que é</a>
          <a href="#metodo" className="transition-colors hover:text-foreground">Método</a>
          <a href="#como-funciona" className="transition-colors hover:text-foreground">Como funciona</a>
          <a href="#planos" className="transition-colors hover:text-foreground">Planos</a>
          <Link to="/blog" className="transition-colors hover:text-foreground">Blog</Link>
          <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/register">Criar conta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Método ProMetric® · IA diagnóstica · LGPD
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            <span className="text-gradient-brand">Avaliação Física Inteligente</span> com IA
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            O ProMetric é a plataforma de Avaliação Física Integrada para escolas, academias e clubes.
            Aplique o Método ProMetric®, gere relatórios automáticos com o Índice ProMetric® de 0 a 100
            e acompanhe a evolução dos alunos em 5 dimensões físicas.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
              <Link to="/register">
                <Zap className="mr-2 h-4 w-4" /> Avaliar minha turma grátis
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border">
              <a href="#como-funciona">Ver em 60 segundos <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Grátis até 50 alunos · Sem cartão · Pronto para usar na próxima aula
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-pop">
            <div className="grid grid-cols-3 divide-x divide-border">
              {[
                { kpi: "−92%", label: "Tempo de tabulação" },
                { kpi: "0–100", label: "Índice ProMetric® por aluno" },
                { kpi: "<5 min", label: "Para gerar um relatório" },
              ].map((s) => (
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
function Benefits() {
  const items = [
    { icon: ClipboardCheck, title: "Avaliação Física Integrada", desc: "Bateria completa com classificação automática por idade e sexo. Zero cálculo manual, zero planilha." },
    { icon: FileText, title: "Relatórios prontos para entregar", desc: "PDFs profissionais por aluno, turma e escola — gerados em segundos, com a sua identidade visual." },
    { icon: Brain, title: "Diagnóstico por IA", desc: "Parecer técnico, mensagem para a família e metas de 30/60/90 dias personalizadas para cada aluno." },
    { icon: BarChart3, title: "Visão de gestão", desc: "Indicadores de saúde e desempenho por turma, escola ou rede. Decisões pedagógicas com dado, não com achismo." },
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
function WhatIsProMetric() {
  return (
    <section id="o-que-e" className="border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="O que é o ProMetric"
          title="A plataforma de avaliação física do professor moderno"
          description="Tecnologia, ciência do esporte e gestão pedagógica em um só lugar."
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
function Methodology() {
  const dims = [
    { icon: HeartPulse, title: "Saúde Corporal", desc: "Composição corporal, IMC e indicadores antropométricos por idade e sexo." },
    { icon: Activity, title: "Resistência", desc: "Capacidade cardiorrespiratória e resistência muscular localizada." },
    { icon: Sparkles, title: "Mobilidade", desc: "Flexibilidade e amplitude de movimento das principais cadeias musculares." },
    { icon: Dumbbell, title: "Potência", desc: "Força explosiva de membros inferiores e superiores em testes padronizados." },
    { icon: Timer, title: "Velocidade e Agilidade", desc: "Capacidade de aceleração, deslocamento e mudança de direção." },
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
          eyebrow="Metodologia"
          title="Método ProMetric® de Avaliação Física"
          description="Um sistema próprio que une ciência, tecnologia e inteligência artificial para entregar um diagnóstico claro e acionável em cada avaliação."
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
function ForSchools() {
  const items = [
    { icon: Building2, title: "Gestão centralizada", desc: "Visão multi-turma e multi-escola para coordenação e direção em um único painel." },
    { icon: HeartPulse, title: "Indicadores de saúde", desc: "Identifique prevalência de sobrepeso, obesidade e baixa aptidão na comunidade escolar." },
    { icon: FileText, title: "Relatórios institucionais", desc: "PDFs por turma, série ou escola, prontos para reuniões pedagógicas e prestação de contas." },
    { icon: LineChart, title: "Acompanhamento contínuo", desc: "Compare diagnósticos semestrais e meça o impacto pedagógico real do seu programa." },
  ];
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="Para escolas"
          title="Benefícios para escolas e coordenação"
          description="Avaliação física como ativo estratégico: gestão, saúde e diferencial pedagógico."
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
function ForTeachers() {
  const items = [
    { icon: Timer, title: "Economia de tempo", desc: "Reduza em até 92% o tempo gasto com tabulação e geração de relatórios." },
    { icon: ClipboardCheck, title: "Correção automática", desc: "Classificação ProMetric® por idade e sexo aplicada na hora — sem planilhas, sem erro." },
    { icon: FileText, title: "Relatórios profissionais", desc: "Entregue PDFs prontos para a família e a direção no mesmo dia da avaliação." },
    { icon: Brain, title: "Inteligência artificial", desc: "Parecer técnico, mensagem para a família e metas de 30/60/90 dias por aluno." },
    { icon: LineChart, title: "Histórico do aluno", desc: "Acompanhe a evolução cronológica de cada aluno com Radar ProMetric® comparativo." },
    { icon: Dumbbell, title: "Modo Quadra", desc: "Fluxo mobile otimizado para coletar com a turma toda em uma única aula." },
  ];
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="Para professores"
          title="Benefícios para o professor de Educação Física"
          description="Feito a partir da sua rotina: ganhe tempo, padronize e eleve o nível do seu trabalho."
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

/* ---------- Pricing ---------- */
function Pricing() {
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/ para sempre",
      features: ["Até 50 alunos", "Método ProMetric® completo", "Relatórios PDF individuais", "1 professor"],
      cta: "Começar grátis agora",
      highlight: false,
    },
    {
      name: "Pro",
      price: "R$ 79",
      period: "/ mês",
      features: ["Até 500 alunos", "IA diagnóstica ilimitada", "Relatórios institucionais", "Dashboard executivo", "Suporte prioritário em até 4h"],
      cta: "Quero o Pro",
      highlight: true,
    },
    {
      name: "Instituição",
      price: "Sob medida",
      period: "",
      features: ["Alunos ilimitados", "Multi-escola e multi-rede", "SSO e API de integração", "Onboarding e treinamento dedicados"],
      cta: "Falar com especialista",
      highlight: false,
    },
  ];
  return (
    <section id="planos" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="Planos"
          title="Comece grátis hoje. Faça upgrade quando crescer."
          description="Preço previsível, sem surpresa. Cancele quando quiser — seus dados são seus."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 shadow-card",
                p.highlight ? "border-primary/40 ring-1 ring-primary/30 shadow-pop" : "border-border",
              )}
            >
              {p.highlight && (
                <div className="absolute -top-3 right-6 rounded-full bg-gradient-brand px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-glow">
                  Mais popular
                </div>
              )}
              <div className="font-display text-base font-semibold">{p.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold">{p.price}</span>
                {p.period && <span className="text-sm text-muted-foreground">{p.period}</span>}
              </div>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={cn(
                  "mt-6 w-full",
                  p.highlight ? "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90" : "",
                )}
                variant={p.highlight ? "default" : "outline"}
              >
                <Link to="/register">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function Faq() {
  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="FAQ"
          title="Perguntas frequentes sobre o ProMetric"
          description="Tire suas dúvidas sobre o Método ProMetric®, Avaliação Física Integrada e o uso da plataforma."
          align="center"
        />
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
          {FAQ_ITEMS.map((it, i) => (
            <FaqItem key={i} q={it.q} a={it.a} />
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

/* ---------- Footer ---------- */
function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4 text-primary" />
            ProMetric — Avaliação Física Inteligente com IA.
          </div>
          <nav aria-label="Rodapé" className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <Link to="/login" className="hover:text-foreground">Entrar</Link>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <span>© {new Date().getFullYear()} ProMetric</span>
          </nav>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-[11px] leading-relaxed text-muted-foreground/80">
          O Método ProMetric® foi desenvolvido com base em referências científicas e protocolos
          reconhecidos de avaliação física, ampliados com tecnologia, automação e inteligência
          artificial.
        </p>
      </div>
    </footer>
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
