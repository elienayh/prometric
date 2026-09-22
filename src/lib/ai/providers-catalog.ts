// Catálogo client-safe de provedores e modelos homologados pelo ProMetric.
// Importável tanto pelo frontend quanto pelo backend.

export type ProviderId = "openai" | "google" | "anthropic" | "xai";

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  google: "gemini-3.1-flash-lite",
  openai: "gpt-5-mini",
  anthropic: "claude-3-5-haiku-20241022",
  xai: "grok-3-mini",
};

export const HOMOLOGATED_MODELS: Record<ProviderId, { id: string; label: string }[]> = {
  google: [
    { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite (recomendado, rápido e estável)" },
    { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash (alta capacidade)" },
  ],
  openai: [
    { id: "gpt-5", label: "GPT-5 (premium)" },
    { id: "gpt-5-mini", label: "GPT-5 Mini (recomendado)" },
    { id: "gpt-5-nano", label: "GPT-5 Nano (econômico)" },
  ],
  anthropic: [
    { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (premium)" },
    { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (recomendado)" },
  ],
  xai: [
    { id: "grok-3", label: "Grok 3 (premium)" },
    { id: "grok-3-mini", label: "Grok 3 Mini (recomendado)" },
  ],
};

export const VALID_PROVIDERS: ReadonlyArray<ProviderId> = [
  "google",
  "openai",
  "anthropic",
  "xai",
];
