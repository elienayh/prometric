import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface Post {
  title: string;
  description: string;
  body: { h?: string; p?: string }[];
}

const POSTS: Record<string, Post> = {
  "metodo-prometric": {
    title: "Método ProMetric®: como funciona a Avaliação Física Integrada",
    description: "Entenda as 5 dimensões, o Índice ProMetric® de 0 a 100 e como a metodologia proprietária do ProMetric padroniza diagnósticos físicos.",
    body: [
      { p: "O Método ProMetric® é uma metodologia proprietária de Avaliação Física Integrada, desenvolvida para escolas, academias, clubes e personal trainers que precisam padronizar diagnósticos e acompanhar a evolução de alunos com base em dados objetivos." },
      { h: "Índice ProMetric® — score de 0 a 100" },
      { p: "Cada aluno recebe um Índice ProMetric® de 0 a 100, classificado em cinco categorias: Crítico (0–24), Atenção (25–44), Em Desenvolvimento (45–64), Bom (65–84) e Excelente (85–100). Um número simples, fácil de comunicar à família e à direção." },
      { h: "5 dimensões do desenvolvimento físico" },
      { p: "O Método ProMetric® avalia o aluno em cinco dimensões: (1) Saúde Corporal — composição corporal e antropometria; (2) Resistência — capacidade cardiorrespiratória e muscular; (3) Mobilidade — flexibilidade e amplitude de movimento; (4) Potência — força explosiva; e (5) Velocidade e Agilidade — aceleração e mudança de direção." },
      { h: "Radar ProMetric®" },
      { p: "Os resultados das 5 dimensões são apresentados no Radar ProMetric®, que permite identificar com precisão pontos fortes e oportunidades de desenvolvimento de cada aluno." },
      { h: "Base científica e tecnologia" },
      { p: "O Método ProMetric® foi desenvolvido com base em referências científicas e protocolos reconhecidos de avaliação física, ampliados com tecnologia, automação e inteligência artificial. O resultado: um diagnóstico claro, acionável e entregue no mesmo dia da avaliação." },
    ],
  },
  "como-aplicar-avaliacao-fisica-escola": {
    title: "Como aplicar uma Avaliação Física Integrada na escola, passo a passo",
    description: "Roteiro prático para professores de Educação Física aplicarem a bateria do Método ProMetric® com a turma toda em até 2 aulas.",
    body: [
      { p: "Aplicar uma Avaliação Física Integrada parece complexo no início, mas com planejamento certo cabe em duas aulas de 50 minutos. Veja o passo a passo do Método ProMetric®." },
      { h: "1. Planejamento prévio" },
      { p: "Antes da aula, cadastre a turma no sistema, separe os materiais (trena, cronômetro, colchonete, medicine ball, cones) e revise os protocolos. Avise as famílias com antecedência." },
      { h: "2. Aula 1 — força, flexibilidade e potência" },
      { p: "Comece pelos testes que exigem menor recuperação: sentar e alcançar, abdominal em 1 minuto, salto horizontal e medicine ball. Organize a turma em estações e cronometre 8 minutos por estação." },
      { h: "3. Aula 2 — velocidade, agilidade e resistência" },
      { p: "Reserve a segunda aula para o teste do quadrado (agilidade), velocidade de 20 m e corrida de 6 minutos. Aplique o cardiorrespiratório por último — ele exige maior esforço." },
      { h: "4. Tabulação e Índice ProMetric®" },
      { p: "Com o ProMetric, os dados são digitados direto no celular durante o teste. Ao final, o sistema calcula o Índice ProMetric® de 0 a 100, gera o Radar das 5 dimensões e produz o relatório individual em PDF, com parecer da IA." },
    ],
  },
  "como-calcular-imc-escolar": {
    title: "Como calcular o IMC escolar e interpretar resultados",
    description: "Fórmula, faixas de classificação por idade e sexo, e como comunicar os indicadores de saúde para famílias e direção escolar.",
    body: [
      { p: "O IMC (Índice de Massa Corporal) é um dos indicadores de saúde mais usados na avaliação física escolar. Mas, diferente do adulto, em crianças e adolescentes ele precisa ser interpretado por idade e sexo." },
      { h: "Fórmula do IMC" },
      { p: "IMC = peso (kg) ÷ altura² (m). Exemplo: aluno de 40 kg e 1,40 m → IMC = 40 ÷ (1,40 × 1,40) = 20,4 kg/m²." },
      { h: "Classificação por idade e sexo" },
      { p: "Para escolares, usam-se curvas de referência específicas por faixa etária e sexo, classificando em baixo peso, eutrófico (saudável), sobrepeso e obesidade. Aplicar a tabela adulta em criança é erro grave." },
      { h: "Como comunicar resultados" },
      { p: "O IMC isolado não diagnostica saúde. Combine com indicadores motores e cardiorrespiratórios antes de comunicar à família. No ProMetric, o IMC entra na dimensão Saúde Corporal do Método ProMetric® e é contextualizado pelo Índice geral do aluno." },
    ],
  },
  "avaliacao-fisica-educacao-fisica-escolar": {
    title: "Avaliação física na Educação Física Escolar: por onde começar",
    description: "Como estruturar um plano anual de avaliações físicas alinhado à BNCC e à realidade da quadra.",
    body: [
      { p: "Avaliar fisicamente os alunos é parte do trabalho do professor de Educação Física — e está previsto na BNCC. Mas, na prática, falta tempo, padrão e ferramenta. Veja como começar." },
      { h: "Defina dois marcos no ano" },
      { p: "O modelo mais usado é duas avaliações por ano: uma no início (março) e outra no fim (outubro/novembro). Isso permite comparar evolução e provar impacto pedagógico." },
      { h: "Escolha uma metodologia padronizada" },
      { p: "Adote uma metodologia clara e padronizada como o Método ProMetric®, com classificação automática por idade e sexo, vocabulário próprio (Índice de 0 a 100 e 5 dimensões) e relatórios prontos." },
      { h: "Automatize a tabulação" },
      { p: "Planilha de Excel funciona, mas consome horas. O ProMetric elimina tabulação, classificação e geração de PDF — devolvendo tempo ao professor para o que importa: a aula." },
    ],
  },
  "beneficios-avaliacao-fisica-escolas": {
    title: "Benefícios da avaliação física para escolas e gestores",
    description: "Como dados de aptidão física viram decisões pedagógicas, projetos de saúde e diferencial competitivo para a escola.",
    body: [
      { p: "Avaliação física escolar não é só responsabilidade do professor — é ativo estratégico da escola. Veja como diretores e coordenadores podem extrair valor desses dados." },
      { h: "1. Diagnóstico de saúde da comunidade escolar" },
      { p: "Identificar prevalência de sobrepeso, obesidade ou baixa aptidão cardiorrespiratória permite criar projetos de saúde, parcerias com nutricionistas e ações com as famílias." },
      { h: "2. Diferencial pedagógico e de marketing" },
      { p: "Escolas que entregam o Perfil de Desenvolvimento Físico ProMetric semestralmente às famílias se diferenciam. É prova concreta de cuidado com cada aluno." },
      { h: "3. Indicadores para a gestão" },
      { p: "O dashboard executivo do ProMetric mostra evolução por turma, escola e rede com o Índice ProMetric® agregado, permitindo decisões pedagógicas com dado em vez de achismo." },
    ],
  },
};

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = POSTS[params.slug];
    if (!post) throw notFound();
    return { post, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { post, slug } = loaderData;
    const url = `https://prometric.lovable.app/blog/${slug}`;
    return {
      meta: [
        { title: `${post.title} | ProMetric` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            author: { "@type": "Organization", name: "ProMetric" },
            publisher: { "@type": "Organization", name: "ProMetric" },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Artigo não encontrado</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary">Voltar para o blog</Link>
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Todos os artigos
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{post.description}</p>
        <div className="mt-10 space-y-5">
          {post.body.map((b: { h?: string; p?: string }, i: number) =>
            b.h ? (
              <h2 key={i} className="font-display text-xl font-semibold pt-4">{b.h}</h2>
            ) : (
              <p key={i} className="leading-relaxed text-foreground/90">{b.p}</p>
            ),
          )}
        </div>
      </article>
    </div>
  );
}
