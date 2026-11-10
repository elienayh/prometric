# Baterias de Testes Multiaula no Modo Quadra

Sistema de consolidação automática e gestão de baterias avaliativas para o ProMetric, permitindo que testes aplicados ao longo de várias aulas ou dias distintos componham um único conjunto integrado de avaliação por aluno, com distinção visual de pendências e controle explícito de novos ciclos avaliativos.

## Revisão do Usuário e Decisões Confirmadas

> [!IMPORTANT]
> Decisões arquiteturais e de experiência confirmadas na Fase 1 de alinhamento:
>
> - **Agrupamento por Janela Recente**: Testes lançados em dias diferentes dentro da mesma janela avaliativa ativa (ex.: até 30 dias a partir da data de início da bateria da turma) são unificados e consolidados na mesma avaliação do aluno, evitando fragmentação em múltiplos testes parciais soltos.
> - **Distinção Visual Limpa**: Identificação de testes completos e parciais via tags discretas de texto com contadores (`8/11 testes`) e filtros segmentados de navegação (`Todos`, `Pendentes`, `Completos`), sem poluição visual ou badges pesadas (seguindo as diretrizes anti-slop).
> - **Controle de Ciclos / Nova Bateria**: Cabeçalho do Modo Quadra com seletor da bateria ativa e botão dedicado **"+ Nova Bateria de Testes"**, permitindo ao professor iniciar um novo período (ex.: 2º Bimestre / Novo Semestre) ou continuar completando a bateria em andamento.

---

## 1. Visão Geral e Conceito Central

### O que resolve
Na rotina escolar real, a aplicação de 11 testes motores e antropométricos raramente ocorre em um único dia. O professor leva de 2 a 3 aulas com a turma na quadra, e alunos ausentes realizam testes pendentes em datas posteriores.
Atualmente, o sistema vinculava estritamente cada lançamento à data civil do dia (`evaluated_at = date`), gerando múltiplas linhas fragmentadas no banco (ex.: uma linha só com Peso e Altura na segunda-feira, e outra só com Corrida na sexta-feira), que o sistema classificava isoladamente como "testes parciais".

### A Solução
1. **Bateria Avaliativa Unificada**: O Modo Quadra passa a operar por **Ciclo/Bateria Avaliativa da Turma**. Quando o professor abre a turma no Modo Quadra, o sistema reconhece a bateria aberta mais recente (ou a selecionada).
2. **Consolidação Automática (Merge Inteligente)**: Ao lançar qualquer teste para um aluno (no Modo Estação, Por Aluno ou Planilha), o sistema busca a avaliação existente daquela bateria e complementa os campos sem sobrescrever os testes já realizados em aulas anteriores.
3. **Classificação ProESP Integral**: Conforme os testes pendentes são preenchidos ao longo das aulas, o sistema recalcula progressivamente o IMC, a RCE e a bateria completa de percentis e diagnósticos no mesmo registro.
4. **Relatórios e PDFs Prontos**: Ao final das 3 aulas, o aluno passa automaticamente de `Testes parciais` para `Pronto para PDF`, permitindo a emissão imediata do relatório consolidado e envio por e-mail.

---

## 2. Experiência do Usuário e Design Visual (UX & UI)

Seguindo as diretrizes de design para dashboards analíticos e ferramentas de planilha (`references/3_saas_dashboard.md`), a interface evita distrações e foca na velocidade em quadra (mobile e tablet).

### A. Cabeçalho de Controle de Bateria (Modo Quadra)
Posicionado logo acima das abas (Estação, Por Aluno, Planilha):
- **Identificador do Ciclo Ativo**: Exibe o ciclo atual (ex.: `Bateria Ativa: 2º Semestre (Iniciada em 14/10/2026) · 14 de 17 alunos completos`).
- **Botão "+ Nova Bateria"**: Abre um diálogo rápido de confirmação caso o professor queira arquivar o ciclo atual e iniciar uma nova rodada do zero (para avaliações diagnósticas comparativas no futuro).
- **Seletor de Baterias Anteriores**: Dropdown compacto para consultar ou revisar baterias históricas da turma.

### B. Barra de Filtro e Indicadores de Progresso
Acima das listas de alunos (no Modo Estação, Por Aluno e Planilha):
- **Segmented Control de Status**:
  ```
  [ Todos (17) ]   [ Pendentes (3) ]   [ Completos (14) ]
  ```
  Permite ao professor focar instantaneamente nos alunos que faltaram ou deixaram testes para trás na aula anterior.
- **Tag Discreta de Status**:
  Ao lado do nome do aluno:
  - *Completo*: Texto sutil `11/11 testes · Concluído` com ícone verde discreto.
  - *Parcial*: Texto de aviso neutro `8/11 testes · Faltam: Corrida 6min, Salto` (clicável para focar direto no teste pendente).

### C. Comportamento no Modo Planilha
- As notas lançadas em aulas anteriores continuam visíveis nas células, preservando os valores já digitados.
- As células sem notas aparecem vazias com destaque de foco ao navegar com `Tab` ou `Enter`.
- O professor pode digitar apenas a coluna da aula de hoje (ex.: sentar e alcançar) e o salvamento em lote preserva intactos os dados das aulas passadas.

### D. Comportamento no Modo Por Aluno
- O modal e os cards mostram uma lista de checklist dos 11 testes, com marcadores claros dos já realizados e dos pendentes.
- O botão principal exibe `"Completar avaliação da bateria"` quando já existem testes prévios, ou `"Salvar e próximo"`.

---

## 3. Decisões de Produto e Trade-Offs

### Decisão 1: Identificador de Ciclo / Bateria no Modelo de Dados
- **Abordagem Escolhida**: Adicionar suporte a `battery_id` (ou identificador de ciclo/período na tabela `evaluations`), mantendo fallback automático para a janela de 30 dias da turma caso a bateria não esteja explicitamente nomeada.
- **Vantagem**: Compatibilidade total com as avaliações já gravadas no banco e flexibilidade: não quebra nenhum gráfico histórico de evolução do aluno e resolve de imediato a fragmentação das aulas.
- **Alternativa Descartada**: Criar tabelas separadas para cada teste individual. Descartada por adicionar complexidade desnecessária de joins e inviabilizar a chave rápida de `upsert`.

### Decisão 2: Data de Registro (`evaluated_at`) vs Data de Cada Teste
- **Abordagem Escolhida**:
  - `evaluated_at` representa a **data de referência da bateria** (normalmente o dia da 1ª aula daquela rodada).
  - No campo JSONB `classifications` ou em metadados da avaliação, armazenar o carimbo individual dos testes quando realizados em dias diferentes (`test_timestamps: { "sit_and_reach_cm": "2026-10-14", "run_6min_m": "2026-10-18" }`).
- **Vantagem**: A tabela de avaliações mantém a integridade do índice único `(student_id, evaluated_at)` e garante que relatórios de progresso anual/semestral mostrem uma única barra temporal coesa.

---

## 4. Arquitetura Técnica e Fluxo de Dados

### Diagrama do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MODO QUADRA (UI)                                │
│                                                                             │
│  [Turma: 8º Ano 2] ──── [Bateria Ativa: Out/2026] ──── [+ Nova Bateria]     │
│  Filtros: [Todos (17)] | [Pendentes (3)] | [Completos (14)]                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
     ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
     │ Modo Estação │           │  Por Aluno   │           │   Planilha   │
     │ (Foco Teste) │           │ (Checklist)  │           │   (Matriz)   │
     └──────┬───────┘           └──────┬───────┘           └──────┬───────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │     Hook: useActiveBatteryEvals   │
                     │  - Busca avaliação ativa da turma │
                     │  - Combina testes de dias prévios │
                     │  - Calcula pendências (X/11)      │
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │      buildEvaluationPayload       │
                     │  - Merge de valores existentes    │
                     │  - Preserva testes de outras aulas│
                     │  - Recalcula IMC, RCE e ProESP    │
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │       PostgreSQL (Supabase)       │
                     │  Tabela: public.evaluations       │
                     │  - UPSERT na avaliação da bateria │
                     │  - Registro único consolidado     │
                     └───────────────────────────────────┘
```

### Etapas de Implementação

1. **Gestão de Baterias e Janela Temporal (`src/hooks/use-active-battery.ts`)**:
   - Criação de hook para determinar a bateria ativa da turma (busca a data da avaliação mais recente da turma ou ID de ciclo).
   - Função utilitária para detectar testes pendentes por aluno (retornando lista de quais dos 11 testes faltam).

2. **Atualização do `useTodayEvaluations` para `useBatteryEvaluations`**:
   - No `quick-eval.tsx`, substituir a query restrita por dia civil por uma query que busca a avaliação correspondente ao ciclo ativo.
   - Garantir que `StationMode`, `QuadraFlow` e `SpreadsheetMode` carreguem todos os dados prévios já digitados nas aulas anteriores daquela bateria.

3. **Interface e Filtros de Pendências**:
   - Inclusão do seletor de ciclo e botão "+ Nova Bateria" no cabeçalho do Modo Quadra.
   - Adição do controle de abas de filtro (`Todos`, `Pendentes`, `Completos`) no topo dos modos.
   - Exibição de tag discreta de status ao lado de cada aluno indicando testes faltantes.

4. **Preservação e Recálculo no Salvamento**:
   - Ao salvar um teste no dia atual, o payload realiza o merge com a avaliação do ciclo ativo, mantendo a consistência do registro único.
   - O status do aluno é atualizado em tempo real para `Pronto para PDF` assim que o último teste pendente for preenchido.
