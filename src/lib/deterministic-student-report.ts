import { PROMETRIC_PROMPT_VERSION } from "@/lib/ai/prometric-system-prompt";
import {
  consolidatedClassifications,
  currentIndex,
  chronological,
  type EvalLike,
} from "@/lib/student-metrics";
import {
  zoneToCategory,
  PM_DIMENSIONS,
  type PMCategory,
} from "@/lib/prometric-method";
import { TEST_META, type ClassificationKey, type Zone } from "@/lib/proesp";

export type StudentReportData = {
  id?: string;
  tenant_id?: string;
  full_name: string;
  sex?: string | null;
  birth_date?: string | null;
};

export type StudentEvalData = EvalLike & {
  id?: string;
  evaluated_at: string;
  age_years?: number | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  imc?: number | null;
  rce?: number | null;
  sit_and_reach_cm?: number | null;
  abdominal_reps?: number | null;
  horizontal_jump_cm?: number | null;
  medicine_ball_m?: number | null;
  square_test_s?: number | null;
  sprint_20m_s?: number | null;
  run_6min_m?: number | null;
  classifications?: Record<string, Zone> | null;
};

export type StudentReportResult = {
  resumo_geral: string;
  evolucao: string;
  pontos_fortes: string[];
  pontos_atencao: string[];
  recomendacoes: string[];
  conclusao: string;
  provider: string;
  source: string;
  promptVersion: string;
  generatedAt: string;
};

/**
 * Constrói o relatório individual completo de forma determinística,
 * utilizando exclusivamente a metodologia, fórmulas e classificações oficiais
 * do ProMetric® já calculadas.
 * 
 * Funciona em qualquer ambiente (navegador, Node, Cloudflare Workers/Pages)
 * sem depender de chaves de API, cotas externas ou tokens de terceiros.
 */
export function buildDeterministicStudentReport(
  student: StudentReportData,
  evals: StudentEvalData[]
): StudentReportResult {
  if (!evals || evals.length === 0) {
    throw new Error("Nenhuma avaliação registrada para este aluno.");
  }

  const ordered = chronological(evals) as StudentEvalData[];
  const firstEval = ordered[0];
  const lastEval = ordered[ordered.length - 1];

  const isFem = student.sex === "female";
  const art = isFem ? "A aluna" : "O aluno";
  const pron = isFem ? "ela" : "ele";

  const totalEvals = ordered.length;
  const firstDate = new Date(firstEval.evaluated_at).toLocaleDateString("pt-BR");
  const lastDate = new Date(lastEval.evaluated_at).toLocaleDateString("pt-BR");

  // Idade atual ou na última avaliação
  const currentAge = lastEval.age_years ?? (() => {
    if (!student.birth_date) return null;
    const b = new Date(student.birth_date);
    const d = new Date(lastEval.evaluated_at).getTime() - b.getTime();
    return Math.max(0, Math.floor(d / (365.25 * 24 * 3600 * 1000)));
  })();

  // Classificações consolidadas e Índice ProMetric atual
  const consolidated = consolidatedClassifications(ordered);
  const index = currentIndex(ordered);
  const overallCategory = index.category ?? "Em Desenvolvimento";

  // Dimensões do ProMetric
  const dims = index.dimensions;
  const strongDims = dims.filter((d) => d.category === "Excelente" || d.category === "Bom");
  const attentionDims = dims.filter(
    (d) => d.category === "Prioritário" || d.category === "Atenção" || d.category === "Em Desenvolvimento"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // 1. RESUMO GERAL
  // ───────────────────────────────────────────────────────────────────────────
  const antropoParts: string[] = [];
  if (lastEval.height_cm) antropoParts.push(`estatura de ${lastEval.height_cm} cm`);
  if (lastEval.weight_kg) antropoParts.push(`peso corporal de ${lastEval.weight_kg} kg`);
  if (lastEval.imc) {
    const imcCat = zoneToCategory(consolidated.imc);
    antropoParts.push(`IMC de ${lastEval.imc.toFixed(1)} kg/m²${imcCat ? ` (${imcCat})` : ""}`);
  }
  if (lastEval.rce) {
    const rceCat = zoneToCategory(consolidated.rce);
    antropoParts.push(`RCE de ${lastEval.rce.toFixed(2)}${rceCat ? ` (${rceCat})` : ""}`);
  }

  const dimHighlights: string[] = [];
  if (strongDims.length > 0) {
    dimHighlights.push(`pontos de destaque nas dimensões ${strongDims.map((d) => `'${d.dimension}'`).join(", ")}`);
  }
  if (attentionDims.length > 0) {
    dimHighlights.push(`oportunidades de desenvolvimento nas dimensões ${attentionDims.map((d) => `'${d.dimension}'`).join(", ")}`);
  }

  const resumo_geral = [
    `${art} ${student.full_name}, ${currentAge ? `${currentAge} anos, ` : ""}possui um histórico de ${totalEvals} avaliação(ões) física(s) registrada(s) no sistema ProMetric®, compreendendo o período de ${firstDate}${totalEvals > 1 ? ` a ${lastDate}` : ""}.`,
    `Seu Índice ProMetric® consolidado é de ${index.score}/100 pontos, situando seu perfil geral de aptidão física na categoria '${overallCategory}'.`,
    antropoParts.length > 0
      ? `Na dimensão de Saúde Corporal mais recente, apresenta ${antropoParts.join(", ")}.`
      : "",
    dimHighlights.length > 0
      ? `A análise multidimensional das valências motoras identifica ${dimHighlights.join(", com ")}.`
      : `O perfil motor consolidado apresenta equilíbrio geral entre as valências avaliadas.`,
  ]
    .filter(Boolean)
    .join(" ");

  // ───────────────────────────────────────────────────────────────────────────
  // 2. EVOLUÇÃO
  // ───────────────────────────────────────────────────────────────────────────
  let evolucao = "";
  if (totalEvals === 1) {
    evolucao = `Esta é a avaliação diagnóstica inicial (linha de base) de ${student.full_name}, realizada em ${lastDate}. Como há um registro único até o momento, os resultados atuais servem como referência normativa oficial do aluno no Método ProMetric®. As próximas reavaliações permitirão acompanhar com precisão a taxa de evolução temporal, o progresso neuromuscular e as adaptações morfofuncionais.`;
  } else {
    const firstIndex = currentIndex([firstEval]);
    const deltaIndex = index.score - firstIndex.score;
    const indexDirection =
      deltaIndex > 0
        ? `um ganho acumulado de +${deltaIndex} pontos no Índice ProMetric® (de ${firstIndex.score} para ${index.score} pontos)`
        : deltaIndex < 0
        ? `uma variação de ${deltaIndex} pontos no Índice ProMetric® (de ${firstIndex.score} para ${index.score} pontos)`
        : `a manutenção estável do Índice ProMetric® em ${index.score} pontos`;

    const testChanges: string[] = [];

    // Comparações específicas onde maior é melhor
    const higherTests: { field: keyof StudentEvalData; name: string; unit: string }[] = [
      { field: "horizontal_jump_cm", name: "Salto Horizontal", unit: "cm" },
      { field: "medicine_ball_m", name: "Arremesso de Medicine Ball", unit: "m" },
      { field: "abdominal_reps", name: "Resistência Abdominal", unit: "reps" },
      { field: "sit_and_reach_cm", name: "Flexibilidade", unit: "cm" },
      { field: "run_6min_m", name: "Corrida de 6 Minutos", unit: "m" },
    ];

    for (const t of higherTests) {
      const v1 = firstEval[t.field] as number | null | undefined;
      const v2 = lastEval[t.field] as number | null | undefined;
      if (v1 != null && v2 != null) {
        const diff = +(v2 - v1).toFixed(2);
        if (diff > 0) {
          testChanges.push(`${t.name} evoluiu de ${v1} para ${v2} ${t.unit} (+${diff} ${t.unit})`);
        } else if (diff < 0) {
          testChanges.push(`${t.name} variou de ${v1} para ${v2} ${t.unit} (${diff} ${t.unit})`);
        } else {
          testChanges.push(`${t.name} manteve-se em ${v2} ${t.unit}`);
        }
      }
    }

    // Comparações onde menor é melhor (velocidade e agilidade)
    const lowerTests: { field: keyof StudentEvalData; name: string; unit: string }[] = [
      { field: "sprint_20m_s", name: "Velocidade (20m)", unit: "s" },
      { field: "square_test_s", name: "Agilidade (Quadrado)", unit: "s" },
    ];

    for (const t of lowerTests) {
      const v1 = firstEval[t.field] as number | null | undefined;
      const v2 = lastEval[t.field] as number | null | undefined;
      if (v1 != null && v2 != null) {
        const diff = +(v2 - v1).toFixed(2);
        if (diff < 0) {
          testChanges.push(`${t.name} melhorou o tempo de ${v1}s para ${v2}s (${diff}s mais veloz)`);
        } else if (diff > 0) {
          testChanges.push(`${t.name} registrou ${v1}s inicialmente e ${v2}s atualmente (+${diff}s)`);
        } else {
          testChanges.push(`${t.name} manteve estabilidade em ${v2}s`);
        }
      }
    }

    // Crescimento em estatura
    if (firstEval.height_cm != null && lastEval.height_cm != null && lastEval.height_cm !== firstEval.height_cm) {
      const hDiff = +(lastEval.height_cm - firstEval.height_cm).toFixed(1);
      testChanges.unshift(`crescimento estatural de +${hDiff} cm (${firstEval.height_cm} cm → ${lastEval.height_cm} cm)`);
    }

    evolucao = [
      `Ao longo do intervalo avaliativo entre ${firstDate} e ${lastDate} (${totalEvals} sessões de avaliação), ${art.toLowerCase()} demonstrou ${indexDirection}.`,
      testChanges.length > 0
        ? `Entre os testes motores executados no período, observa-se: ${testChanges.join("; ")}.`
        : "Os parâmetros motores mantiveram consistência ao longo das baterias de testes realizadas.",
      deltaIndex >= 0
        ? `A trajetória evolutiva reflete adaptação positiva aos estímulos motores e às práticas corporais propostas.`
        : `A flutuação nos indicadores sugere a necessidade de reforçar a regularidade dos estímulos nas valências em declínio.`,
    ].join(" ");
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. PONTOS FORTES
  // ───────────────────────────────────────────────────────────────────────────
  const pontos_fortes: string[] = [];

  // Mapeia testes com classificações e valores consolidados
  const testItems: {
    key: ClassificationKey;
    name: string;
    unit: string;
    val: number | null | undefined;
    zone: Zone | undefined;
    category: PMCategory | null;
    meaningGood: string;
    meaningWarn: string;
    rec: string;
  }[] = [
    {
      key: "jump",
      name: "Potência de Membros Inferiores (Salto Horizontal)",
      unit: "cm",
      val: lastEval.horizontal_jump_cm,
      zone: consolidated.jump,
      category: zoneToCategory(consolidated.jump),
      meaningGood: "excelente capacidade de impulsão e força explosiva dos membros inferiores",
      meaningWarn: "déficit na potência muscular e capacidade de impulsão",
      rec: "Incluir exercícios lúdicos de saltos bipodais e unipodais, aterrissagens controladas e circuitos com pequenos obstáculos.",
    },
    {
      key: "mball",
      name: "Força Explosiva de Membros Superiores (Medicine Ball)",
      unit: "m",
      val: lastEval.medicine_ball_m,
      zone: consolidated.mball,
      category: zoneToCategory(consolidated.mball),
      meaningGood: "ótimo recrutamento neuromuscular e transferência de força da cintura escapular",
      meaningWarn: "necessidade de fortalecimento da musculatura escapular e de membros superiores",
      rec: "Adicionar brincadeiras de arremessos com implementos leves, empurrar/puxar e apoios adaptados no solo.",
    },
    {
      key: "abdo",
      name: "Resistência Muscular Localizada (Abdominal 1min)",
      unit: "reps",
      val: lastEval.abdominal_reps,
      zone: consolidated.abdo,
      category: zoneToCategory(consolidated.abdo),
      meaningGood: "estabilidade central (core) consistente e boa resistência muscular do abdômen",
      meaningWarn: "fadiga precoce da musculatura estabilizadora do tronco (core)",
      rec: "Praticar exercícios de estabilização do core em pranchas isométricas adequadas à idade e variações dinâmicas seguras.",
    },
    {
      key: "flex",
      name: "Mobilidade e Flexibilidade (Sentar e Alcançar)",
      unit: "cm",
      val: lastEval.sit_and_reach_cm,
      zone: consolidated.flex,
      category: zoneToCategory(consolidated.flex),
      meaningGood: "excelente amplitude articular e flexibilidade da cadeia muscular posterior",
      meaningWarn: "encurtamento e rigidez da cadeia posterior (isquiotibiais e paravertebrais)",
      rec: "Implementar rotinas de alongamento estático e dinâmico de 5 a 10 minutos após as aulas, com foco em membros inferiores.",
    },
    {
      key: "sprint",
      name: "Velocidade de Deslocamento (Corrida 20m)",
      unit: "s",
      val: lastEval.sprint_20m_s,
      zone: consolidated.sprint,
      category: zoneToCategory(consolidated.sprint),
      meaningGood: "ótima aceleração inicial e velocidade de reação motora",
      meaningWarn: "tempo de reação e capacidade de aceleração abaixo do referencial normativo",
      rec: "Propor jogos de perseguição (pega-pega estruturado) e estafetas curtas com largadas variadas.",
    },
    {
      key: "square",
      name: "Agilidade e Coordenação (Teste do Quadrado)",
      unit: "s",
      val: lastEval.square_test_s,
      zone: consolidated.square,
      category: zoneToCategory(consolidated.square),
      meaningGood: "agilidade apurada nas frenagens e mudanças rápidas de direção",
      meaningWarn: "dificuldade de controle corporal e desaceleração rápida nas trocas de sentido",
      rec: "Utilizar escadas de agilidade, circuitos em zigue-zague e jogos com comandos visuais e sonoros.",
    },
    {
      key: "run6",
      name: "Aptidão Cardiorrespiratória (Corrida 6min)",
      unit: "m",
      val: lastEval.run_6min_m,
      zone: consolidated.run6,
      category: zoneToCategory(consolidated.run6),
      meaningGood: "eficiência cardiorrespiratória e resistência aeróbica bem desenvolvida",
      meaningWarn: "resistência aeróbica reduzida, demandando estímulo progressivo",
      rec: "Incentivar atividades contínuas e recreativas com duração sustentada de 10 a 20 minutos (jogos coletivos, corridas intervaladas lúdicas).",
    },
  ];

  // Adiciona pontos fortes baseados em classificações elevadas
  for (const item of testItems) {
    if (item.category === "Excelente" || item.category === "Bom") {
      const valStr = item.val != null ? ` (${item.val} ${item.unit})` : "";
      pontos_fortes.push(
        `${item.name}${valStr}: Classificação ProMetric '${item.category}', demonstrando ${item.meaningGood}.`
      );
    }
  }

  // Verifica IMC se estiver saudável/excelente
  if (lastEval.imc != null) {
    const imcCat = zoneToCategory(consolidated.imc);
    if (imcCat === "Excelente" || imcCat === "Bom") {
      pontos_fortes.push(
        `Composição Corporal (IMC ${lastEval.imc.toFixed(1)} kg/m²): Nível saudável e adequado para o desenvolvimento biológico na faixa etária.`
      );
    }
  }

  // Se nenhum teste atingiu Bom/Excelente, destaca os melhores desempenhos relativos
  if (pontos_fortes.length === 0) {
    pontos_fortes.push(
      `Adesão e Engajamento nas Avaliações: Participação ativa em ${totalEvals} bateria(s) de testes do ProMetric®, demonstrando comprometimento com a rotina de avaliação física.`
    );
    const sortedByScore = [...testItems]
      .filter((t) => t.category !== null)
      .sort((a, b) => (b.category === "Em Desenvolvimento" ? 1 : 0) - (a.category === "Em Desenvolvimento" ? 1 : 0));
    if (sortedByScore[0]) {
      const best = sortedByScore[0];
      const valStr = best.val != null ? ` (${best.val} ${best.unit})` : "";
      pontos_fortes.push(
        `${best.name}${valStr}: Apresenta potencial positivo na categoria '${best.category}', constituindo a principal base para alavancar o restante das capacidades físicas.`
      );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. PONTOS DE ATENÇÃO
  // ───────────────────────────────────────────────────────────────────────────
  const pontos_atencao: string[] = [];

  for (const item of testItems) {
    if (item.category === "Prioritário" || item.category === "Atenção") {
      const valStr = item.val != null ? ` (${item.val} ${item.unit})` : "";
      pontos_atencao.push(
        `${item.name}${valStr}: Classificação ProMetric '${item.category}', indicando ${item.meaningWarn}.`
      );
    }
  }

  // Se não houver itens críticos (Prioritário/Atenção), procura os "Em Desenvolvimento"
  if (pontos_atencao.length === 0) {
    for (const item of testItems) {
      if (item.category === "Em Desenvolvimento") {
        const valStr = item.val != null ? ` (${item.val} ${item.unit})` : "";
        pontos_atencao.push(
          `${item.name}${valStr}: Classificado na faixa 'Em Desenvolvimento', com margem clara para progressão rumo à excelência.`
        );
      }
    }
  }

  // Alerta antropométrico se houver
  if (lastEval.imc != null) {
    const imcCat = zoneToCategory(consolidated.imc);
    if (imcCat === "Prioritário" || imcCat === "Atenção") {
      pontos_atencao.push(
        `Índice de Massa Corporal (IMC ${lastEval.imc.toFixed(1)} kg/m²): Faixa classificada como '${imcCat}', recomendando-se monitoramento preventivo da composição corporal e estímulo a hábitos ativos.`
      );
    }
  }

  // Se tudo for Excelente/Bom
  if (pontos_atencao.length === 0) {
    pontos_atencao.push(
      "Perfil Físico Altamente Equilibrado: Todas as capacidades motoras e antropométricas testadas encontram-se em níveis adequados ou avançados, sem déficits funcionais críticos detectados."
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. RECOMENDAÇÕES PEDAGÓGICAS
  // ───────────────────────────────────────────────────────────────────────────
  const recomendacoes: string[] = [];

  for (const item of testItems) {
    if (
      item.category === "Prioritário" ||
      item.category === "Atenção" ||
      item.category === "Em Desenvolvimento"
    ) {
      if (!recomendacoes.includes(item.rec)) {
        recomendacoes.push(item.rec);
      }
    }
  }

  if (lastEval.imc != null && (zoneToCategory(consolidated.imc) === "Prioritário" || zoneToCategory(consolidated.imc) === "Atenção")) {
    recomendacoes.push(
      "Incentivar a ampliação do tempo diário em atividades físicas recreativas ativas (mínimo de 60 minutos diários) e redução do tempo sedentário de tela, em cooperação com a família."
    );
  }

  if (recomendacoes.length < 3) {
    recomendacoes.push(
      "Manter a diversidade de vivências motoras em esportes coletivos e individuais para preservar o equilíbrio entre força, velocidade e flexibilidade."
    );
    recomendacoes.push(
      "Estimular o protagonismo do aluno em desafios motores progressivos para fortalecer a autoconfiança e a consciência corporal."
    );
  }

  recomendacoes.push(
    "Agendar nova bateria de avaliação física de controle em 90 a 120 dias para mensurar as adaptações orgânicas e o progresso em relação à linha de base atual."
  );

  // ───────────────────────────────────────────────────────────────────────────
  // 6. CONCLUSÃO
  // ───────────────────────────────────────────────────────────────────────────
  const statusGeralTexto =
    overallCategory === "Excelente" || overallCategory === "Bom"
      ? `um nível consistente e satisfatório de aptidão física geral (Índice ProMetric® de ${index.score}/100)`
      : `um perfil de desenvolvimento em construção, com Índice ProMetric® consolidado de ${index.score}/100`;

  const conclusao = `${art} ${student.full_name} apresenta ${statusGeralTexto}. Os registros cronológicos armazenados no Método ProMetric® fornecem à coordenação pedagógica, aos professores e aos responsáveis subsídios objetivos para orientar as práticas de Educação Física de forma segura, motivadora e personalizada. A implementação contínua das orientações pedagógicas aqui estabelecidas promoverá tanto a consolidação dos pontos fortes quanto a superação das valências em desenvolvimento, contribuindo de forma decisiva para a saúde integral e o bem-estar do aluno.`;

  return {
    resumo_geral,
    evolucao,
    pontos_fortes,
    pontos_atencao,
    recomendacoes,
    conclusao,
    provider: "ProMetric® Engine (Sistema Especialista)",
    source: "algoritmo determinístico",
    promptVersion: PROMETRIC_PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
  };
}
