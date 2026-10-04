import { formatDateBR } from "./age";
import { PROMETRIC_PROMPT_VERSION } from "@/lib/ai/prometric-system-prompt";
import {
  type EvalLike,
} from "@/lib/student-metrics";
import {
  type PMCategory,
} from "@/lib/prometric-method";
import { TEST_META, type ClassificationKey, type Zone } from "@/lib/proesp";
import {
  buildStudentConsolidatedPackage,
  type StudentConsolidatedPackage,
} from "./indicator-results";

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

  const pkg = buildStudentConsolidatedPackage(
    { id: student.id, fullName: student.full_name, sex: student.sex, birthDate: student.birth_date },
    evals,
  );

  const isFem = pkg.student.sex === "female";
  const art = isFem ? "A aluna" : "O aluno";
  const pron = isFem ? "ela" : "ele";

  const totalRegistered = pkg.counts.totalRegistered;
  const classifiedCount = pkg.counts.classified;
  const partialCount = pkg.counts.partial;

  const firstDate = pkg.evolution.firstRecord
    ? formatDateBR(pkg.evolution.firstRecord.evaluated_at)
    : "";
  const lastDate = pkg.evolution.currentEvaluation
    ? formatDateBR(pkg.evolution.currentEvaluation.evaluated_at)
    : "";

  const currentAge = pkg.student.age.years;
  const overallCategory = pkg.index.category ?? "Em Desenvolvimento";

  // Dimensões do ProMetric
  const dims = pkg.dimensions;
  const strongDims = dims.filter((d) => d.category === "Excelente" || d.category === "Bom");
  const attentionDims = dims.filter(
    (d) => d.category === "Prioritário" || d.category === "Atenção" || d.category === "Em Desenvolvimento"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // 1. RESUMO GERAL
  // ───────────────────────────────────────────────────────────────────────────
  const antropoParts: string[] = [];
  const imcInd = pkg.indicators.imc;
  const rceInd = pkg.indicators.rce;
  const currEval = pkg.evolution.currentEvaluation as StudentEvalData | null;
  const heightVal = currEval?.height_cm;
  const weightVal = currEval?.weight_kg;

  if (heightVal) antropoParts.push(`estatura de ${heightVal} cm`);
  if (weightVal) antropoParts.push(`peso corporal de ${weightVal} kg`);
  if (imcInd.hasData && imcInd.value != null) {
    antropoParts.push(`IMC de ${imcInd.value.toFixed(1)} kg/m² (${imcInd.clinicalLabel} — OMS 2007)`);
  }
  if (rceInd.hasData && rceInd.value != null) {
    antropoParts.push(`RCE de ${rceInd.value.toFixed(2)}${rceInd.category ? ` (${rceInd.category})` : ""}`);
  }

  const dimHighlights: string[] = [];
  if (strongDims.length > 0) {
    dimHighlights.push(`pontos de destaque nas dimensões ${strongDims.map((d) => `'${d.dimension}'`).join(", ")}`);
  }
  if (attentionDims.length > 0) {
    dimHighlights.push(`oportunidades de desenvolvimento nas dimensões ${attentionDims.map((d) => `'${d.dimension}'`).join(", ")}`);
  }

  const resumo_geral = [
    `${art} ${pkg.student.fullName}, ${currentAge ? `${currentAge} anos, ` : ""}possui um histórico de ${totalRegistered} avaliação(ões) física(s) registrada(s) no sistema ProMetric® (${classifiedCount} classificadas e ${partialCount} parciais), compreendendo o período de ${firstDate}${totalRegistered > 1 ? ` a ${lastDate}` : ""}.`,
    `Seu Índice ProMetric® consolidado é de ${pkg.index.score}/100 pontos, situando seu perfil geral de aptidão física na categoria '${overallCategory}'.`,
    antropoParts.length > 0
      ? `Na dimensão de Saúde Corporal mais recente, apresenta ${antropoParts.join(", ")}.`
      : "",
    dimHighlights.length > 0
      ? `A análise multidimensional das valências motoras identifica ${dimHighlights.join(", com ")}.`
      : `O perfil motor consolidado apresenta equilíbrio geral entre as valências avaliadas.`,
    pkg.disclaimers.missingDimensionWarning ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  // ───────────────────────────────────────────────────────────────────────────
  // 2. EVOLUÇÃO
  // ───────────────────────────────────────────────────────────────────────────
  let evolucao = "";
  if (totalRegistered === 1) {
    evolucao = `Esta é a avaliação diagnóstica inicial (linha de base) de ${pkg.student.fullName}, realizada em ${lastDate}. Como há um registro único até o momento, os resultados atuais servem como referência normativa oficial do aluno no Método ProMetric®. As próximas reavaliações permitirão acompanhar com precisão a taxa de evolução temporal, o progresso neuromuscular e as adaptações morfofuncionais.`;
  } else {
    const firstEval = pkg.evolution.firstClassified ?? pkg.evolution.firstRecord;
    const lastEval = pkg.evolution.currentEvaluation;
    const deltaIndex = pkg.evolution.deltaScore;
    const baseScore = pkg.evolution.baseScore;
    const currScore = pkg.evolution.currentScore;

    let indexDirection = "";
    if (deltaIndex != null && baseScore != null) {
      if (deltaIndex > 0) {
        indexDirection = `um ganho acumulado de +${deltaIndex} pontos no Índice ProMetric® (de ${baseScore} para ${currScore} pontos)`;
      } else if (deltaIndex < 0) {
        indexDirection = `uma variação de ${deltaIndex} pontos no Índice ProMetric® (de ${baseScore} para ${currScore} pontos)`;
      } else {
        indexDirection = `a manutenção estável do Índice ProMetric® em ${currScore} pontos`;
      }
    } else {
      indexDirection = `evolução consistente com Índice ProMetric® atual de ${currScore} pontos`;
    }

    const testChanges: string[] = [];
    if (firstEval && lastEval) {
      const higherTests = [
        { field: "horizontal_jump_cm", name: "Salto Horizontal", unit: "cm" },
        { field: "medicine_ball_m", name: "Arremesso de Medicine Ball", unit: "m" },
        { field: "abdominal_reps", name: "Resistência Abdominal", unit: "reps" },
        { field: "sit_and_reach_cm", name: "Flexibilidade", unit: "cm" },
        { field: "run_6min_m", name: "Corrida de 6 Minutos", unit: "m" },
      ] as const;

      for (const t of higherTests) {
        const v1 = (firstEval as any)[t.field] as number | null | undefined;
        const v2 = (lastEval as any)[t.field] as number | null | undefined;
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

      const lowerTests = [
        { field: "sprint_20m_s", name: "Velocidade 20m" },
        { field: "square_test_s", name: "Agilidade (Quadrado)" },
      ] as const;

      for (const t of lowerTests) {
        const v1 = (firstEval as any)[t.field] as number | null | undefined;
        const v2 = (lastEval as any)[t.field] as number | null | undefined;
        if (v1 != null && v2 != null) {
          const diff = +(v1 - v2).toFixed(2);
          if (diff > 0) {
            testChanges.push(`${t.name} evoluiu sendo ${diff}s mais veloz (${v1}s para ${v2}s)`);
          } else if (diff < 0) {
            testChanges.push(`${t.name} variou de ${v1}s para ${v2}s (+${Math.abs(diff)}s)`);
          } else {
            testChanges.push(`${t.name} manteve estabilidade em ${v2}s`);
          }
        }
      }

      const h1 = Number(firstEval.height_cm);
      const h2 = Number(lastEval.height_cm);
      if (!isNaN(h1) && !isNaN(h2) && h1 > 0 && h2 > 0 && h2 !== h1) {
        const hDiff = +(h2 - h1).toFixed(1);
        testChanges.unshift(`crescimento estatural de +${hDiff} cm (${h1} cm → ${h2} cm)`);
      }
    }

    evolucao = [
      `Ao longo do intervalo avaliativo entre ${firstDate} e ${lastDate} (${totalRegistered} sessões registradas, sendo ${classifiedCount} classificadas), ${art.toLowerCase()} demonstrou ${indexDirection}.`,
      testChanges.length > 0
        ? `Entre os testes motores executados no período, observa-se: ${testChanges.join("; ")}.`
        : "Os parâmetros motores mantiveram consistência e estabilidade em todas as baterias realizadas.",
      "Essa evolução confirma adaptações biológicas positivas e a importância da constância nas atividades corporais.",
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
    zone: Zone | null;
    category: PMCategory | null;
    meaningGood: string;
    meaningWarn: string;
    rec: string;
  }[] = [
    {
      key: "jump",
      name: "Potência de Membros Inferiores (Salto Horizontal)",
      unit: "cm",
      val: pkg.indicators.jump.value,
      zone: pkg.indicators.jump.zone,
      category: pkg.indicators.jump.category,
      meaningGood: "excelente capacidade de impulsão e força explosiva dos membros inferiores",
      meaningWarn: "déficit na potência muscular e capacidade de impulsão",
      rec: "Incluir exercícios lúdicos de saltos bipodais e unipodais, aterrissagens controladas e circuitos com pequenos obstáculos.",
    },
    {
      key: "mball",
      name: "Força Explosiva de Membros Superiores (Medicine Ball)",
      unit: "m",
      val: pkg.indicators.mball.value,
      zone: pkg.indicators.mball.zone,
      category: pkg.indicators.mball.category,
      meaningGood: "excelente recrutamento neuromuscular e transferência de força da cintura escapular",
      meaningWarn: "necessidade de fortalecimento da musculatura escapular e de membros superiores",
      rec: "Adicionar brincadeiras de arremessos com implementos leves, empurrar/puxar e apoios adaptados no solo.",
    },
    {
      key: "abdo",
      name: "Resistência Muscular Localizada (Abdominal 1min)",
      unit: "reps",
      val: pkg.indicators.abdo.value,
      zone: pkg.indicators.abdo.zone,
      category: pkg.indicators.abdo.category,
      meaningGood: "estabilidade central (core) consistente e boa resistência muscular do abdômen",
      meaningWarn: "fadiga precoce da musculatura estabilizadora do tronco (core)",
      rec: "Praticar exercícios de estabilização do core em pranchas isométricas adequadas à idade e variações dinâmicas seguras.",
    },
    {
      key: "flex",
      name: "Mobilidade e Flexibilidade (Sentar e Alcançar)",
      unit: "cm",
      val: pkg.indicators.flex.value,
      zone: pkg.indicators.flex.zone,
      category: pkg.indicators.flex.category,
      meaningGood: "excelente amplitude articular e flexibilidade da cadeia muscular posterior",
      meaningWarn: "encurtamento e rigidez da cadeia posterior (isquiotibiais e paravertebrais)",
      rec: "Implementar rotinas de alongamento estático e dinâmico de 5 a 10 minutos após as aulas, com foco em membros inferiores.",
    },
    {
      key: "sprint",
      name: "Velocidade de Deslocamento (Corrida 20m)",
      unit: "s",
      val: pkg.indicators.sprint.value,
      zone: pkg.indicators.sprint.zone,
      category: pkg.indicators.sprint.category,
      meaningGood: "ótima aceleração inicial e velocidade de reação motora",
      meaningWarn: "tempo de reação e capacidade de aceleração abaixo do referencial normativo",
      rec: "Propor jogos de perseguição (pega-pega estruturado) e estafetas curtas com largadas variadas.",
    },
    {
      key: "square",
      name: "Agilidade e Coordenação (Teste do Quadrado)",
      unit: "s",
      val: pkg.indicators.square.value,
      zone: pkg.indicators.square.zone,
      category: pkg.indicators.square.category,
      meaningGood: "agilidade apurada nas frenagens e mudanças rápidas de direção",
      meaningWarn: "dificuldade de controle corporal e desaceleração rápida nas trocas de sentido",
      rec: "Utilizar escadas de agilidade, circuitos em zigue-zague e jogos com comandos visuais e sonoros.",
    },
    {
      key: "run6",
      name: "Aptidão Cardiorrespiratória (Corrida 6min)",
      unit: "m",
      val: pkg.indicators.run6.value,
      zone: pkg.indicators.run6.zone,
      category: pkg.indicators.run6.category,
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

  // Verifica IMC se estiver eutrófico/saudável
  if (imcInd.hasData && imcInd.value != null && imcInd.clinicalStatus === "adequate") {
    pontos_fortes.push(
      `Composição Corporal (IMC ${imcInd.value.toFixed(1)} kg/m² — ${imcInd.clinicalLabel}): Nível de massa corporal saudável e adequado para a faixa etária segundo os parâmetros da OMS 2007.`
    );
  }

  // Se nenhum teste atingiu Bom/Excelente, destaca os melhores desempenhos relativos
  if (pontos_fortes.length === 0) {
    pontos_fortes.push(
      `Adesão e Engajamento nas Avaliações: Participação ativa em ${totalRegistered} bateria(s) de testes do ProMetric®, demonstrando comprometimento com a rotina de avaliação física.`
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

  // Alerta antropométrico se houver desvio de eutrofia
  if (imcInd.hasData && imcInd.value != null) {
    if (imcInd.clinicalStatus === "attention" || imcInd.clinicalStatus === "critical") {
      pontos_atencao.push(
        `Composição Corporal (IMC ${imcInd.value.toFixed(1)} kg/m² — ${imcInd.clinicalLabel}): Parâmetro OMS 2007 em faixa que demanda acompanhamento preventivo contínuo e incentivo ativo a práticas corporais saudáveis.`
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

  if (imcInd.hasData && imcInd.value != null) {
    if (imcInd.clinicalStatus === "attention" || imcInd.clinicalStatus === "critical") {
      recomendacoes.push(
        "Incentivar a ampliação do tempo diário em atividades físicas recreativas ativas (mínimo de 60 minutos diários) e redução do tempo sedentário de tela, em cooperação com a família."
      );
    }
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
      ? `um nível consistente e satisfatório de aptidão física geral (Índice ProMetric® de ${pkg.index.score}/100)`
      : `um perfil de desenvolvimento em construção, com Índice ProMetric® consolidado de ${pkg.index.score}/100`;

  const conclusao = `${art} ${student.full_name} apresenta ${statusGeralTexto}. Os registros cronológicos armazenados no Método ProMetric® fornecem à coordenação pedagógica, aos professores e aos responsáveis subsídios objetivos para orientar as práticas de Educação Física de forma segura, motivadora e personalizada. A implementação contínua das orientações pedagógicas aqui estabelecidas promoverá tanto a consolidação dos pontos fortes quanto a superação das valências em desenvolvimento, contribuindo de forma decisiva para a saúde integral e o bem-estar do aluno.\n\nNota técnica: ${pkg.disclaimers.imc}`;

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
