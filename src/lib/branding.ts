// Identidade visual hierárquica: Tenant → Escola → Grupo → fallback ProMetric.
// Resolver único usado em headers, dashboards, portal do aluno e PDFs.
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_BRANDING = {
  displayName: "ProMetric",
  primaryColor: "#6366f1",   // indigo-500
  secondaryColor: "#10b981", // emerald-500
  description: "Avaliação física inteligente para escolas, clubes e academias.",
  website: "https://prometric.app",
  email: "contato@prometric.app",
  phone: "",
  logoUrl: null as string | null,
} as const;

export type Branding = {
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  logoUrl: string | null;
  source: "group" | "school" | "tenant" | "default";
};

export type BrandingSource = {
  name?: string | null;
  display_name?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  logo_url?: string | null;
} | null | undefined;

/** Pick first non-empty value across the chain. */
function pick<T>(...vals: (T | null | undefined)[]): T | null {
  for (const v of vals) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    return v;
  }
  return null;
}

/** Hierarchical resolver: group > school > tenant > defaults. */
export function resolveBrandingChain(
  group?: BrandingSource,
  school?: BrandingSource,
  tenant?: BrandingSource,
): Branding {
  const logo = pick(group?.logo_url, school?.logo_url, tenant?.logo_url);
  const source: Branding["source"] =
    group?.logo_url || group?.primary_color ? "group"
    : school?.logo_url || school?.primary_color ? "school"
    : tenant?.logo_url || tenant?.primary_color ? "tenant"
    : "default";

  return {
    displayName:
      pick(group?.display_name, group?.name, school?.display_name, school?.name,
           tenant?.display_name, tenant?.name) ?? DEFAULT_BRANDING.displayName,
    primaryColor:
      pick(group?.primary_color, school?.primary_color, tenant?.primary_color) ??
      DEFAULT_BRANDING.primaryColor,
    secondaryColor:
      pick(group?.secondary_color, school?.secondary_color, tenant?.secondary_color) ??
      DEFAULT_BRANDING.secondaryColor,
    description:
      pick(group?.description, school?.description, tenant?.description) ??
      DEFAULT_BRANDING.description,
    website: pick(tenant?.website) ?? DEFAULT_BRANDING.website,
    email:   pick(tenant?.email)   ?? DEFAULT_BRANDING.email,
    phone:   pick(tenant?.phone)   ?? DEFAULT_BRANDING.phone,
    logoUrl: logo,
    source,
  };
}

/** Backwards-compatible single-entity resolver (tenant only). */
export function resolveBranding(t: BrandingSource): Branding {
  return resolveBrandingChain(null, null, t);
}

// hex "#RRGGBB" → [r,g,b]
export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return [99, 102, 241];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Resolve URL pública/assinada a partir do path armazenado no bucket `branding`.
export async function resolveLogoUrl(logoPath: string | null): Promise<string | null> {
  if (!logoPath) return null;
  if (/^https?:\/\//i.test(logoPath)) return logoPath;
  const { data, error } = await supabase.storage.from("branding").createSignedUrl(logoPath, 60 * 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

// Baixa imagem e converte para data URL — necessário para embutir no PDF (jsPDF).
export async function fetchImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
