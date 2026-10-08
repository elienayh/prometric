import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Users, AlertCircle, ArrowLeft, CheckCircle2, Mail, Database, KeyRound, Building2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useHomePageConfig } from "@/hooks/use-homepage-config";

const POLICY_URL = "https://prometric.app.br/politica-de-privacidade";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | ProMetric" },
      {
        name: "description",
        content:
          "Política de Privacidade da plataforma ProMetric (desenvolvida e operada pela MetricBR). Declaração completa sobre tratamento de dados, conformidade com a LGPD e uso limitado do Google OAuth.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Política de Privacidade | ProMetric" },
      {
        property: "og:description",
        content:
          "Transparência, proteção de dados de crianças e adolescentes, conformidade com a LGPD e conformidade com a Google API Services User Data Policy no ProMetric.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: POLICY_URL },
    ],
    links: [
      {
        rel: "canonical",
        href: POLICY_URL,
      },
    ],
  }),
  component: PoliticaPrivacidadePage,
});

function PoliticaPrivacidadePage() {
  const { config } = useHomePageConfig();

  const sections = [
    { id: "identificacao", title: "1. Identificação, Modelo de Serviço e Escopo" },
    { id: "distincao-dados", title: "2. Distinção das Categorias de Dados Tratados" },
    { id: "google-oauth", title: "3. Uso de Dados do Google (Google OAuth & Limited Use)" },
    { id: "dados-clientes", title: "4. Dados Inseridos Pelos Clientes na Plataforma" },
    { id: "finalidade", title: "5. Finalidades do Tratamento de Dados" },
    { id: "menores", title: "6. Dados de Crianças e Adolescentes (Art. 14 da LGPD)" },
    { id: "compartilhamento", title: "7. Compartilhamento e Transferência de Dados" },
    { id: "seguranca", title: "8. Segurança, Criptografia e Isolamento Multi-Tenant" },
    { id: "retencao", title: "9. Retenção e Exclusão de Dados" },
    { id: "direitos", title: "10. Direitos dos Titulares de Dados (LGPD)" },
    { id: "cookies", title: "11. Cookies e Tecnologias de Sessão" },
    { id: "provedores", title: "12. Provedores de Infraestrutura Técnica" },
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
              Conformidade LGPD (Lei nº 13.709/2018) & Google API Services User Data Policy
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Política de Privacidade
            </h1>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Esta Política descreve formalmente as práticas de coleta, utilização, armazenamento,
              segurança e descarte de dados pessoais na plataforma{" "}
              <strong className="text-foreground font-semibold">ProMetric</strong>, operada pela{" "}
              <strong className="text-foreground font-semibold">MetricBR</strong>, incluindo os
              compromissos específicos de uso limitado dos dados recebidos via{" "}
              <strong className="text-foreground font-semibold">Google OAuth</strong> e o tratamento
              de dados pedagógicos e de menores conforme a{" "}
              <strong className="text-foreground font-semibold">LGPD</strong>.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/70 pt-4">
              <span><strong>Operado por:</strong> MetricBR</span>
              <span>•</span>
              <span><strong>Produto:</strong> ProMetric (prometric.app.br)</span>
              <span>•</span>
              <span><strong>URL Oficial:</strong> https://prometric.app.br/politica-de-privacidade</span>
              <span>•</span>
              <span><strong>Última atualização:</strong> 08 de outubro de 2026</span>
              <span>•</span>
              <span><strong>Versão:</strong> 1.1</span>
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
              1. Identificação, Modelo de Serviço e Escopo
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A presente Política de Privacidade regula o tratamento de informações no âmbito da plataforma{" "}
              <strong className="text-foreground">ProMetric</strong> (disponível via web em{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">prometric.app.br</code>), desenvolvida, mantida e
              operada pela empresa <strong className="text-foreground">MetricBR</strong>.
            </p>
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Building2 className="h-4 w-4 text-primary" />
                Modelo SaaS (Software as a Service) e Não Comercialização de Dados
              </div>
              <p>
                O ProMetric é um software como serviço (SaaS) voltado à área educacional e esportiva. Os clientes
                (escolas, colégios, academias, clubes e profissionais de Educação Física) contratam licenças de uso do
                software para gestão e aplicação de baterias de testes físicos baseadas no Método ProMetric®.
              </p>
              <p className="text-foreground font-medium">
                A remuneração da MetricBR provém exclusivamente das assinaturas do software contratado. O ProMetric e a
                MetricBR NÃO comercializam, NÃO vendem, NÃO alugam e NÃO monetizam quaisquer dados de usuários, clientes,
                alunos ou informações recebidas de integrações como o Google OAuth.
              </p>
            </div>
          </section>

          {/* Seção 2 */}
          <section id="distincao-dados" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              2. Distinção das Categorias de Dados Tratados
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para fins de transparência técnica e jurídica, o ProMetric distingue com clareza duas categorias distintas de dados:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <KeyRound className="h-4 w-4" />
                  Categoria A: Dados Obtidos do Google OAuth
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Dados estritamente cadastrais e de perfil básico recebidos durante o fluxo de login federado seguro com a conta Google do usuário.
                  Utilizados <em>exclusivamente</em> para identificação, autenticação, controle de sessão e segurança da conta na plataforma.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Database className="h-4 w-4 text-primary" />
                  Categoria B: Dados Inseridos Pelos Clientes
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Informações inseridas diretamente pelos professores, gestores e instituições clientes: cadastros de escolas,
                  turmas, listas de alunos, medidas antropométricas e notas de testes físicos escolares.
                  O cliente atua como controlador pedagógico dessas informações.
                </p>
              </div>
            </div>
          </section>

          {/* Seção 3 - GOOGLE OAUTH E COMPLIANCE RIGOROSO */}
          <section id="google-oauth" className="scroll-mt-24 space-y-5">
            <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 md:p-8 shadow-card space-y-6">
              <div className="flex items-center gap-2.5 text-primary font-bold text-xl border-b border-border pb-3">
                <Lock className="h-6 w-6 shrink-0" />
                3. Uso de Dados do Usuário do Google (Google OAuth & Limited Use)
              </div>

              <p className="text-sm leading-relaxed text-foreground/90">
                Esta seção detalha rigorosamente como o ProMetric lida com os dados do usuário do Google, respondendo de forma
                específica e comprovável aos critérios de verificação e às diretrizes da{" "}
                <strong>Google API Services User Data Policy</strong>:
              </p>

              {/* 3.1 WHAT */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  3.1. QUAIS dados e escopos do Google o ProMetric acessa (WHAT)
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  O ProMetric utiliza exclusivamente o fluxo padrão de autenticação OpenID Connect do Google via Supabase Auth
                  (implementado na rota <code className="bg-muted px-1 py-0.5 rounded text-foreground">/auth</code> e no callback{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-foreground">/auth/callback</code>). O aplicativo solicita
                  única e exclusivamente os escopos básicos de identidade:
                </p>
                <div className="rounded-lg border border-border bg-secondary/30 p-3.5 space-y-2 text-xs">
                  <div>
                    <strong className="text-foreground">Escopos solicitados:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground pl-1 font-mono text-[11px]">
                      <li>openid</li>
                      <li>https://www.googleapis.com/auth/userinfo.email (email)</li>
                      <li>https://www.googleapis.com/auth/userinfo.profile (profile)</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-foreground">Dados efetivamente recebidos:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground pl-1">
                      <li><strong className="text-foreground">Endereço de e-mail</strong> (<code className="text-[11px] font-mono">email</code>): utilizado como identificador principal do usuário;</li>
                      <li><strong className="text-foreground">Nome completo</strong> (<code className="text-[11px] font-mono">name</code> / <code className="text-[11px] font-mono">full_name</code>): utilizado para identificação visual no painel;</li>
                      <li><strong className="text-foreground">Foto de perfil pública</strong> (<code className="text-[11px] font-mono">picture</code> / <code className="text-[11px] font-mono">avatar_url</code>): exibida no avatar de usuário;</li>
                      <li><strong className="text-foreground">Identificador único Google</strong> (<code className="text-[11px] font-mono">sub</code> / Google User ID): token de vínculo federado de conta.</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  <strong>Não solicitamos escopos sensíveis ou restritos:</strong> O ProMetric <strong>NÃO</strong> solicita, não acessa e
                  não possui permissões para ler dados do Google Drive, Gmail, Google Agenda, Contatos, YouTube, Google Classroom ou quaisquer outros serviços privados do ecossistema Google.
                </p>
              </div>

              {/* 3.2 HOW & WHY */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  3.2. COMO e POR QUE os dados do Google são utilizados (HOW & WHY)
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Os dados recebidos do Google são processados unicamente para as seguintes finalidades legítimas de operação da plataforma:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-1">
                  <li><strong className="text-foreground">Autenticação federada:</strong> validar a identidade do usuário sem que este precise criar ou memorizar uma senha adicional;</li>
                  <li><strong className="text-foreground">Identificação e criação de conta:</strong> criar ou associar o registro do usuário na tabela <code className="font-mono text-[11px]">public.profiles</code> com seu e-mail e nome;</li>
                  <li><strong className="text-foreground">Gerenciamento de sessão:</strong> emitir e validar os tokens de sessão segura (JWT) para manter o usuário autenticado;</li>
                  <li><strong className="text-foreground">Controle de acesso e autorização (RBAC):</strong> vincular a conta do usuário às escolas, turmas e permissões correspondentes (super admin, gestor ou professor);</li>
                  <li><strong className="text-foreground">Segurança contra fraudes:</strong> validar a troca de código PKCE e prevenir acessos não autorizados.</li>
                </ul>
              </div>

              {/* 3.3 WHERE & HOW PROTECTED */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  3.3. ONDE e COMO os dados do Google são armazenados e protegidos (WHERE & HOW PROTECTED)
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Os dados cadastrais recebidos do Google são armazenados de forma estruturada e estritamente protegida:
                </p>
                <div className="rounded-lg border border-border bg-secondary/30 p-3.5 space-y-2 text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Tabelas de armazenamento:</strong> Os dados de perfil (<code className="font-mono text-[11px]">email</code>, <code className="font-mono text-[11px]">full_name</code> e <code className="font-mono text-[11px]">avatar_url</code>) são armazenados no banco de dados relacional PostgreSQL gerenciado pelo Supabase.
                  </p>
                  <p>
                    <strong className="text-foreground">Criptografia:</strong> Todo o tráfego entre o navegador do usuário, o provedor Google e os servidores do ProMetric é protegido por criptografia em trânsito TLS 1.3 / HTTPS. Em repouso, o banco de dados é criptografado com o padrão AES-256.
                  </p>
                  <p>
                    <strong className="text-foreground">Isolamento entre instituições (Row-Level Security):</strong> As políticas de segurança no nível de linha (RLS) asseguram que os dados da conta e os registros de cada instituição sejam totalmente isolados, impedindo que qualquer usuário não autorizado visualize informações de outros clientes.
                  </p>
                  <p>
                    <strong className="text-foreground">Tokens de acesso:</strong> Credenciais sensíveis ou senhas não são armazenadas pelo ProMetric; a autenticação opera por meio de tokens criptográficos padrão JWT.
                  </p>
                </div>
              </div>

              {/* 3.4 WHO / TRANSFERS */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  3.4. COM QUEM os dados do Google são compartilhados ou transferidos (WHO)
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Os dados do usuário obtidos via Google OAuth <strong>NÃO</strong> são transferidos, vendidos, alugados ou compartilhados
                  com terceiros para finalidades autônomas, de marketing ou comerciais. Eles são compartilhados exclusivamente com:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-1">
                  <li><strong className="text-foreground">Provedores de infraestrutura de nuvem:</strong> Supabase (hospedagem de banco de dados e autenticação) e Cloudflare (entrega segura e proteção contra ataques DDoS), ambos atuando como operadores técnicos sob cláusulas estritas de confidencialidade;</li>
                  <li><strong className="text-foreground">Cumprimento legal estrito:</strong> somente quando exigido por ordem judicial formal emanada por autoridade judiciária brasileira competente.</li>
                </ul>
              </div>

              {/* 3.5 HOW LONG & DELETION */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  3.5. RETENÇÃO e exclusão dos dados do Google (HOW LONG)
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Os dados de perfil vinculados à conta Google permanecem armazenados enquanto a conta do usuário estiver ativa
                  na plataforma ProMetric.
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  O titular da conta pode, a qualquer momento, solicitar a exclusão integral de sua conta e dos dados pessoais
                  associados enviando um e-mail para{" "}
                  <a href={`mailto:${config.footer.contactEmail || "contato@prometric.app"}`} className="text-primary font-medium underline">
                    {config.footer.contactEmail || "contato@prometric.app"}
                  </a>
                  . Após a confirmação, a conta e os registros de perfil vinculados serão excluídos permanentemente de nossos bancos
                  de dados ativos em até 15 (quinze) dias úteis, ressalvada a guarda estritamente necessária para atendimento a obrigações legais (Marco Civil da Internet).
                </p>
              </div>

              {/* 3.6 PROIBIÇÕES EXPRESSAS E LIMITED USE */}
              <div className="rounded-xl border border-primary/40 bg-primary/10 p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Compromisso Expresso de Uso Limitado (Google Limited Use Requirements)
                </div>
                <p className="text-xs leading-relaxed text-foreground/90">
                  O uso e a transferência de informações recebidas de APIs do Google pelo ProMetric para qualquer outro aplicativo
                  obedecerão integralmente à{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline font-medium"
                  >
                    Política de Dados do Usuário dos Serviços de API do Google
                  </a>
                  , incluindo os requisitos de <em>Uso Limitado (Limited Use)</em>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-1">
                  <li>Os dados do Google <strong>NUNCA</strong> são vendidos, alugados ou comercializados sob nenhuma hipótese;</li>
                  <li>Os dados do Google <strong>NÃO</strong> são utilizados nem transferidos para veiculação de anúncios, marketing direcionado ou perfilamento de consumo;</li>
                  <li>Os dados do Google <strong>NÃO</strong> são transferidos a data brokers, revendedores de informações ou terceiros;</li>
                  <li>Os dados do Google <strong>NÃO</strong> são utilizados para construir bases de dados para fins independentes aos serviços do ProMetric;</li>
                  <li>Os dados do Google <strong>NÃO</strong> são utilizados nem transferidos para treinamento de modelos de inteligência artificial ou modelos generalizados de Machine Learning (LLMs).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Seção 4 - Dados Inseridos Pelos Clientes */}
          <section id="dados-clientes" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              4. Dados Inseridos Pelos Clientes na Plataforma
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              De forma independente dos dados de autenticação do Google, os clientes autenticados inserem no ProMetric informações
              necessárias ao acompanhamento pedagógico e à realização das avaliações físicas:
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Cadastros Educacionais e Esportivos:</strong>
                <p className="text-xs">
                  Nome da instituição de ensino, unidades escolares, anos letivos, turmas, séries ou grupos de treino.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Dados de Identificação de Alunos e Avaliados:</strong>
                <p className="text-xs">
                  Nome completo ou matrícula escolar, data de nascimento, sexo biológico e turma de vínculo.
                  A data de nascimento e o sexo biológico são variáveis técnicas indispensáveis para o cálculo de curvas
                  normativas de crescimento e percentis motores por faixa etária.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Medições Antropométricas e Resultados de Testes Físicos:</strong>
                <p className="text-xs">
                  Estatura, massa corporal, testes de flexibilidade (sentar e alcançar), força abdominal, impulsão horizontal,
                  agilidade e capacidade cardiorrespiratória. O sistema calcula a partir dessas variáveis o IMC escolar,
                  o Índice ProMetric® (0 a 100) e os gráficos de radar evolutivos.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Esses dados são de titularidade do cliente ou dos alunos avaliados, cabendo à instituição contratante o papel de
              controladora de tais informações perante a LGPD.
            </p>
          </section>

          {/* Seção 5 */}
          <section id="finalidade" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              5. Finalidades do Tratamento de Dados
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Todos os dados tratados no ProMetric possuem finalidades expressas, legítimas e vinculadas à operação pedagógica do sistema:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-1">
              <li><strong className="text-foreground">Operação do software SaaS:</strong> permitir login, autenticação segura, gestão de turmas e visualização de relatórios;</li>
              <li><strong className="text-foreground">Aplicação do Método ProMetric®:</strong> calcular índices de aptidão física, gerar relatórios de evolução individual e pareceres de acompanhamento motor;</li>
              <li><strong className="text-foreground">Geração de documentos em PDF:</strong> emissão de boletins de avaliação física para arquivamento escolar e entrega às famílias;</li>
              <li><strong className="text-foreground">Suporte técnico e comunicação:</strong> responder a chamados dos professores e gestores, enviar comunicados de segurança e avisos operacionais da plataforma;</li>
              <li><strong className="text-foreground">Integridade e auditoria:</strong> prevenir acessos indevidos e registrar logs técnicos de segurança.</li>
            </ul>
          </section>

          {/* Seção 6 - Menores e LGPD */}
          <section id="menores" className="scroll-mt-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
                <Users className="h-5 w-5 text-primary" />
                6. Dados de Crianças e Adolescentes (Artigo 14 da LGPD)
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Como sistema utilizado no ambiente escolar, o ProMetric processa registros pedagógicos de estudantes menores
                de 18 anos. O tratamento é regido com primazia pelas diretrizes do{" "}
                <strong className="text-foreground">Artigo 14 da Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>:
              </p>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-1">
                  <strong className="text-foreground block text-xs uppercase tracking-wide">Melhor Interesse do Menor</strong>
                  <p className="text-xs">
                    Todo o processamento é conduzido estritamente no melhor interesse da criança e do adolescente, visando fomentar
                    o desenvolvimento motor saudável, prevenir o sedentarismo e apoiar a prática pedagógica da Educação Física escolar.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-1">
                  <strong className="text-foreground block text-xs uppercase tracking-wide">Papel da Instituição Escolar e Consentimento</strong>
                  <p className="text-xs">
                    As escolas e colégios contratantes atuam como controladoras dos dados de seus alunos matriculados, incumbindo-lhes
                    a obtenção e manutenção dos consentimentos ou autorizações cabíveis dos pais ou responsáveis legais, no contexto da matrícula
                    ou do projeto pedagógico institucional.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-1">
                  <strong className="text-foreground block text-xs uppercase tracking-wide">Sigilo, Dignidade e Não Exposição</strong>
                  <p className="text-xs">
                    O ProMetric não publica rankings pejorativos ou comparações públicas entre alunos. Os resultados são confidenciais
                    e acessíveis unicamente pelos educadores autorizados e pelas famílias avaliadas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 7 */}
          <section id="compartilhamento" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              7. Compartilhamento e Transferência de Dados
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A MetricBR não comercializa dados sob nenhuma hipótese. O compartilhamento de dados ocorre exclusivamente:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-1">
              <li>
                <strong className="text-foreground">Com a escola ou instituição contratante:</strong> profissionais e gestores autorizados pela própria instituição acessam as turmas sob sua responsabilidade pedagógica;
              </li>
              <li>
                <strong className="text-foreground">Com operadores de infraestrutura técnica:</strong> servidores de hospedagem em nuvem e banco de dados que viabilizam o funcionamento da aplicação;
              </li>
              <li>
                <strong className="text-foreground">Para cumprimento de obrigações legais:</strong> quando formalmente demandado por autoridades judiciais ou administrativas competentes brasileiras.
              </li>
            </ul>
          </section>

          {/* Seção 8 */}
          <section id="seguranca" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              8. Segurança, Criptografia e Isolamento Multi-Tenant
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Implementamos salvaguardas técnicas e administrativas rigorosas para assegurar a confidencialidade e a integridade das informações:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Criptografia em Trânsito e em Repouso</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Comunicações 100% protegidas via HTTPS/TLS 1.3 com certificados válidos. Bases de dados criptografadas em repouso com AES-256.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Row-Level Security (RLS)</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Isolamento lógico profundo entre clientes: cada instituição acessa apenas seus próprios dados através de políticas no banco de dados.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Controle Baseado em Papéis (RBAC)</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Separação estrita de permissões entre super administradores da plataforma, gestores escolares e professores avaliadores.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <strong className="text-foreground block">Autenticação Segura & PKCE</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Uso de fluxo PKCE (Proof Key for Code Exchange) para troca de credenciais OAuth e tokens de curta duração com rotação de sessão.
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
              Os dados pessoais são mantidos pelo período em que a conta da instituição ou do usuário permanecer ativa ou enquanto
              durar o contrato de prestação de serviços do ProMetric.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Após o encerramento do vínculo ou mediante solicitação formal de exclusão pelo titular ou instituição controladora,
              os dados cadastrais e de avaliações são eliminados de forma segura e permanente dos bancos de dados operacionais, ressalvada
              a retenção dos registros estritamente exigidos pelo Marco Civil da Internet (Lei nº 12.965/2014, art. 15) pelo prazo legal.
            </p>
          </section>

          {/* Seção 10 */}
          <section id="direitos" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              10. Direitos dos Titulares de Dados (LGPD)
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Em cumprimento ao artigo 18 da Lei Federal nº 13.709/2018 (LGPD), os titulares de dados pessoais (ou seus pais/responsáveis legais)
              podem exercer a qualquer momento os seguintes direitos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">Confirmação e Acesso</strong>
                Obter confirmação da existência de tratamento e acessar os dados pessoais existentes no sistema.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">Correção de Dados</strong>
                Solicitar a retificação de dados incorretos, incompletos ou desatualizados.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">Anonimização ou Eliminação</strong>
                Requerer a exclusão ou anonimização de dados desnecessários ou tratados em desacordo com a lei.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">Portabilidade</strong>
                Solicitar cópia de seus dados em formato estruturado e legível por máquina.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">Informação sobre Compartilhamento</strong>
                Saber com quais entidades públicas ou privadas houve compartilhamento de dados.
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <strong className="text-foreground block mb-0.5">Revogação do Consentimento</strong>
                Revogar o consentimento outorgado para tratamentos que dependam dessa base legal.
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Para exercer qualquer um desses direitos, basta formalizar a solicitação através do nosso canal de contato no tópico 14.
            </p>
          </section>

          {/* Seção 11 */}
          <section id="cookies" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              11. Cookies e Tecnologias de Sessão
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O ProMetric utiliza cookies e armazenamento local (<code className="text-xs bg-muted px-1 py-0.5 rounded">localStorage</code>)
              estritamente operacionais:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li><strong className="text-foreground">Cookies de Autenticação e Sessão:</strong> necessários para preservar a sessão criptografada do usuário conectado;</li>
              <li><strong className="text-foreground">Preferências Locais:</strong> gravação do modo visual (tema claro/escuro);</li>
              <li><strong className="text-foreground">Segurança:</strong> mitigação de ataques CSRF e validação de requisições legítimas.</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Não utilizamos cookies de terceiros para fins de publicidade direcionada, retargeting ou rastreamento de navegação externa.
            </p>
          </section>

          {/* Seção 12 */}
          <section id="provedores" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              12. Provedores de Infraestrutura Técnica
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A prestação dos serviços do ProMetric apoia-se em parceiros de infraestrutura de classe mundial que atuam como
              subprocessadores / operadores sob rigorosos padrões de segurança:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-1">
              <li><strong className="text-foreground">Supabase:</strong> hospedagem de banco de dados gerenciado PostgreSQL e infraestrutura de autenticação segura;</li>
              <li><strong className="text-foreground">Google Identity Services (OAuth):</strong> mecanismo de autenticação federada segura;</li>
              <li><strong className="text-foreground">Cloudflare:</strong> rede de entrega de conteúdo (CDN), mitigação de ataques e terminação SSL/TLS.</li>
            </ul>
          </section>

          {/* Seção 13 */}
          <section id="alteracoes" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              13. Alterações Desta Política de Privacidade
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A MetricBR poderá atualizar esta Política de Privacidade periodicamente para refletir aprimoramentos técnicos, novas funcionalidades
              ou alterações legislativas e regulatórias.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              As alterações entrarão em vigor a partir da data de publicação nesta página. Alterações significativas serão destacadas
              no painel administrativo do ProMetric para ciência prévia dos usuários.
            </p>
          </section>

          {/* Seção 14 */}
          <section id="contato" className="scroll-mt-24 space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
              14. Canal de Contato
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para esclarecer dúvidas sobre esta Política de Privacidade, reportar questões de segurança ou solicitar informações
              sobre o uso de dados pessoais e autenticação com Google, utilize o canal oficial:
            </p>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Mail className="h-4 w-4 text-primary" />
                Canal Oficial de Atendimento e Privacidade
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">E-mail:</strong>{" "}
                <a href={`mailto:${config.footer.contactEmail || "contato@prometric.app"}`} className="text-primary hover:underline font-medium">
                  {config.footer.contactEmail || "contato@prometric.app"}
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                Plataforma ProMetric — Operada pela MetricBR.
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
                Nos termos do artigo 41 da Lei Geral de Proteção de Dados (LGPD), as solicitações direcionadas ao Encarregado pelo
                Tratamento de Dados Pessoais (DPO) da MetricBR podem ser encaminhadas aos dados de contato abaixo:
              </p>
              <div className="rounded-md border border-border/70 bg-card p-3 text-xs space-y-1 font-mono text-muted-foreground">
                <div><strong className="text-foreground">Encarregado (DPO):</strong> [A ser formalizado perante a ANPD pela MetricBR]</div>
                <div><strong className="text-foreground">Canal oficial provisório do DPO:</strong> dpo@metricbr.com.br / {config.footer.contactEmail || "contato@prometric.app"}</div>
                <div><strong className="text-foreground">Prazo regulamentar de resposta:</strong> Até 15 (quinze) dias conforme a LGPD</div>
              </div>
            </div>
          </section>
        </article>
      </main>

      <SiteFooter footer={config.footer} />
    </div>
  );
}
