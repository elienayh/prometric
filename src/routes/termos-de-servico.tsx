import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, AlertTriangle, ShieldCheck, CheckCircle2, ArrowLeft, Mail, Stethoscope, Scale } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useHomePageConfig } from "@/hooks/use-homepage-config";

export const Route = createFileRoute("/termos-de-servico")({
  head: () => ({
    meta: [
      { title: "Termos de Serviço | ProMetric" },
      {
        name: "description",
        content:
          "Termos de Serviço e Condições de Uso da plataforma ProMetric, operada pela MetricBR. Conheça as diretrizes de uso, responsabilidades e papel de apoio à avaliação física.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Termos de Serviço | ProMetric" },
      {
        property: "og:description",
        content:
          "Condições gerais de uso da plataforma ProMetric: responsabilidades, diretrizes pedagógicas e proteção aos usuários.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "canonical",
        href:
          typeof window !== "undefined"
            ? `${window.location.origin}/termos-de-servico`
            : "/termos-de-servico",
      },
    ],
  }),
  component: TermosServicoPage,
});

function TermosServicoPage() {
  const { config } = useHomePageConfig();

  const sections = [
    { id: "aceitacao", title: "1. Aceitação dos Termos" },
    { id: "descricao", title: "2. Descrição do ProMetric" },
    { id: "cadastro", title: "3. Cadastro e Responsabilidade da Conta" },
    { id: "uso-adequado", title: "4. Uso Adequado da Plataforma" },
    { id: "responsabilidade-dados", title: "5. Responsabilidade pelas Informações Inseridas" },
    { id: "escolas-professores", title: "6. Escolas, Gestores e Professores" },
    { id: "dados-alunos", title: "7. Dados de Alunos e Menores" },
    { id: "aviso-medico", title: "8. Não Constitui Diagnóstico Clínico ou Médico" },
    { id: "limitacoes", title: "9. Limitações e Responsabilidades da Plataforma" },
    { id: "propriedade-intelectual", title: "10. Propriedade Intelectual" },
    { id: "disponibilidade", title: "11. Disponibilidade, Manutenção e Atualizações" },
    { id: "suspensao", title: "12. Suspensão ou Encerramento de Contas" },
    { id: "alteracoes", title: "13. Alterações Destes Termos" },
    { id: "legislacao", title: "14. Legislação Aplicável e Foro" },
    { id: "contato", title: "15. Contato e Suporte" },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero do Documento */}
        <div className="relative border-b border-border bg-card/40 py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar à página inicial
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary shadow-sm mb-4">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Condições Gerais de Uso & Licença de Software (SaaS)
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Termos de Serviço
            </h1>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Estes Termos de Serviço regulam o acesso e a utilização da plataforma{" "}
              <strong className="text-foreground font-semibold">ProMetric</strong>, desenvolvida e
              operada pela <strong className="text-foreground font-semibold">MetricBR</strong>.
              Leia atentamente estas condições antes de utilizar o sistema.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/70 pt-4">
              <span><strong>Operado por:</strong> MetricBR</span>
              <span>•</span>
              <span><strong>Produto:</strong> ProMetric</span>
              <span>•</span>
              <span><strong>Última atualização:</strong> 08 de outubro de 2026</span>
              <span>•</span>
              <span><strong>Versão:</strong> 1.0</span>
            </div>
          </div>
        </div>

        {/* Sumário Rápido */}
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="rounded-xl border border-border bg-secondary/20 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Sumário de Seções
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-muted-foreground hover:text-primary transition-colors hover:underline"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo Detalhado */}
        <article className="mx-auto max-w-4xl px-6 pb-20 space-y-12">
          {/* Seção 1 */}
          <section id="aceitacao" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              1. Aceitação dos Termos
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ao criar uma conta, acessar ou utilizar a plataforma <strong className="text-foreground">ProMetric</strong>{" "}
              (disponível via web e aplicações móveis), você declara que leu, compreendeu e concorda integralmente com estes{" "}
              <strong className="text-foreground">Termos de Serviço</strong> e com a nossa{" "}
              <Link to="/politica-de-privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Caso você não concorde com qualquer disposição destes termos, deve abster-se imediatamente de utilizar a plataforma.
              Se você representa uma instituição de ensino, clube esportivo ou empresa, você declara deter os poderes necessários
              para vincular tal organização a estas regras.
            </p>
          </section>

          {/* Seção 2 */}
          <section id="descricao" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              2. Descrição do ProMetric
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O <strong className="text-foreground">ProMetric</strong> é uma solução de software como serviço (SaaS) desenvolvida
              e mantida pela <strong className="text-foreground">MetricBR</strong>, desenhada para apoiar profissionais de Educação Física,
              escolas, academias e instituições esportivas na avaliação, registro, análise e acompanhamento do desenvolvimento motor
              e físico de alunos e praticantes.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A plataforma disponibiliza ferramentas para cadastro de turmas, digitação em tempo real de resultados de testes de aptidão física,
              cálculo automatizado de índices normativos com base no Método ProMetric® (incluindo o Índice ProMetric® de 0 a 100 e Radar das 5 dimensões),
              geração de relatórios individuais e coletivos em PDF e visualização de dashboards pedagógicos.
            </p>
          </section>

          {/* Seção 3 */}
          <section id="cadastro" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              3. Cadastro e Responsabilidade da Conta
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-1">
              <li>
                <strong className="text-foreground">Veracidade das informações:</strong> O usuário compromete-se a fornecer dados verdadeiros, exatos e atualizados no momento do cadastro e a mantê-los sempre corretos.
              </li>
              <li>
                <strong className="text-foreground">Sigilo de credenciais:</strong> As credenciais de acesso (e-mail, senha ou vínculo Google OAuth) são estritamente pessoais e intransferíveis. O usuário é o único responsável por manter a confidencialidade de sua senha.
              </li>
              <li>
                <strong className="text-foreground">Responsabilidade por atividades:</strong> Todas as ações realizadas na plataforma a partir da sua conta serão presumidas como de sua exclusiva autoria e responsabilidade.
              </li>
              <li>
                <strong className="text-foreground">Notificação de uso indevido:</strong> Em caso de suspeita de violação de segurança ou acesso não autorizado, o usuário deve notificar a equipe da MetricBR imediatamente.
              </li>
            </ul>
          </section>

          {/* Seção 4 */}
          <section id="uso-adequado" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              4. Uso Adequado da Plataforma
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O usuário concorda em utilizar o ProMetric exclusivamente para finalidades pedagógicas, esportivas e profissionais lícitas.
              É expressamente vedado:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Utilizar a plataforma para finalidades ilícitas, fraudulentas ou contrárias à moral e aos bons costumes;</li>
              <li>Realizar engenharia reversa, descompilação, cópia ou extração não autorizada do código-fonte ou da lógica do Método ProMetric®;</li>
              <li>Inserir vírus, malwares, scripts maliciosos ou praticar ataques de negação de serviço (DoS/DDoS);</li>
              <li>Tentar violar as barreiras de segurança, burlar as políticas de Row-Level Security (RLS) ou acessar dados de outras instituições sem autorização;</li>
              <li>Sublocar, revender, transferir ou conceder acesso compartilhado não autorizado da plataforma a terceiros alheios à sua instituição.</li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section id="responsabilidade-dados" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              5. Responsabilidade pelas Informações Inseridas
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A exatidão dos resultados gerados pelo sistema depende diretamente da qualidade, precisão e veracidade dos dados
              antropométricos e testes motores coletados e imputados pelo usuário (como peso, altura e tempos/marcas de testes físicos).
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A MetricBR não fiscaliza a veracidade nem a técnica de execução presencial dos testes físicos escolares, sendo o professor,
              avaliador ou instituição contratante o único e exclusivo responsável pela fidelidade das medidas inseridas na plataforma.
            </p>
          </section>

          {/* Seção 6 */}
          <section id="escolas-professores" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              6. Escolas, Gestores e Professores
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              As escolas e gestores institucionais atuam como as entidades controladoras das turmas e alunos cadastrados. Ao utilizar o ProMetric:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-1">
              <li>A instituição declara possuir a devida base legal e consentimento ou autorização educacional para a realização de avaliações físicas em seu corpo discente;</li>
              <li>A instituição deve orientar seus professores e avaliadores a respeitar a integridade, o sigilo e a privacidade dos estudantes;</li>
              <li>O envio ou disponibilização de boletins e laudos aos pais é de responsabilidade da instituição avaliadora.</li>
            </ul>
          </section>

          {/* Seção 7 */}
          <section id="dados-alunos" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              7. Dados de Alunos e Menores de Idade
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os dados dos alunos menores de idade são processados estritamente no âmbito educacional e com o propósito exclusivo
              de subsidiar o planejamento de aulas de Educação Física e promover hábitos saudáveis. O ProMetric veda qualquer tratamento
              desses dados para fins comerciais alheios à educação, observando o art. 14 da LGPD.
            </p>
          </section>

          {/* Seção 8 - AVISO MÉDICO CRÍTICO */}
          <section id="aviso-medico" className="scroll-mt-24 space-y-4">
            <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-6 shadow-card">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-lg mb-2">
                <Stethoscope className="h-5 w-5" />
                8. Importante: Não Constitui Diagnóstico Clínico ou Médico
              </div>

              <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                O ProMetric é estritamente uma ferramenta tecnológica de apoio à avaliação pedagógica, motora e de condicionamento físico escolar.
              </p>

              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <p>
                  Os indicadores, gráficos, percentis e índices calculados pela plataforma — incluindo, mas não se limitando ao{" "}
                  <strong className="text-foreground">Índice ProMetric® de 0 a 100</strong>, classificações de IMC infantil/escolar,
                  testes de resistência e pareceres emitidos por inteligência artificial —{" "}
                  <strong className="text-foreground">
                    NÃO CONSTITUEM, NÃO SUBSTITUEM E NÃO DEVEM SER INTERPRETADOS COMO DIAGNÓSTICO CLÍNICO, MÉDICO, CARDIOLÓGICO,
                    NUTRICIONAL OU FISIOTERAPÊUTICO.
                  </strong>
                </p>

                <ul className="list-disc list-inside space-y-1.5 pl-1 text-xs">
                  <li>
                    A plataforma visa auxiliar o professor de Educação Física a identificar tendências gerais de aptidão e estimular o desenvolvimento motor saudável de forma lúdica e pedagógica.
                  </li>
                  <li>
                    Quaisquer sinais de alterações clínicas, sintomas de desconforto ou suspeitas patológicas devem ser encaminhados para avaliação presencial por médicos pediatras, cardiologistas ou profissionais de saúde devidamente habilitados.
                  </li>
                  <li>
                    A MetricBR e o ProMetric não assumem responsabilidade médica, terapêutica ou clínica sobre condutas tomadas com base exclusiva nos relatórios gerados.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Seção 9 */}
          <section id="limitacoes" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              9. Limitações e Responsabilidades da Plataforma
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A MetricBR empenha seus melhores esforços técnicos para garantir alta disponibilidade, segurança e acurácia dos cálculos do sistema.
              Contudo, no limite permitido pela legislação aplicável:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>O software é fornecido na modalidade "no estado em que se encontra" (<em>as is</em>);</li>
              <li>A MetricBR não responde por danos indiretos, lucros cessantes ou prejuízos decorrentes de falhas de conexão de internet do usuário, mau uso do sistema ou decisões pedagógicas tomadas sem critério;</li>
              <li>Em nenhuma hipótese a responsabilidade total indenizatória da MetricBR perante o usuário excederá o valor total comprovadamente pago por este pelos serviços nos últimos 3 (três) meses anteriores ao fato gerador.</li>
            </ul>
          </section>

          {/* Seção 10 */}
          <section id="propriedade-intelectual" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              10. Propriedade Intelectual
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Todos os direitos relativos à plataforma ProMetric são de propriedade exclusiva da <strong className="text-foreground">MetricBR</strong> ou
              a ela regularmente licenciados, incluindo, sem limitação:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>As marcas nominativas e figurativas "ProMetric"®, "Método ProMetric"® e "MetricBR";</li>
              <li>A metodologia de cálculo proprietária das 5 dimensões e o Índice ProMetric®;</li>
              <li>O código-fonte, arquitetura de software, design visual, identidade gráfica, telas e logotipos;</li>
              <li>Os modelos de relatórios, textos e materiais pedagógicos integrados ao sistema.</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A contratação da plataforma confere ao usuário uma licença de uso limitada, revogável, não exclusiva e intransferível
              durante o período de vigência de seu plano. É terminantemente proibida a reprodução ou apropriação indevida destes ativos.
            </p>
          </section>

          {/* Seção 11 */}
          <section id="disponibilidade" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              11. Disponibilidade, Manutenção e Atualizações
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O serviço está sujeito a eventuais interrupções temporárias decorrentes de manutenções programadas, melhorias de infraestrutura,
              atualizações de segurança ou eventos de caso fortuito e força maior.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A MetricBR buscará, sempre que viável, realizar intervenções técnicas em horários de menor impacto e comunicar manutenções relevantes
              com antecedência.
            </p>
          </section>

          {/* Seção 12 */}
          <section id="suspensao" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              12. Suspensão ou Encerramento de Contas
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A MetricBR poderá suspender ou encerrar o acesso do usuário à plataforma, a qualquer momento e sem prejuízo de outras medidas legais,
              caso seja constatado:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li>Descumprimento de qualquer disposição destes Termos de Serviço ou da Política de Privacidade;</li>
              <li>Uso indevido, inserção de dados fraudulentos ou conduta que coloque em risco a segurança e a integridade da plataforma e de outros usuários;</li>
              <li>Inadimplência financeira no plano contratado, após notificação prévia de regularização;</li>
              <li>Solicitação formal do próprio usuário para encerramento de sua conta.</li>
            </ul>
          </section>

          {/* Seção 13 */}
          <section id="alteracoes" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              13. Alterações Destes Termos
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A MetricBR poderá modificar estes Termos de Serviço a qualquer tempo, visando adequação legal, técnica ou inclusão de novos recursos.
              A nova versão entrará em vigor a partir da data de sua publicação nesta página.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O uso continuado da plataforma após a publicação das alterações constitui concordância e aceitação tácita dos novos termos.
            </p>
          </section>

          {/* Seção 14 */}
          <section id="legislacao" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              14. Legislação Aplicável e Foro
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Estes Termos de Serviço são regidos, interpretados e executados segundo as leis da República Federativa do Brasil,
              especialmente o Marco Civil da Internet (Lei nº 12.965/2014) e a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Fica eleito o foro da comarca da sede da MetricBR ou o foro do domicílio do consumidor no território brasileiro,
              com expressa renúncia a qualquer outro, por mais privilegiado que seja, para dirimir eventuais litígios decorrentes destes termos.
            </p>
          </section>

          {/* Seção 15 */}
          <section id="contato" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              15. Contato e Suporte
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Caso você tenha dúvidas, sugestões ou necessite de esclarecimentos adicionais sobre estes Termos de Serviço,
              entre em contato com nosso atendimento:
            </p>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Mail className="h-4 w-4 text-primary" />
                Canal Oficial de Atendimento
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">E-mail:</strong>{" "}
                <a href={`mailto:${config.footer.contactEmail || "contato@prometric.app"}`} className="text-primary hover:underline">
                  {config.footer.contactEmail || "contato@prometric.app"}
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                Plataforma ProMetric — Desenvolvida e operada pela MetricBR.
              </p>
            </div>
          </section>
        </article>
      </main>

      <SiteFooter footer={config.footer} />
    </div>
  );
}
