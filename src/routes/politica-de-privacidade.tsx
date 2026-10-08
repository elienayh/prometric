import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Users, Sparkles, AlertCircle, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useHomePageConfig } from "@/hooks/use-homepage-config";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | ProMetric" },
      {
        name: "description",
        content:
          "Política de Privacidade da plataforma ProMetric, desenvolvida e operada pela MetricBR. Conheça as diretrizes de proteção de dados, conformidade com a LGPD e uso seguro do Google OAuth.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Política de Privacidade | ProMetric" },
      {
        property: "og:description",
        content:
          "Diretrizes claras de privacidade, proteção aos dados de menores de idade e conformidade com a LGPD no ProMetric.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "canonical",
        href:
          typeof window !== "undefined"
            ? `${window.location.origin}/politica-de-privacidade`
            : "/politica-de-privacidade",
      },
    ],
  }),
  component: PoliticaPrivacidadePage,
});

function PoliticaPrivacidadePage() {
  const { config } = useHomePageConfig();

  const sections = [
    { id: "identificacao", title: "1. Identificação e Escopo" },
    { id: "dados-coletados", title: "2. Dados Pessoais Coletados" },
    { id: "finalidade", title: "3. Como os Dados São Utilizados" },
    { id: "google-oauth", title: "4. Autenticação com Google (Google OAuth)" },
    { id: "menores", title: "5. Dados de Crianças e Adolescentes (LGPD)" },
    { id: "avaliacoes", title: "6. Avaliações Físicas e Dados Educacionais" },
    { id: "compartilhamento", title: "7. Compartilhamento de Dados" },
    { id: "seguranca", title: "8. Armazenamento, Segurança e Controle de Acesso" },
    { id: "retencao", title: "9. Retenção e Exclusão de Dados" },
    { id: "direitos", title: "10. Direitos dos Titulares de Dados" },
    { id: "cookies", title: "11. Cookies e Tecnologias Semelhantes" },
    { id: "terceiros", title: "12. Serviços e Provedores de Infraestrutura" },
    { id: "alteracoes", title: "13. Alterações Desta Política" },
    { id: "contato", title: "14. Canal de Contato" },
    { id: "dpo", title: "15. Encarregado pelo Tratamento de Dados (DPO)" },
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
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Conformidade LGPD (Lei nº 13.709/2018) & Google API Services
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Política de Privacidade
            </h1>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Esta Política descreve com total transparência como a{" "}
              <strong className="text-foreground font-semibold">MetricBR</strong> coleta, utiliza,
              armazena e protege os dados pessoais no âmbito da plataforma{" "}
              <strong className="text-foreground font-semibold">ProMetric</strong>, em estrita
              conformidade com a legislação brasileira de proteção de dados.
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
          <section id="identificacao" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              1. Identificação e Escopo
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A presente Política de Privacidade aplica-se à plataforma web e aplicativo{" "}
              <strong className="text-foreground">ProMetric</strong> (disponível em prometric.app e domínios associados),
              concebida, desenvolvida e operada pela <strong className="text-foreground">MetricBR</strong>.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O ProMetric é um sistema de apoio pedagógico e esportivo especializado em avaliação física integrada,
              utilizando o Método ProMetric® para acompanhamento do desenvolvimento motor, antropométrico e de aptidão
              física de alunos e praticantes em escolas, colégios, academias, clubes e assessorias esportivas.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ao acessar, cadastrar-se ou utilizar o ProMetric, você confirma que compreendeu as diretrizes aqui
              estabelecidas. Caso esteja utilizando o sistema em nome de uma instituição de ensino ou organização esportiva,
              você declara deter a competência e autorização para representá-la.
            </p>
          </section>

          {/* Seção 2 */}
          <section id="dados-coletados" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              2. Dados Pessoais Coletados
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O ProMetric coleta apenas os dados estritamente necessários para viabilizar as suas funcionalidades pedagógicas
              e de gestão esportiva:
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border bg-card p-4">
                <strong className="text-foreground block mb-1">A. Dados da Conta de Usuário (Professores, Gestores e Administradores):</strong>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Nome completo;</li>
                  <li>Endereço de e-mail;</li>
                  <li>Identificador exclusivo de conta no sistema de autenticação (User ID);</li>
                  <li>Foto de perfil (quando fornecida pelo usuário ou recebida via provedor Google OAuth);</li>
                  <li>Papel de acesso atribuído (super admin, gestor escolar, professor/avaliador).</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <strong className="text-foreground block mb-1">B. Dados da Instituição de Ensino / Organização:</strong>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Nome da escola, colégio ou instituição;</li>
                  <li>Turmas, séries, grupos de treinamento e anos letivos.</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <strong className="text-foreground block mb-1">C. Dados de Alunos e Avaliados:</strong>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Nome completo ou identificação acadêmica/matrícula;</li>
                  <li>Data de nascimento, idade e sexo biológico (essenciais para cálculo normativo de curvas de crescimento e percentis físicos);</li>
                  <li>Turma ou grupo esportivo de vínculo;</li>
                  <li>Contato opcional do responsável legal para envio de boletins ou relatórios individuais em PDF.</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <strong className="text-foreground block mb-1">D. Medidas e Avaliações Físicas:</strong>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Dados antropométricos: massa corporal (peso em kg), estatura (altura em cm) e dobras/perímetros quando aplicável;</li>
                  <li>Resultados de testes motores e de aptidão física (sentar e alcançar, abdominal, salto horizontal, agilidade, velocidade, teste cardiorrespiratório);</li>
                  <li>Cálculos derivados automáticos: IMC escolar, Índice ProMetric® (0 a 100), classificação nas 5 dimensões e relatórios evolutivos.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Seção 3 */}
          <section id="finalidade" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              3. Como os Dados São Utilizados (Finalidade do Tratamento)
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os dados coletados são tratados exclusivamente com propósitos legítimos e transparentes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-1">
              <li><strong className="text-foreground">Operação da plataforma:</strong> permitir cadastro, login, gerenciamento de perfis e controle de acesso hierárquico;</li>
              <li><strong className="text-foreground">Organização pedagógica:</strong> estruturar turmas, listas de chamada e baterias de testes aplicadas na escola;</li>
              <li><strong className="text-foreground">Cálculo e diagnósticos pedagógicos:</strong> aplicar as tabelas normativas e algoritmos do Método ProMetric®, gerando gráficos evolutivos e o Índice ProMetric®;</li>
              <li><strong className="text-foreground">Emissão de relatórios em PDF:</strong> gerar laudos individuais e consolidados para professores, gestores e entrega às famílias;</li>
              <li><strong className="text-foreground">Comunicação e suporte técnico:</strong> responder a dúvidas, prestar suporte aos usuários autorizados e enviar notificações importantes do sistema;</li>
              <li><strong className="text-foreground">Segurança cibernética:</strong> monitorar tentativas de intrusão, auditoria de acesso e garantia da integridade do banco de dados.</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Importante:</strong> A MetricBR e o ProMetric NÃO comercializam, NÃO alugam e NÃO utilizam os dados cadastrais ou de saúde física dos alunos para fins de publicidade direcionada, marketing de terceiros ou perfilamento comercial.
            </p>
          </section>

          {/* Seção 4 - Google OAuth */}
          <section id="google-oauth" className="scroll-mt-24 space-y-4">
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 shadow-card">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg mb-2">
                <Lock className="h-5 w-5" />
                4. Autenticação com Google (Google OAuth)
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                A plataforma ProMetric oferece aos usuários a opção prática e segura de realizar cadastro e login por meio do{" "}
                <strong>Google OAuth</strong> (integrado através do Supabase Auth).
              </p>

              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Quais dados recebemos do Google:</strong> Quando você opta por fazer login com sua conta do Google, solicitamos unicamente os dados básicos de identificação pública:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Seu endereço de e-mail principal;</li>
                  <li>Seu nome completo cadastrado no perfil Google;</li>
                  <li>Identificador exclusivo de usuário (ID Google);</li>
                  <li>URL da imagem pública de perfil (avatar).</li>
                </ul>

                <p>
                  <strong className="text-foreground">Finalidade estrita e exclusiva:</strong> Esses dados são utilizados exclusivamente para:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Identificar e autenticar a sua sessão na plataforma ProMetric;</li>
                  <li>Criar ou associar com segurança o seu perfil no ProMetric ao seu e-mail institucional ou pessoal;</li>
                  <li>Garantir que apenas você tenha acesso às escolas, turmas e avaliações que você gerencia.</li>
                </ul>

                <div className="rounded-lg border border-border bg-background p-4 mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Declaração de Conformidade com a Política de Dados do Usuário do Google
                  </div>
                  <p className="text-muted-foreground">
                    O uso de informações recebidas de APIs do Google pelo ProMetric cumpre integralmente a{" "}
                    <a
                      href="https://developers.google.com/terms/api-services-user-data-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:opacity-80"
                    >
                      Política de Dados do Usuário dos Serviços de API do Google
                    </a>
                    , incluindo os requisitos de <em>Uso Limitado (Limited Use requirements)</em>.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                    <li>O ProMetric <strong>NÃO</strong> acessa seu Google Drive, Gmail, contatos, calendário ou outros serviços privados do Google.</li>
                    <li>O ProMetric <strong>NÃO</strong> transfere seus dados obtidos do Google para terceiros, exceto provedores estritamente necessários para a execução do serviço (Supabase Auth/banco de dados em nuvem criptografado).</li>
                    <li>O ProMetric <strong>NÃO</strong> utiliza os dados do Google para veiculação de anúncios.</li>
                    <li>O ProMetric <strong>NÃO</strong> utiliza nem transfere dados do Google para treinamento de modelos públicos de inteligência artificial ou modelos de linguagem gerais.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 5 - Menores e LGPD */}
          <section id="menores" className="scroll-mt-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-2 text-foreground font-semibold text-lg mb-2">
                <Users className="h-5 w-5 text-primary" />
                5. Dados de Crianças e Adolescentes (Artigo 14 da LGPD)
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Como ferramenta educacional escolar, o ProMetric processa registros pedagógicos de avaliação física
                referentes a crianças e adolescentes. O tratamento desses dados obedece rigorosamente às disposições do{" "}
                <strong className="text-foreground">Artigo 14 da Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>:
              </p>

              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <p>
                    <strong className="text-foreground">Melhor interesse da criança e do adolescente:</strong> Todo o tratamento é realizado com vistas ao exclusivo benefício formativo, pedagógico e de saúde do educando, estimulando hábitos saudáveis e monitorando a aptidão física de forma construtiva e humanizada.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <p>
                    <strong className="text-foreground">Papel das Escolas e Consentimento:</strong> As instituições de ensino atuam como controladoras dos dados de seus alunos matriculados. É responsabilidade da escola obter e manter as autorizações ou consentimentos pertinentes dos pais ou responsáveis legais no ato da matrícula ou no regulamento pedagógico da instituição, conforme a legislação educacional e a LGPD.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <p>
                    <strong className="text-foreground">Proibição de Condicionamento Abusivo:</strong> Não é exigido qualquer dado excessivo além do indispensável para calcular as variáveis motoras e antropométricas de avaliação física.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <p>
                    <strong className="text-foreground">Sigilo e Não Exposição:</strong> Os relatórios são individuais ou consolidados em nível de turma para uso pedagógico restrito. O sistema não expõe resultados de menores ao público geral nem os submete a rankings depreciativos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 6 */}
          <section id="avaliacoes" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              6. Avaliações Físicas e Dados Educacionais
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os testes físicos inseridos na plataforma constituem informações sensíveis ligadas ao desenvolvimento corporal.
              O ProMetric trata essas informações com o mais alto padrão de confidencialidade:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-1">
              <li>
                <strong className="text-foreground">Finalidade exclusivamente de apoio:</strong> Os indicadores calculados (inclusive IMC e Índice ProMetric®) são ferramentas de auxílio ao professor e à coordenação pedagógica, não possuindo natureza de exame médico ou diagnóstico clínico.
              </li>
              <li>
                <strong className="text-foreground">Compartilhamento com a família:</strong> A disponibilização de relatórios individuais aos pais ou responsáveis legais é realizada sob gestão direta da instituição de ensino avaliadora.
              </li>
              <li>
                <strong className="text-foreground">Isolamento entre instituições (Multi-tenant):</strong> Nenhuma escola ou profissional tem acesso aos alunos ou relatórios de outra instituição cadastrada.
              </li>
            </ul>
          </section>

          {/* Seção 7 */}
          <section id="compartilhamento" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              7. Compartilhamento de Dados
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A MetricBR não vende, não comercializa e não compartilha dados pessoais com corretores de dados (data brokers) ou empresas de publicidade.
              O compartilhamento de dados restringe-se estritamente às seguintes hipóteses:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-1">
              <li>
                <strong className="text-foreground">Com a instituição de ensino contratante:</strong> a escola, gestores e professores autorizados acessam os dados de suas respectivas turmas e alunos.
              </li>
              <li>
                <strong className="text-foreground">Com provedores de infraestrutura técnica:</strong> servidores de hospedagem em nuvem, banco de dados (Supabase / PostgreSQL) e serviços de entrega de autenticação, sob contratos estritos de confidencialidade e segurança da informação.
              </li>
              <li>
                <strong className="text-foreground">Por obrigação legal ou ordem judicial:</strong> quando formalmente solicitado por autoridades judiciais ou administrativas competentes brasileiras, nos limites estritos da ordem.
              </li>
            </ul>
          </section>

          {/* Seção 8 */}
          <section id="seguranca" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              8. Armazenamento, Segurança e Controle de Acesso
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Adotamos salvaguardas técnicas e organizacionais condizentes com os padrões modernos da indústria para proteger
              os dados pessoais contra perda, destruição acidental, acesso não autorizado ou alteração ilícita:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Criptografia Ponta a Ponta</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Tráfego 100% criptografado via HTTPS/TLS 1.3 em trânsito e armazenamento com criptografia AES-256 em repouso.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Controle Granular (RBAC)</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Políticas de Row-Level Security (RLS) garantem que cada usuário só visualize os dados aos quais tem autorização expressa.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Autenticação Robusta</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Senhas com hash seguro (Argon2 / bcrypt) e suporte a provedor federado confiável (Google OAuth).
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Backups e Monitoramento</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Rotinas contínuas de cópias de segurança e monitoramento de falhas para restabelecimento rápido do serviço.
                </p>
              </div>
            </div>
          </section>

          {/* Seção 9 */}
          <section id="retencao" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              9. Retenção e Exclusão de Dados
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os dados pessoais são mantidos pelo período necessário para atender às finalidades pedagógicas contratadas ou
              enquanto a conta do usuário/instituição permanecer ativa.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Mediante cancelamento da conta ou solicitação expressa do titular ou da instituição controladora, os dados serão
              eliminados com segurança ou anonimizados para fins exclusivamente estatísticos, ressalvadas as hipóteses legais de
              guarda obrigatória previstas em lei (como cumprimento de obrigação legal, fiscal ou regulatória).
            </p>
          </section>

          {/* Seção 10 */}
          <section id="direitos" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              10. Direitos dos Titulares de Dados (LGPD)
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nos termos do artigo 18 da Lei Geral de Proteção de Dados (LGPD), os titulares de dados pessoais (ou seus pais/responsáveis
              legais, no caso de crianças e adolescentes) possuem os seguintes direitos perante o controlador:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">1. Confirmação e Acesso</strong>
                Saber se tratamos dados seus e solicitar cópia integral dessas informações.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">2. Correção de Dados</strong>
                Solicitar retificação de dados incorretos, inexatos ou incompletos.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">3. Anonimização ou Eliminação</strong>
                Pedir a eliminação ou anonimização de dados desnecessários ou tratados em desacordo com a lei.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">4. Portabilidade</strong>
                Solicitar transferência de dados para outro prestador de serviços, observados segredos comerciais.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">5. Informação sobre Compartilhamento</strong>
                Obter informações sobre as entidades públicas ou privadas com as quais houve compartilhamento.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">6. Revogação do Consentimento</strong>
                Revogar consentimento previamente concedido, com aviso prévio sobre os impactos operacionais.
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Para exercer qualquer um desses direitos, basta entrar em contato através do nosso canal indicado no tópico 14.
            </p>
          </section>

          {/* Seção 11 */}
          <section id="cookies" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              11. Cookies e Tecnologias Semelhantes
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Utilizamos cookies e armazenamento local (localStorage) estritamente essenciais para o funcionamento da plataforma:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li><strong className="text-foreground">Cookies de Sessão e Autenticação:</strong> necessários para manter você conectado com segurança enquanto navega pelo sistema;</li>
              <li><strong className="text-foreground">Preferências de Interface:</strong> gravação do tema visual (claro/escuro);</li>
              <li><strong className="text-foreground">Prevenção contra Fraudes:</strong> tokens de integridade para proteção de requisições.</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Não utilizamos cookies de terceiros para rastreamento publicitário ou criação de perfis comportamentais em sites externos.
            </p>
          </section>

          {/* Seção 12 */}
          <section id="terceiros" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              12. Serviços e Provedores de Infraestrutura Terceiros
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para viabilizar a entrega e a estabilidade da plataforma, a MetricBR contrata provedores de infraestrutura de alto nível, os quais atuam na condição de operadores e sob rígidas obrigações de confidencialidade:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li><strong className="text-foreground">Supabase / PostgreSQL:</strong> infraestrutura segura de banco de dados e autenticação de usuários;</li>
              <li><strong className="text-foreground">Google Identity Services (OAuth):</strong> mecanismo de autenticação federada segura;</li>
              <li><strong className="text-foreground">Cloudflare:</strong> serviços de rede de distribuição (CDN), mitigação de ataques DDoS e criptografia de ponta a ponta (SSL/TLS).</li>
            </ul>
          </section>

          {/* Seção 13 */}
          <section id="alteracoes" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              13. Alterações Desta Política de Privacidade
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A MetricBR reserva-se o direito de atualizar esta Política de Privacidade a qualquer momento para refletir
              melhorias no sistema, novos recursos ou mudanças legislativas e regulatórias.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sempre que houver alteração substantiva, a nova versão será publicada com a indicação da respectiva data de atualização
              no topo deste documento. Recomendamos a consulta periódica desta página.
            </p>
          </section>

          {/* Seção 14 */}
          <section id="contato" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              14. Canal de Contato
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Em caso de dúvidas sobre esta Política de Privacidade, solicitações relativas ao tratamento de seus dados pessoais
              ou dúvidas sobre a autenticação via Google OAuth, entre em contato com a equipe da MetricBR:
            </p>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Mail className="h-4 w-4 text-primary" />
                E-mail de Contato e Privacidade
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">E-mail de suporte:</strong>{" "}
                <a href={`mailto:${config.footer.contactEmail || "contato@prometric.app"}`} className="text-primary hover:underline">
                  {config.footer.contactEmail || "contato@prometric.app"}
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                Respondemos às solicitações de privacidade e direitos do titular no prazo legal estipulado pela LGPD.
              </p>
            </div>
          </section>

          {/* Seção 15 - Encarregado DPO */}
          <section id="dpo" className="scroll-mt-24 space-y-4">
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <AlertCircle className="h-4 w-4 text-primary" />
                15. Encarregado pelo Tratamento de Dados Pessoais (DPO)
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Conforme o art. 41 da Lei nº 13.709/2018 (LGPD), a indicação formal do Encarregado pelo Tratamento de Dados Pessoais (Data Protection Officer - DPO) da MetricBR está designada como segue:
              </p>
              <div className="rounded-md border border-border/70 bg-card p-3 text-xs space-y-1 font-mono text-muted-foreground">
                <div><strong className="text-foreground">Encarregado (DPO):</strong> [A ser formalizado perante a ANPD pela MetricBR]</div>
                <div><strong className="text-foreground">Canal oficial provisório do DPO:</strong> dpo@metricbr.com.br / {config.footer.contactEmail || "contato@prometric.app"}</div>
                <div><strong className="text-foreground">Prazo de atendimento:</strong> Até 15 (quinze) dias conforme diretrizes da LGPD</div>
              </div>
            </div>
          </section>
        </article>
      </main>

      <SiteFooter footer={config.footer} />
    </div>
  );
}
