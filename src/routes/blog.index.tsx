import { createFileRoute, Link } from "@tanstack/react-router";

const POSTS = [
  { slug: "metodo-prometric", title: "Método ProMetric®: como funciona a Avaliação Física Integrada", excerpt: "Entenda as 5 dimensões, o Índice ProMetric® de 0 a 100 e como a metodologia proprietária do ProMetric padroniza diagnósticos físicos." },
  { slug: "como-aplicar-avaliacao-fisica-escola", title: "Como aplicar uma Avaliação Física Integrada na escola, passo a passo", excerpt: "Roteiro prático para professores de Educação Física aplicarem a bateria do Método ProMetric® com a turma toda em até 2 aulas." },
  { slug: "como-calcular-imc-escolar", title: "Como calcular o IMC escolar e interpretar resultados", excerpt: "Fórmula, faixas de classificação por idade e sexo, e como comunicar os indicadores de saúde para famílias e direção escolar." },
  { slug: "avaliacao-fisica-educacao-fisica-escolar", title: "Avaliação física na Educação Física Escolar: por onde começar", excerpt: "Como estruturar um plano anual de avaliações físicas alinhado à BNCC e à realidade da quadra." },
  { slug: "beneficios-avaliacao-fisica-escolas", title: "Benefícios da avaliação física para escolas e gestores", excerpt: "Como dados de aptidão física viram decisões pedagógicas, projetos de saúde e diferencial competitivo para a escola." },
];

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog ProMetric — Avaliação Física, IA e Educação Física" },
      { name: "description", content: "Conteúdo especializado para professores de Educação Física: Método ProMetric®, avaliação física integrada, indicadores de saúde e gestão pedagógica." },
      { property: "og:title", content: "Blog ProMetric — Avaliação Física Inteligente" },
      { property: "og:description", content: "Guias, tutoriais e referências sobre o Método ProMetric® e avaliação física escolar." },
    ],
    links: [{ rel: "canonical", href: "https://prometric.lovable.app/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <header className="mb-12">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Blog</div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Avaliação Física, Educação Física Escolar e Método ProMetric®</h1>
          <p className="mt-3 text-base text-muted-foreground">Guias, tutoriais e referências para o professor moderno.</p>
        </header>
        <ul className="space-y-5">
          {POSTS.map((p) => (
            <li key={p.slug} className="rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:bg-secondary/40">
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="block">
                <h2 className="font-display text-xl font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                <span className="mt-3 inline-block text-xs font-medium text-primary">Ler artigo →</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-12 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
        </div>
      </section>
    </div>
  );
}
