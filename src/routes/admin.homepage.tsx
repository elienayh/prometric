import { createFileRoute } from "@tanstack/react-router";
import { useIsPlatformAdmin } from "@/hooks/use-admin";
import { HomepageVisualEditor } from "@/components/admin/homepage-visual-editor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/homepage")({
  component: AdminHomepagePage,
});

function AdminHomepagePage() {
  const { isSuperAdmin, isLoading } = useIsPlatformAdmin();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Apenas Super Admin tem permissão para alterar a Home pública
  if (!isSuperAdmin) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Acesso Exclusivo Super Admin</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O editor visual e publicação da página inicial do sistema é restrito a administradores com papel de Super Admin.
        </p>
        <div className="mt-6">
          <Link to="/admin/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return <HomepageVisualEditor />;
}
