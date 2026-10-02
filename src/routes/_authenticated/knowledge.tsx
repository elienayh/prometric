import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen, Activity, Calculator, Sparkles, BarChart3, HelpCircle, ShieldCheck,
  HeartPulse, Dumbbell, StretchHorizontal, Zap, Gauge,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/knowledge")({
  component: KnowledgePage,
  head: () => ({
    meta: [
      { title: "Central de Conhecimento — ProMetric" },
      { name: "description", content: "Metodologia ProMetric: cálculos, indicadores, Índice ProMetric e interpretação dos resultados." },
    ],
  }),
});

type Section = {
  id: string;
  label: string;
  icon: typeof BookOpen;
  render: () => React.ReactElement;
};

const SECTIONS: Section[] = [
  { id: "metodo",        label: "O Método",         icon: BookOpen,    render: MethodPage },
  { id: "indice",        label: "Índice ProMetric", icon: Activity,    render: IndexPage },
  { id: "calculos",      label: "Cálculos",         icon: Calculator,  render: CalcPage },
  { id: "interpretacao", label: "Interpretação",    icon: Sparkles,    render: InterpPage },
  { id: "graficos",      label: "Gráficos",         icon: BarChart3,   render: ChartsPage },
  { id: "faq",           label: "FAQ",              icon: HelpCircle,  render: FaqPage },
  { id: "transparencia", label: "Transparência",    icon: ShieldCheck, render: TranspPage },
];

function KnowledgePage() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const applyHash = () => {
      const h = window.location.hash.replace(/^#/, "");
      if (h && SECTIONS.some((s) => s.id === h)) setActive(h);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero shadow-glow">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold">Central de Conhecimento</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entenda a metodologia, os cálculos e como interpretar os indicadores do ProMetric.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <Button
              key={s.id}
              variant="ghost"
              onClick={() => setActive(s.id)}
              className={cn(
                "w-full justify-start gap-2",
                active === s.id && "bg-accent/50 text-accent-foreground font-semibold",
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </Button>
          ))}
        </nav>

        <Card id={current.id} className="p-6 sm:p-8 scroll-mt-24">
          <current.render />
        </Card>
      </div>
    </div>
  );
}

// ───────────────────── Páginas ─────────────────────

function MethodPage() {
  return (
    <Section title="O que é o Método ProMetric">
      <P>
        O <b>Método ProMetric®</b> é um protocolo de avaliação física escolar e esportiva que combina
        antropometria, testes de aptidão e inteligência artificial para acompanhar a evolução de
        crianças, adolescentes e atletas ao longo do tempo.
      </P>
      <Grid>
        <Pill icon={HeartPulse} title="Aplicação escolar" text="Mapeamento de saúde, postura e aptidão de turmas inteiras, com priorização de alunos em atenção." />
        <Pill icon={Dumbbell}   title="Aplicação esportiva" text="Detecção de talentos, controle de carga e direcionamento por modalidade." />
        <Pill icon={Gauge}      title="Acompanhamento evolutivo" text="Histórico individual, comparação com a turma e com a escola, evolução anual." />
      </Grid>
      <P>
        O ambiente <b>demonstrativo</b> e o ambiente <b>real</b> compartilham exatamente os mesmos
        cálculos, dashboards e relatórios. A diferença é apenas a presença de dados fictícios
        no ambiente demo — no ambiente real, os indicadores se preenchem automaticamente conforme
        professores cadastram alunos e avaliações.
      </P>
    </Section>
  );
}

function IndexPage() {
  const dims: { icon: typeof HeartPulse; name: string; tests: string }[] = [
    { icon: HeartPulse,         name: "Saúde Corporal",        tests: "Peso, Altura, IMC, RCE" },
    { icon: Dumbbell,           name: "Resistência",           tests: "Corrida 6 min, Abdominal 1 min" },
    { icon: StretchHorizontal,  name: "Mobilidade",            tests: "Flexibilidade (Sit & Reach)" },
    { icon: Zap,                name: "Potência",              tests: "Salto horizontal, Medicine Ball" },
    { icon: Gauge,              name: "Velocidade e Agilidade", tests: "Corrida 20 m, Teste do Quadrado" },
  ];
  return (
    <Section title="Como funciona o Índice ProMetric">
      <P>
        O <b>Índice ProMetric</b> é um score de <b>0 a 100</b> que resume o desempenho do aluno em
        cinco dimensões. Cada teste é convertido em uma zona de referência por sexo e idade, e essas
        zonas são agregadas em uma média ponderada das dimensões.
      </P>
      <Grid>
        {dims.map((d) => (
          <Pill key={d.name} icon={d.icon} title={d.name} text={d.tests} />
        ))}
      </Grid>
      <Formula>
        Índice = média(Saúde, Resistência, Mobilidade, Potência, Velocidade) → escala 0–100
      </Formula>
      <P>
        <b>Classificação do índice:</b>
      </P>
      <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
        <li><b>0–20</b> · Crítico</li>
        <li><b>21–40</b> · Atenção</li>
        <li><b>41–60</b> · Em Desenvolvimento</li>
        <li><b>61–80</b> · Bom</li>
        <li><b>81–100</b> · Excelente</li>
      </ul>
    </Section>
  );
}

function CalcPage() {
  return (
    <Section title="Como os indicadores são calculados">
      <Sub title="IMC — Índice de Massa Corporal">
        <Formula>IMC = Peso (kg) ÷ Altura² (m)</Formula>
        <Example>
          Aluno com 45 kg e 1,50 m → 45 ÷ (1,50 × 1,50) = <b>20,0</b>
        </Example>
      </Sub>
      <Sub title="RCE — Relação Cintura/Estatura">
        <Formula>RCE = Cintura (cm) ÷ Estatura (cm)</Formula>
        <Example>
          Cintura 62 cm, altura 150 cm → 62 ÷ 150 = <b>0,41</b> (referência saudável &lt; 0,50)
        </Example>
      </Sub>
      <Sub title="Conversão para categoria geral">
        <P>
          Cada teste é classificado por tabelas de referência por sexo e idade, gerando uma zona
          (Muito Fraco a Excelente). As zonas viram um score numérico (1–6), agregado em escala
          0–100 e mapeado para a categoria final:
        </P>
        <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
          <li><b>Excelente</b> — desempenho muito acima da média</li>
          <li><b>Bom</b> — acima da média</li>
          <li><b>Em Desenvolvimento</b> — dentro da média esperada</li>
          <li><b>Atenção</b> — abaixo do esperado, requer acompanhamento</li>
          <li><b>Prioritário</b> — intervenção pedagógica imediata</li>
        </ul>
      </Sub>
    </Section>
  );
}

function InterpPage() {
  const tiers: { label: string; color: string; desc: string }[] = [
    { label: "Excelente",          color: "bg-success/20 text-success border-success/30",
      desc: "Desempenho muito acima da média. Manter rotina e considerar treino orientado." },
    { label: "Bom",                color: "bg-primary/15 text-primary border-primary/30",
      desc: "Acima da média. Boa base, espaço para evolução em dimensões específicas." },
    { label: "Em Desenvolvimento", color: "bg-accent/20 text-accent-foreground border-accent/30",
      desc: "Dentro do esperado para idade. Continuar trabalho regular." },
    { label: "Atenção",            color: "bg-warning/20 text-warning border-warning/30",
      desc: "Abaixo do esperado em uma ou mais dimensões. Planejar intervenção." },
    { label: "Prioritário",        color: "bg-destructive/15 text-destructive border-destructive/30",
      desc: "Necessita acompanhamento próximo e plano individual de evolução." },
  ];
  return (
    <Section title="Interpretação dos resultados">
      <div className="space-y-3">
        {tiers.map((t) => (
          <div key={t.label} className={cn("rounded-lg border p-4", t.color)}>
            <div className="font-semibold">{t.label}</div>
            <div className="mt-1 text-sm opacity-90">{t.desc}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ChartsPage() {
  return (
    <Section title="Como interpretar os gráficos">
      <Sub title="Radar ProMetric">
        <P>Mostra o desempenho do aluno nas 5 dimensões. Quanto maior a área, melhor o perfil geral.</P>
      </Sub>
      <Sub title="Evolução temporal">
        <P>Linha do tempo com os índices das avaliações. Inclinação positiva indica progresso real.</P>
      </Sub>
      <Sub title="Comparação com a turma e com a escola">
        <P>
          As barras claras representam a média da turma/escola; as escuras, o aluno. Permite identificar
          se o resultado é individual ou um padrão coletivo.
        </P>
      </Sub>
    </Section>
  );
}

function FaqPage() {
  const faqs = [
    { q: "Como calcular o IMC?", a: "IMC = peso em kg dividido pela altura em metros ao quadrado." },
    { q: "O que significa RCE?", a: "Relação Cintura/Estatura — indicador de risco cardiometabólico. Valores abaixo de 0,50 são considerados saudáveis." },
    { q: "Como interpretar o radar?", a: "Cada eixo é uma dimensão (Saúde, Resistência, Mobilidade, Potência, Velocidade). Áreas maiores indicam melhor desempenho geral." },
    { q: "Como melhorar o Índice ProMetric?", a: "Atuando nas dimensões mais baixas: combinar treino de força, resistência e mobilidade ao longo do tempo." },
    { q: "Como funciona a evolução do aluno?", a: "Cada avaliação gera um novo ponto histórico. A progressão é medida pela variação do índice e dos testes individuais." },
    { q: "Como são calculados os rankings?", a: "Por delta percentual entre a primeira e a última avaliação do aluno em cada dimensão." },
  ];
  return (
    <Section title="Perguntas frequentes">
      <div className="space-y-3">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="font-semibold">{f.q}</div>
            <div className="mt-1 text-sm text-muted-foreground">{f.a}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TranspPage() {
  return (
    <Section title="Como os dados são processados">
      <P>
        Todos os cálculos do ProMetric são <b>automáticos e determinísticos</b>: os mesmos dados
        produzem sempre os mesmos resultados.
      </P>
      <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
        <li>As classificações usam tabelas técnicas de referência por sexo e idade.</li>
        <li>O Índice ProMetric é uma média das 5 dimensões, em escala 0–100.</li>
        <li>A <b>IA auxilia</b> na interpretação, sugerindo pontos de atenção e potencialidades.</li>
        <li>A <b>decisão pedagógica final é sempre do professor</b>.</li>
        <li>Nenhum dado de aluno é compartilhado entre tenants — RLS isola cada escola.</li>
      </ul>
    </Section>
  );
}

// ───────────────────── Helpers visuais ─────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
function Pill({ icon: Icon, title, text }: { icon: typeof BookOpen; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{text}</div>
    </div>
  );
}
function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 font-mono text-sm">
      {children}
    </div>
  );
}
function Example({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
      <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Exemplo</span>
      {children}
    </div>
  );
}
