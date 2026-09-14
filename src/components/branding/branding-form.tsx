// Formulário genérico de identidade visual.
// Reutilizado por Tenant, Escola e Grupo. Os campos exibidos dependem da `scope`.
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Loader2, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_BRANDING, resolveLogoUrl } from "@/lib/branding";

export type BrandingScope = "tenant" | "school" | "group";

type FormState = {
  display_name: string;
  primary_color: string;
  secondary_color: string;
  description: string;
  website: string;
  email: string;
  phone: string;
};

export type BrandingEntity = {
  id: string;
  tenant_id?: string;
  name?: string | null;
  display_name?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  logo_url?: string | null;
};

export function BrandingForm({
  entity,
  scope,
  table,
  storageFolder,
  invalidateKeys = [],
  hint,
}: {
  entity: BrandingEntity | null;
  scope: BrandingScope;
  table: "tenants" | "schools" | "groups";
  storageFolder: string; // ex.: `${tenantId}/schools/${schoolId}`
  invalidateKeys?: unknown[][];
  hint?: string;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>({
    display_name: "", primary_color: "", secondary_color: "",
    description: "", website: "", email: "", phone: "",
  });
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!entity) return;
    setForm({
      display_name: entity.display_name ?? "",
      primary_color: entity.primary_color ?? "",
      secondary_color: entity.secondary_color ?? "",
      description: entity.description ?? "",
      website: entity.website ?? "",
      email: entity.email ?? "",
      phone: entity.phone ?? "",
    });
    setLogoPath(entity.logo_url ?? null);
    resolveLogoUrl(entity.logo_url ?? null).then(setLogoPreview);
  }, [entity?.id]);

  const showContact = scope === "tenant"; // contato apenas no Tenant

  const save = useMutation({
    mutationFn: async () => {
      if (!entity) throw new Error("Sem entidade");
      const patch: Record<string, unknown> = {
        display_name: form.display_name.trim() || null,
        primary_color: form.primary_color.trim() || null,
        secondary_color: form.secondary_color.trim() || null,
        description: form.description.trim() || null,
        logo_url: logoPath,
      };
      if (showContact) {
        patch.website = form.website.trim() || null;
        patch.email = form.email.trim() || null;
        patch.phone = form.phone.trim() || null;
      }
      const { error } = await (supabase.from(table) as any).update(patch).eq("id", entity.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Identidade visual atualizada");
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
      for (const k of invalidateKeys) qc.invalidateQueries({ queryKey: k });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar"),
  });

  async function handleFile(f: File) {
    if (!entity) return;
    const allowed = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(f.type)) { toast.error("Formato inválido. Use PNG, JPG, SVG ou WEBP."); return; }
    if (f.size > 2 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 2 MB"); return; }
    setUploading(true);
    try {
      const ext = f.name.split(".").pop() ?? "png";
      const path = `${storageFolder}/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("branding").upload(path, f, { upsert: true, cacheControl: "3600" });
      if (error) throw error;
      setLogoPath(path);
      const url = await resolveLogoUrl(path);
      setLogoPreview(url);
      toast.success("Logo enviado — clique em Salvar para aplicar");
    } catch (e: any) {
      toast.error(e.message ?? "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
      <div className="mb-5">
        <h2 className="font-display text-lg font-semibold">Identidade Visual</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {hint ?? "Personalize logo, cores e descrição. Campos vazios herdam automaticamente do nível superior."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[160px_1fr]">
        <div className="space-y-3">
          <Label className="text-xs">Logo</Label>
          <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-card">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
              Enviar
            </Button>
            {logoPath && (
              <Button size="sm" variant="ghost" onClick={() => { setLogoPath(null); setLogoPreview(null); }}>
                <X className="mr-1 h-3 w-3" /> Remover
              </Button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <p className="text-[10px] text-muted-foreground">PNG, JPG, SVG ou WEBP. Até 2 MB.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome exibido" placeholder={entity?.name ?? DEFAULT_BRANDING.displayName}
            value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} />
          {showContact && (
            <>
              <Field label="Site" placeholder={DEFAULT_BRANDING.website}
                value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
              <Field label="E-mail institucional" placeholder={DEFAULT_BRANDING.email}
                value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Telefone" placeholder="(11) 99999-0000"
                value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </>
          )}
          <ColorField label="Cor principal" placeholder={DEFAULT_BRANDING.primaryColor}
            value={form.primary_color} onChange={(v) => setForm({ ...form, primary_color: v })} />
          <ColorField label="Cor secundária" placeholder={DEFAULT_BRANDING.secondaryColor}
            value={form.secondary_color} onChange={(v) => setForm({ ...form, secondary_color: v })} />
          <div className="sm:col-span-2">
            <Label className="text-xs">Descrição</Label>
            <Textarea
              rows={3}
              placeholder={DEFAULT_BRANDING.description}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-gradient-brand text-primary-foreground">
          {save.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
          Salvar identidade
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ColorField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : (placeholder ?? "#6366f1");
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex gap-2">
        <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 font-mono text-xs uppercase" />
      </div>
    </div>
  );
}
