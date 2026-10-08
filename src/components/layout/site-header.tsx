import { Link } from "@tanstack/react-router";
import { PrometricIcon } from "@/components/brand/prometric-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="ProMetric — página inicial">
          <PrometricIcon className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-tight">
            Pro<span className="text-gradient-brand">Metric</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="/#o-que-e" className="transition-colors hover:text-foreground">O que é</a>
          <a href="/#metodo" className="transition-colors hover:text-foreground">Método</a>
          <a href="/#como-funciona" className="transition-colors hover:text-foreground">Como funciona</a>
          <Link to="/blog" className="transition-colors hover:text-foreground">Blog</Link>
          <a href="/#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/register">Criar conta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
