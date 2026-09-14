// Catálogo client-safe de provedores e modelos homologados pelo ProMetric.
// Importável tanto pelo frontend quanto pelo backend.

export type ProviderId = "openai" | "google" | "anthropic" | "xai" | "lovable";

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  openai: "gpt-5-mini",
  google: "gemini-2.5-flash",
  anthropic: "claude-3-5-haiku-20241022",
  xai: "grok-3-mini",
  lovable: "google/gemini-3-flash-preview",
};

export const HOMOLOGATED_MODELS: Record<ProviderId, { id: string; label: string }[]> = {
  openai: [
    { id: "gpt-5", label: "GPT-5 (premium)" },
    { id: "gpt-5-mini", label: "GPT-5 Mini (recomendado)" },
    { id: "gpt-5-nano", label: "GPT-5 Nano (econômico)" },
  ],
  google: [
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (premium)" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (recomendado)" },
    { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (econômico)" },
  ],
  anthropic: [
    { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (premium)" },
    { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (recomendado)" },
  ],
  xai: [
    { id: "grok-3", label: "Grok 3 (premium)" },
    { id: "grok-3-mini", label: "Grok 3 Mini (recomendado)" },
  ],
  lovable: [{ id: "google/gemini-3-flash-preview", label: "ProMetric AI (padrão)" }],
};

export const VALID_PROVIDERS: ReadonlyArray<ProviderId> = [
  "openai",
  "google",
  "anthropic",
  "xai",
  "lovable",
];
