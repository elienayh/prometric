// Camera scanner — abre a câmera traseira, escaneia QR continuamente
// e captura automaticamente quando detecta uma ficha estável.
// O frame capturado é entregue como File para o pipeline existente.
import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, Loader2, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
};

export function CameraScanner({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const stableHitsRef = useRef(0);
  const lastTokenRef = useRef<string | null>(null);
  const capturingRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
    setDetected(null);
    stableHitsRef.current = 0;
    lastTokenRef.current = null;
    capturingRef.current = false;
  }, []);

  const captureNow = useCallback(() => {
    const video = videoRef.current;
    if (!video || capturingRef.current) return;
    capturingRef.current = true;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      capturingRef.current = false;
      return;
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          capturingRef.current = false;
          return;
        }
        const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
        stop();
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }, [onCapture, stop]);

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const canvas = canvasRef.current;
    // Downscale to keep jsQR fast on mobile
    const scale = Math.min(1, 800 / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(data.data, canvas.width, canvas.height, { inversionAttempts: "dontInvert" });
    if (code?.data?.startsWith("PM1.")) {
      if (lastTokenRef.current === code.data) {
        stableHitsRef.current += 1;
      } else {
        lastTokenRef.current = code.data;
        stableHitsRef.current = 1;
      }
      setDetected(code.data);
      if (stableHitsRef.current >= 4) {
        captureNow();
        return;
      }
    } else {
      stableHitsRef.current = 0;
      setDetected(null);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [captureNow]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setReady(true);
          rafRef.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        toast.error(
          err instanceof Error && err.name === "NotAllowedError"
            ? "Permissão de câmera negada"
            : "Não foi possível abrir a câmera neste dispositivo",
        );
        onClose();
      }
    })();
    return () => {
      cancelled = true;
      stop();
    };
  }, [open, tick, onClose, stop]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && (stop(), onClose())}>
      <DialogContent className="max-w-2xl p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4" /> Escanear ficha
          </DialogTitle>
        </DialogHeader>
        <div className="relative bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="aspect-[3/4] w-full object-cover sm:aspect-video"
          />
          <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          <div className="absolute left-0 right-0 top-3 text-center text-xs font-medium text-white drop-shadow">
            {!ready ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-3 py-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Abrindo câmera…
              </span>
            ) : detected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1">
                <Zap className="h-3 w-3" /> Ficha detectada — segure firme…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-3 py-1">
                Enquadre o QR Code da ficha
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 p-3">
          <Button variant="ghost" size="sm" onClick={() => (stop(), onClose())}>
            <X className="mr-1 h-4 w-4" /> Cancelar
          </Button>
          <Button
            size="sm"
            onClick={captureNow}
            disabled={!ready}
            className="bg-gradient-brand text-primary-foreground"
          >
            <Camera className="mr-1 h-4 w-4" /> Capturar agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
