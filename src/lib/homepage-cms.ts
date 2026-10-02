export type FaqItem = {
  id: string;
  q: string;
  a: string;
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  rating: number;
};

export type StatItem = {
  value: string;
  label: string;
  sublabel?: string;
};

export type FeatureHighlight = {
  id: string;
  title: string;
  description: string;
  tag?: string;
};

export type HomePageConfig = {
  version: number;
  updatedAt: string;
  theme: {
    accentGradient: "brand" | "emerald" | "blue" | "violet" | "amber";
    badgeText: string;
  };
  visibility: {
    showAnnouncement: boolean;
    showHero: boolean;
    showStats: boolean;
    showWhatIs: boolean;
    showMethodology: boolean;
    showHowItWorks: boolean;
    showForSchools: boolean;
    showForTeachers: boolean;
    showTestimonials: boolean;
    showPricing: boolean;
    showFaq: boolean;
    showCtaBanner: boolean;
    showFooter: boolean;
  };
  announcement: {
    text: string;
    linkText: string;
    linkUrl: string;
  };
  hero: {
    badge: string;
    headline: string;
    headlineHighlight: string;
    subheadline: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    tags: string[];
    quickNote: string;
  };
  stats: {
    title?: string;
    item1: StatItem;
    item2: StatItem;
    item3: StatItem;
    item4: StatItem;
  };
  whatIs: {
    badge: string;
    title: string;
    description: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
  };
  methodology: {
    badge: string;
    title: string;
    description: string;
    dim1Title: string;
    dim1Desc: string;
    dim2Title: string;
    dim2Desc: string;
    dim3Title: string;
    dim3Desc: string;
    dim4Title: string;
    dim4Desc: string;
    dim5Title: string;
    dim5Desc: string;
  };
  forSchools: {
    badge: string;
    title: string;
    description: string;
    bullets: string[];
    ctaText: string;
    ctaLink: string;
  };
  forTeachers: {
    badge: string;
    title: string;
    description: string;
    bullets: string[];
    ctaText: string;
    ctaLink: string;
  };
  testimonials: {
    badge: string;
    title: string;
    description: string;
    items: TestimonialItem[];
  };
  pricing: {
    badge: string;
    title: string;
    description: string;
    freeTitle: string;
    freePrice: string;
    freeDesc: string;
    freeBullets: string[];
    proTitle: string;
    proPrice: string;
    proDesc: string;
    proBullets: string[];
    proTag: string;
  };
  faq: {
    badge: string;
    title: string;
    description: string;
    items: FaqItem[];
  };
  ctaBanner: {
    badge: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    guaranteeText: string;
  };
  footer: {
    brandTagline: string;
    copyrightText: string;
    contactEmail: string;
    contactWhatsapp: string;
    addressText: string;
  };
};

export const DEFAULT_HOMEPAGE_CONFIG: HomePageConfig = {
  version: 1,
  updatedAt: new Date().toISOString(),
  theme: {
    accentGradient: "brand",
    badgeText: "Método ProMetric® · Avaliação Física Inteligente",
  },
  visibility: {
    showAnnouncement: false,
    showHero: true,
    showStats: true,
    showWhatIs: true,
    showMethodology: true,
    showHowItWorks: true,
    showForSchools: true,
    showForTeachers: true,
    showTestimonials: true,
    showPricing: true,
    showFaq: true,
    showCtaBanner: true,
    showFooter: true,
  },
  announcement: {
    text: "Novidade: Recálculo automático de IMC OMS 2007 e Laudos com Inteligência Artificial integrados.",
    linkText: "Saiba mais",
    linkUrl: "#metodo",
  },
  hero: {
    badge: "Método ProMetric® · Avaliação Física Inteligente",
    headline: "Avaliação Física Escolar e Esportiva",
    headlineHighlight: "sem Planilhas nem Retrabalho",
    subheadline:
      "Padronize antropometria e testes motores. Obtenha o Índice ProMetric® de 0 a 100, laudos diagnósticos automáticos por IA e relatórios em PDF prontos para entregar à coordenação e às famílias.",
    primaryCtaText: "Começar gratuitamente",
    primaryCtaLink: "/register",
    secondaryCtaText: "Conhecer o método",
    secondaryCtaLink: "#metodo",
    tags: [
      "Gratuito até 30 usuários",
      "A partir de 30: R$ 189,90/mês",
      "100% alinhado à BNCC",
      "Antropometria OMS 2007",
    ],
    quickNote: "Gratuito até 30 alunos/usuários · A partir de 30: R$ 189,90/mês · Sem cartão de crédito.",
  },
  stats: {
    title: "Impacto comprovado na gestão de Educação Física",
    item1: {
      value: "100%",
      label: "Alinhado à BNCC",
      sublabel: "Critérios oficiais de desenvolvimento motor",
    },
    item2: {
      value: "5",
      label: "Dimensões Físicas",
      sublabel: "Saúde, Resistência, Mobilidade, Potência e Velocidade",
    },
    item3: {
      value: "0 a 100",
      label: "Índice ProMetric®",
      sublabel: "Score padronizado por idade e sexo",
    },
    item4: {
      value: "< 30s",
      label: "Por Aluno na Quadra",
      sublabel: "Entrada rápida com modo quadra otimizado",
    },
  },
  whatIs: {
    badge: "Por que ProMetric?",
    title: "Uma solução completa da quadra à reunião pedagógica",
    description:
      "Elimine anotações em pranchetas perdidas e planilhas complexas. Transforme dados brutos em diagnósticos claros que valorizam a disciplina de Educação Física.",
    card1Title: "Coleta Rápida sem Retrabalho",
    card1Desc:
      "Interface ultra-rápida pensada para uso direto na quadra pelo celular ou tablet. Registre peso, estatura e baterias de testes em sequência.",
    card2Title: "Índice ProMetric® 0–100",
    card2Desc:
      "Algoritmo proprietário que normaliza testes antropométricos e motores contra curvas populacionais de referência (PROESP-BR e OMS 2007).",
    card3Title: "Laudos Inteligentes com IA",
    card3Desc:
      "Gere pareceres técnicos e orientações éticas para os pais em linguagem clara e acolhedora, com metas progressivas de 30, 60 e 90 dias.",
  },
  methodology: {
    badge: "Metodologia Científica",
    title: "As 5 Dimensões da Avaliação Física Integrada",
    description:
      "A metodologia ProMetric organiza os principais testes motores em cinco dimensões equilibradas, permitindo uma visão 360° da aptidão física.",
    dim1Title: "Saúde Corporal & Antropometria",
    dim1Desc: "Estatura, peso, IMC OMS 2007 por mês de idade, perímetro de cintura e relação cintura-estatura (RCE).",
    dim2Title: "Resistência Muscular & Cardiorrespiratória",
    dim2Desc: "Teste abdominal de 1 minuto e corrida/caminhada de 6 minutos para capacidade aeróbica.",
    dim3Title: "Mobilidade & Flexibilidade",
    dim3Desc: "Banco de Wells (sentar e alcançar) e amplitude articular funcional.",
    dim4Title: "Potência & Força Muscular",
    dim4Desc: "Salto horizontal e arremesso de medicine ball para membros superiores e inferiores.",
    dim5Title: "Velocidade & Agilidade",
    dim5Desc: "Tiro de 20 metros e teste do quadrado (4x4m) para agilidade e tempo de reação.",
  },
  forSchools: {
    badge: "Para Escolas e Instituições",
    title: "Gestão esportiva de ponta para sua instituição",
    description:
      "Dê visibilidade ao trabalho dos professores, acompanhe indicadores de saúde da comunidade escolar e apresente relatórios institucionais que impressionam direção e famílias.",
    bullets: [
      "Visão agregada por turma, série e unidade escolar",
      "Gráficos comparativos com a média e evolução histórica",
      "Exportação de relatórios institucionais completos em PDF",
      "Controle de acesso por múltiplos professores e coordenadores",
      "LGPD e privacidade estrita para dados de menores",
    ],
    ctaText: "Cadastrar minha escola",
    ctaLink: "/register",
  },
  forTeachers: {
    badge: "Para Professores e Personal Trainers",
    title: "Menos tempo digitando, mais tempo ensinando",
    description:
      "Criado por profissionais de Educação Física para o dia a dia na quadra e na academia. Praticidade extrema sem abrir mão do rigor técnico.",
    bullets: [
      "Funciona direto no navegador do celular — rápido e leve",
      "Cálculos de IMC, Z-Score e percentis feitos na hora",
      "Radar ProMetric® visual que o aluno e a família entendem",
      "Sugestões de metas e orientações para planejar suas aulas",
      "Plano Gratuito permanente para turmas iniciais",
    ],
    ctaText: "Criar conta de professor",
    ctaLink: "/register",
  },
  testimonials: {
    badge: "Depoimentos Reais",
    title: "Quem usa o ProMetric aprova",
    description: "Professores, coordenadores e treinadores que transformaram sua rotina de avaliações físicas.",
    items: [
      {
        id: "t1",
        name: "Prof. Marcos Vinícius",
        role: "Coordenador de Educação Física",
        organization: "Colégio Santa Maria",
        quote:
          "O ProMetric transformou as reuniões pedagógicas da nossa escola. Pela primeira vez os pais recebem um laudo físico tão detalhado e visual quanto o boletim de notas.",
        rating: 5,
      },
      {
        id: "t2",
        name: "Dra. Carolina Mendes",
        role: "Professora e Pesquisadora",
        organization: "Instituto de Esportes",
        quote:
          "O rigor com a curva OMS 2007 em meses e os testes PROESP é exemplar. É o único software que alia precisão científica com extrema facilidade de uso na quadra.",
        rating: 5,
      },
      {
        id: "t3",
        name: "Lucas Alencar",
        role: "Personal Trainer & Avaliador",
        organization: "CT Performance",
        quote:
          "A agilidade do Modo Quadra economizou mais de 15 horas de digitação no fim do semestre. O Índice ProMetric de 0 a 100 facilitou muito a explicação para os alunos.",
        rating: 5,
      },
    ],
  },
  pricing: {
    badge: "Planos Acessíveis",
    title: "Comece grátis, evolua conforme sua demanda",
    description: "Sem pegadinhas, sem teste de 7 dias com cartão. O plano Gratuito é livre para sempre.",
    freeTitle: "Gratuito",
    freePrice: "R$ 0",
    freeDesc: "Gratuito para sempre até 30 alunos/usuários. Sem pegadinhas nem cartão de crédito.",
    freeBullets: [
      "Gratuito até 30 alunos / usuários",
      "Todas as baterias de testes",
      "Índice ProMetric® e Radar",
      "Relatórios individuais em PDF",
      "Acesso completo via celular",
    ],
    proTitle: "Pro",
    proPrice: "R$ 189,90",
    proDesc: "A partir de 30 alunos/usuários. Alunos e turmas ilimitados para escolas, academias, clubes e avaliadores.",
    proBullets: [
      "Alunos e turmas ilimitados (a partir de 30 alunos)",
      "Laudos com Inteligência Artificial",
      "Relatórios comparativos de turma e instituição",
      "Personalização da marca e logo",
      "Suporte prioritário via WhatsApp",
    ],
    proTag: "Mais Popular",
  },
  faq: {
    badge: "Dúvidas Frequentes",
    title: "Perguntas e Respostas sobre o ProMetric",
    description: "Tudo o que você precisa saber sobre a metodologia, funcionamento e planos.",
    items: [
      {
        id: "f1",
        q: "O que é o Método ProMetric®?",
        a: "É a metodologia proprietária do ProMetric para Avaliação Física Integrada. Combina antropometria, testes motores e cardiorrespiratórios em 5 dimensões, gerando o Índice ProMetric® sintetizado de 0 a 100.",
      },
      {
        id: "f2",
        q: "Como funciona a classificação de IMC em escolares?",
        a: "O ProMetric utiliza a referência oficial da OMS 2007 calculada com base na idade exata em meses e sexo do estudante, diferenciando magreza, eutrofia, sobrepeso e obesidade segundo o Manual de Orientação da SBP.",
      },
      {
        id: "f3",
        q: "Preciso de internet na quadra durante a aula?",
        a: "O ProMetric é otimizado como aplicação web progressiva (PWA), permitindo carregar a turma e registrar com estabilidade mesmo em redes móveis ou Wi-Fi fraco da escola.",
      },
      {
        id: "f4",
        q: "Como o sistema gera os laudos e relatórios em PDF?",
        a: "Após salvar os dados dos testes, basta clicar em 'Gerar Relatório'. O sistema renderiza instantaneamente relatórios individuais ou consolidados da turma em PDF de alta qualidade com gráficos, radar e parecer técnico.",
      },
      {
        id: "f5",
        q: "Como funcionam os planos e existe versão gratuita?",
        a: "O ProMetric possui modelo transparente com apenas dois planos: o plano Gratuito é livre para sempre até 30 alunos/usuários, sem necessidade de cartão de crédito. A partir de 30 alunos, o plano Pro custa R$ 189,90 por mês com alunos ilimitados, laudos com inteligência artificial, relatórios comparativos e suporte prioritário. Não existem outros planos.",
      },
      {
        id: "f6",
        q: "Posso convidar outros professores da minha escola?",
        a: "Sim. O sistema possui suporte multi-usuário para equipes escolares, permitindo que a coordenação convide professores avaliadores com papéis e permissões seguras.",
      },
    ],
  },
  ctaBanner: {
    badge: "Pronto para modernizar suas avaliações?",
    title: "Transforme a Educação Física da sua instituição hoje mesmo",
    description:
      "Crie sua conta gratuita em menos de 1 minuto e comece a avaliar seus alunos com relatórios profissionais que valorizam seu trabalho.",
    buttonText: "Criar Conta Gratuita",
    buttonLink: "/register",
    secondaryButtonText: "Falar com Especialista",
    secondaryButtonLink: "/login",
    guaranteeText: "Sem cartão de crédito · Ativação imediata · 100% online",
  },
  footer: {
    brandTagline: "Plataforma de Avaliação Física Integrada e Inteligência Diagnóstica para Educação Física e Esporte.",
    copyrightText: "© 2026 ProMetric®. Todos os direitos reservados.",
    contactEmail: "contato@prometric.app",
    contactWhatsapp: "+55 (11) 99999-9999",
    addressText: "São Paulo, Brasil · Conectando ciência e prática pedagógica",
  },
};

const STORAGE_KEY = "prometric_homepage_cms_config_v1";

/**
 * Carrega a configuração do localStorage se existir, mesclando com os padrões
 */
export function getLocalHomePageConfig(): HomePageConfig {
  if (typeof window === "undefined") {
    return DEFAULT_HOMEPAGE_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HOMEPAGE_CONFIG;
    const parsed = JSON.parse(raw);
    return mergeWithDefaultConfig(parsed);
  } catch (err) {
    console.warn("[homepage-cms] Erro ao carregar config local:", err);
    return DEFAULT_HOMEPAGE_CONFIG;
  }
}

/**
 * Salva a configuração no localStorage para sincronização imediata
 */
export function saveLocalHomePageConfig(config: HomePageConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn("[homepage-cms] Erro ao salvar config local:", err);
  }
}

/**
 * Remove do localStorage para restaurar os padrões
 */
export function resetLocalHomePageConfig(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("[homepage-cms] Erro ao resetar config local:", err);
  }
}

/**
 * Mescla recursivamente um objeto parcial com a configuração padrão
 */
export function mergeWithDefaultConfig(partial?: Partial<HomePageConfig> | null): HomePageConfig {
  if (!partial) return DEFAULT_HOMEPAGE_CONFIG;

  return {
    ...DEFAULT_HOMEPAGE_CONFIG,
    ...partial,
    theme: {
      ...DEFAULT_HOMEPAGE_CONFIG.theme,
      ...(partial.theme || {}),
    },
    visibility: {
      ...DEFAULT_HOMEPAGE_CONFIG.visibility,
      ...(partial.visibility || {}),
    },
    announcement: {
      ...DEFAULT_HOMEPAGE_CONFIG.announcement,
      ...(partial.announcement || {}),
    },
    hero: {
      ...DEFAULT_HOMEPAGE_CONFIG.hero,
      ...(partial.hero || {}),
      tags: partial.hero?.tags || DEFAULT_HOMEPAGE_CONFIG.hero.tags,
    },
    stats: {
      ...DEFAULT_HOMEPAGE_CONFIG.stats,
      ...(partial.stats || {}),
      item1: { ...DEFAULT_HOMEPAGE_CONFIG.stats.item1, ...(partial.stats?.item1 || {}) },
      item2: { ...DEFAULT_HOMEPAGE_CONFIG.stats.item2, ...(partial.stats?.item2 || {}) },
      item3: { ...DEFAULT_HOMEPAGE_CONFIG.stats.item3, ...(partial.stats?.item3 || {}) },
      item4: { ...DEFAULT_HOMEPAGE_CONFIG.stats.item4, ...(partial.stats?.item4 || {}) },
    },
    whatIs: {
      ...DEFAULT_HOMEPAGE_CONFIG.whatIs,
      ...(partial.whatIs || {}),
    },
    methodology: {
      ...DEFAULT_HOMEPAGE_CONFIG.methodology,
      ...(partial.methodology || {}),
    },
    forSchools: {
      ...DEFAULT_HOMEPAGE_CONFIG.forSchools,
      ...(partial.forSchools || {}),
      bullets: partial.forSchools?.bullets || DEFAULT_HOMEPAGE_CONFIG.forSchools.bullets,
    },
    forTeachers: {
      ...DEFAULT_HOMEPAGE_CONFIG.forTeachers,
      ...(partial.forTeachers || {}),
      bullets: partial.forTeachers?.bullets || DEFAULT_HOMEPAGE_CONFIG.forTeachers.bullets,
    },
    testimonials: {
      ...DEFAULT_HOMEPAGE_CONFIG.testimonials,
      ...(partial.testimonials || {}),
      items: partial.testimonials?.items || DEFAULT_HOMEPAGE_CONFIG.testimonials.items,
    },
    pricing: {
      ...DEFAULT_HOMEPAGE_CONFIG.pricing,
      ...(partial.pricing || {}),
      freeBullets: partial.pricing?.freeBullets || DEFAULT_HOMEPAGE_CONFIG.pricing.freeBullets,
      proBullets: partial.pricing?.proBullets || DEFAULT_HOMEPAGE_CONFIG.pricing.proBullets,
    },
    faq: {
      ...DEFAULT_HOMEPAGE_CONFIG.faq,
      ...(partial.faq || {}),
      items: partial.faq?.items || DEFAULT_HOMEPAGE_CONFIG.faq.items,
    },
    ctaBanner: {
      ...DEFAULT_HOMEPAGE_CONFIG.ctaBanner,
      ...(partial.ctaBanner || {}),
    },
    footer: {
      ...DEFAULT_HOMEPAGE_CONFIG.footer,
      ...(partial.footer || {}),
    },
  };
}
