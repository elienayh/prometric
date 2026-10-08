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

export type WhatsAppConfig = {
  enabled: boolean;
  phoneNumber: string;
  defaultMessage: string;
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
    showWhatsapp: boolean;
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
  whatsapp: WhatsAppConfig;
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
    showWhatsapp: false,
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
      "Algoritmo proprietário que normaliza testes antropométricos e motores contra curvas populacionais de referência e da OMS 2007.",
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
          "O rigor com a curva OMS 2007 em meses e as baterias de testes motores é exemplar. É o único software que alia precisão científica com extrema facilidade de uso na quadra.",
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
        a: "É a metodologia proprietária do ProMetric para Avaliação Física Integrada. Combina antropometria, testes motores e cardiorrespiratórios em 5 dimensões (Saúde Corporal, Resistência, Mobilidade, Potência e Velocidade & Agilidade), gerando o Índice ProMetric® de 0 a 100.",
      },
      {
        id: "f2",
        q: "Como funciona o Índice ProMetric®?",
        a: "O Índice ProMetric® é um score de 0 a 100 que sintetiza o desempenho do aluno em 5 dimensões. Os resultados são classificados em 5 categorias: Crítico, Atenção, Em Desenvolvimento, Bom e Excelente — sempre considerando idade e sexo.",
      },
      {
        id: "f3",
        q: "Como realizar uma avaliação física escolar?",
        a: "Cadastre a turma, aplique os testes da Avaliação Física Integrada ProMetric em até duas aulas, registre os resultados pelo celular e o sistema gera o Índice ProMetric® e o relatório individual automaticamente.",
      },
      {
        id: "f4",
        q: "Como calcular o IMC escolar?",
        a: "IMC = peso (kg) ÷ altura² (m). Em escolares, a classificação considera idade e sexo. O ProMetric faz o cálculo e a interpretação automaticamente dentro da dimensão Saúde Corporal.",
      },
      {
        id: "f5",
        q: "Como gerar relatórios de avaliação física?",
        a: "Após registrar as avaliações, basta clicar em Gerar Relatório. O ProMetric monta um PDF profissional individual, por turma ou por escola, em segundos — com o Índice ProMetric® e o Perfil de Desenvolvimento Físico de cada aluno.",
      },
      {
        id: "f6",
        q: "Posso usar o ProMetric em academias?",
        a: "Sim. Personal trainers e academias usam o ProMetric para padronizar avaliações físicas, acompanhar evolução e entregar relatórios profissionais aos alunos.",
      },
      {
        id: "f7",
        q: "Posso usar em clubes esportivos?",
        a: "Sim. Clubes utilizam para triagem de atletas, controle de cargas e relatórios de desempenho por categoria.",
      },
      {
        id: "f8",
        q: "Como funciona a avaliação em lote?",
        a: "O Modo Quadra permite avaliar a turma inteira em sequência, sem retrabalho: digitou, salvou, próximo aluno.",
      },
      {
        id: "f9",
        q: "Como acompanhar a evolução dos alunos?",
        a: "Cada aluno tem histórico cronológico com Radar ProMetric® comparativo, permitindo medir o impacto pedagógico ao longo do ano.",
      },
      {
        id: "f10",
        q: "O sistema funciona pelo celular?",
        a: "Sim. O ProMetric é mobile-first e otimizado para uso na quadra, mesmo em conexões instáveis.",
      },
      {
        id: "f11",
        q: "O sistema gera PDF?",
        a: "Sim. Relatórios individuais, por turma e institucionais em PDF profissional, prontos para enviar à família e à direção.",
      },
      {
        id: "f12",
        q: "O sistema possui inteligência artificial?",
        a: "Sim. A IA gera parecer técnico, mensagem para a família e metas personalizadas de 30/60/90 dias por aluno.",
      },
      {
        id: "f13",
        q: "Como funciona o histórico do aluno?",
        a: "Cada avaliação fica registrada cronologicamente, com Perfil de Desenvolvimento Físico ProMetric em cada momento.",
      },
      {
        id: "f14",
        q: "Posso cadastrar turmas?",
        a: "Sim. Você organiza alunos por turma, série, escola ou clube, com filtros e permissões por professor.",
      },
      {
        id: "f15",
        q: "Existe versão gratuita e como funcionam os planos?",
        a: "Sim. O ProMetric oferece plano Gratuito livre para sempre até 30 alunos/usuários, sem necessidade de cartão de crédito. Para turmas maiores e recursos avançados, o plano Pro oferece alunos ilimitados, relatórios completos e suporte prioritário. A tabela completa de planos está disponível na sua conta.",
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
  whatsapp: {
    enabled: false,
    phoneNumber: "+55 (11) 99999-9999",
    defaultMessage: "Olá! Gostaria de saber mais sobre o ProMetric.",
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
    whatsapp: {
      enabled: partial.whatsapp?.enabled ?? partial.visibility?.showWhatsapp ?? DEFAULT_HOMEPAGE_CONFIG.whatsapp.enabled,
      phoneNumber:
        partial.whatsapp?.phoneNumber ||
        partial.footer?.contactWhatsapp ||
        DEFAULT_HOMEPAGE_CONFIG.whatsapp.phoneNumber,
      defaultMessage:
        partial.whatsapp?.defaultMessage ||
        DEFAULT_HOMEPAGE_CONFIG.whatsapp.defaultMessage,
    },
  };
}
