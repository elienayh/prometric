import { Link } from "@tanstack/react-router";
import { PrometricIcon } from "@/components/brand/prometric-logo";
import type { HomePageConfig } from "@/lib/homepage-cms";

interface SiteFooterProps {
  footer?: HomePageConfig["footer"];
}

export function SiteFooter({ footer }: SiteFooterProps) {
  const brandTagline = footer?.brandTagline || "ProMetric — Avaliação Física Inteligente com IA.";
  const copyrightText = footer?.copyrightText || `© ${new Date().getFullYear()} ProMetric`;

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <PrometricIcon className="h-5 w-5" />
            <span>{brandTagline}</span>
          </div>
          <nav aria-label="Rodapé" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground md:justify-end">
            <Link to="/blog" className="transition-colors hover:text-foreground">Blog</Link>
            <Link to="/login" className="transition-colors hover:text-foreground">Entrar</Link>
            <a href="/#faq" className="transition-colors hover:text-foreground">FAQ</a>
            <Link to="/politica-de-privacidade" className="transition-colors hover:text-foreground">
              Política de Privacidade
            </Link>
            <Link to="/termos-de-servico" className="transition-colors hover:text-foreground">
              Termos de Serviço
            </Link>
            <span>{copyrightText}</span>
          </nav>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-[11px] leading-relaxed text-muted-foreground/80">
          O Método ProMetric® foi desenvolvido com base em referências científicas e protocolos
          reconhecidos de avaliação física, ampliados com tecnologia, automação e inteligência
          artificial.
        </p>
      </div>
    </footer>
  );
}
