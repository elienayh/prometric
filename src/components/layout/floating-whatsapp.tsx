import React, { useState } from "react";
import { X, Send, UserCheck, ShieldCheck, Clock, CheckCheck, Sparkles, MessageCircle } from "lucide-react";
import type { HomePageConfig } from "@/lib/homepage-cms";

interface FloatingWhatsAppChatProps {
  whatsapp?: HomePageConfig["whatsapp"];
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.65 3.742-.983zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

const QUICK_OPTIONS = [
  "Quero conhecer os planos do ProMetric",
  "Gostaria de agendar uma demonstração",
  "Tenho dúvidas sobre o método de avaliação",
];

export function FloatingWhatsAppChat({ whatsapp }: FloatingWhatsAppChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");

  if (!whatsapp?.enabled) return null;

  const rawNumber = (whatsapp.phoneNumber || "").replace(/\D/g, "");
  const defaultText = whatsapp.defaultMessage || "Olá! Gostaria de saber mais sobre o ProMetric.";
  const displayPhone = whatsapp.phoneNumber || "+55 (11) 99999-9999";

  const handleStartChat = (messageToSend?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalMessage = messageToSend || customMsg.trim() || defaultText;
    const encoded = encodeURIComponent(finalMessage);
    const url = rawNumber
      ? `https://wa.me/${rawNumber}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <aside
      aria-label="Atendimento via WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none animate-fade-in"
    >
      {/* Janela Flutuante de Atendimento (Chat Pop-up) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Janela de Atendimento ProMetric"
          className="mb-3 w-[360px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Header do Chat */}
          <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/20 font-bold text-white shadow-inner">
                  <UserCheck className="h-6 w-6 text-white" />
                  {/* Status Indicator: Atendente Online */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-emerald-700 bg-emerald-400 shadow"
                    title="Atendente Online"
                  >
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold leading-tight">
                    <span>Equipe ProMetric®</span>
                    <span title="Canal Oficial Verificado">
                      <ShieldCheck className="h-4 w-4 text-emerald-200" />
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium mt-0.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
                    <span>Atendente disponível agora</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Fechar janela de atendimento"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-100/90 bg-emerald-800/40 rounded-lg px-2.5 py-1 backdrop-blur-xs">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Tempo de resposta estimado: <strong>menos de 2 minutos</strong></span>
            </div>
          </div>

          {/* Corpo / Conversa */}
          <div className="space-y-3.5 bg-muted/20 p-4 max-h-[420px] overflow-y-auto">
            {/* Mensagem do Atendente */}
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold border border-emerald-500/20 shadow-xs">
                PM
              </div>
              <div className="space-y-1.5 rounded-2xl rounded-tl-sm border border-border/60 bg-card p-3.5 shadow-sm text-foreground">
                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Consultor Especialista
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    Online agora <CheckCheck className="h-3 w-3 text-emerald-500" />
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  Olá! 👋 Nosso time está online e disponível para tirar suas dúvidas sobre a plataforma{" "}
                  <strong>ProMetric®</strong>, apresentar funcionalidades ou preparar uma proposta sob medida.
                </p>
                <p className="text-[11px] text-muted-foreground pt-1">
                  Como podemos ajudar você hoje?
                </p>
              </div>
            </div>

            {/* Sugestões Rápidas de Mensagem */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-1">
                Perguntas Frequentes:
              </span>
              <div className="flex flex-col gap-1.5">
                {QUICK_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setCustomMsg(opt);
                      handleStartChat(opt);
                    }}
                    className="flex items-center justify-between text-left rounded-xl border border-border/80 bg-background/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/50 px-3 py-2 text-[11px] text-foreground font-medium transition-colors group cursor-pointer shadow-2xs"
                  >
                    <span>{opt}</span>
                    <Sparkles className="h-3 w-3 text-emerald-600 opacity-60 group-hover:opacity-100 shrink-0 ml-1 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Número / Canal Oficial */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-center text-[11px] text-emerald-800 dark:text-emerald-300">
              <span>Canal Oficial de Atendimento: </span>
              <strong className="tracking-wide font-mono text-xs">{displayPhone}</strong>
            </div>

            {/* Formulário / Input da Mensagem */}
            <form onSubmit={(e) => handleStartChat(undefined, e)} className="space-y-2 pt-1">
              <div className="relative">
                <textarea
                  rows={2}
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder={defaultText}
                  className="w-full resize-none rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#20ba5a] hover:shadow-lg active:scale-[0.99] cursor-pointer"
              >
                <WhatsAppIcon className="h-4 w-4 fill-white shrink-0" />
                <span>Conversar com Atendente no WhatsApp</span>
                <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botão Flutuante (Trigger) com Ícone Oficial do WhatsApp */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fechar chat de atendimento" : "Abrir atendimento via WhatsApp (atendente disponível)"}
        className="group relative flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#20ba5a] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 cursor-pointer"
      >
        {/* Badge Pulsante de Atendente Disponível */}
        <span className="relative flex h-3.5 w-3.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-white" />
        </span>

        {/* Ícone Oficial do WhatsApp ou X para Fechar */}
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-200" />
          ) : (
            <WhatsAppIcon className="h-6 w-6 fill-white transition-transform duration-200 group-hover:scale-110" />
          )}
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90 leading-tight">
            WhatsApp
          </span>
          <span className="text-xs font-extrabold leading-tight tracking-tight">
            Atendente Disponível
          </span>
        </div>
      </button>
    </aside>
  );
}
