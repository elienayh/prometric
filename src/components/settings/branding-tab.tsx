// Aba de identidade visual nas Configurações (escopo: Tenant).
// Delegamos para o componente genérico BrandingForm.
import { BrandingForm, type BrandingEntity } from "@/components/branding/branding-form";

export function BrandingTab({ tenant }: { tenant: (BrandingEntity & { id: string }) | null }) {
  return (
    <BrandingForm
      entity={tenant}
      scope="tenant"
      table="tenants"
      storageFolder={tenant?.id ?? "tenant"}
      hint="Identidade visual padrão da conta. Aplicada quando Escolas ou Grupos não possuem branding próprio."
    />
  );
}
