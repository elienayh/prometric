import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { At as Camera, D as ScanLine, St as CircleCheck, at as FileText, c as Upload, n as X, p as Trash2, q as LoaderCircle, t as Zap, u as TriangleAlert, y as Sparkles, zt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
import { t as createSsrRpc } from "./createSsrRpc-p5Uzme7Q.mjs";
import { a as calcRce, i as calcImc, o as classifyAll, r as ageFromBirth } from "./proesp-DU2T_E5l.mjs";
import { t as useCurrentTenant } from "./use-tenant-DeOpwhLy.mjs";
import { n as PageHeader } from "./page-header-BgOgZloR.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { n as OCR_FIELD_KEYS, r as OCR_FIELD_LABEL } from "./ocr-schema-DZV00ptb.mjs";
import { t as require_jsQR } from "../_libs/jsqr.mjs";
import { n as getDocument, t as GlobalWorkerOptions } from "../_libs/pdfjs-dist.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/evaluations.import-DUBzxMoD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jsQR = /* @__PURE__ */ __toESM(require_jsQR());
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = import_react.useState(void 0);
	import_react.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
function CameraScanner({ open, onClose, onCapture }) {
	const videoRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const rafRef = (0, import_react.useRef)(null);
	const stableHitsRef = (0, import_react.useRef)(0);
	const lastTokenRef = (0, import_react.useRef)(null);
	const capturingRef = (0, import_react.useRef)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [detected, setDetected] = (0, import_react.useState)(null);
	const stop = (0, import_react.useCallback)(() => {
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
	const captureNow = (0, import_react.useCallback)(() => {
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
		canvas.toBlob((blob) => {
			if (!blob) {
				capturingRef.current = false;
				return;
			}
			const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
			stop();
			onCapture(file);
		}, "image/jpeg", .92);
	}, [onCapture, stop]);
	const tick = (0, import_react.useCallback)(() => {
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
		const scale = Math.min(1, 800 / Math.max(w, h));
		canvas.width = Math.round(w * scale);
		canvas.height = Math.round(h * scale);
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const code = (0, import_jsQR.default)(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: "dontInvert" });
		if (code?.data?.startsWith("PM1.")) {
			if (lastTokenRef.current === code.data) stableHitsRef.current += 1;
			else {
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
	(0, import_react.useEffect)(() => {
		if (!open) return;
		let cancelled = false;
		(async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: { ideal: "environment" },
						width: { ideal: 1920 },
						height: { ideal: 1080 }
					},
					audio: false
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
				toast.error(err instanceof Error && err.name === "NotAllowedError" ? "Permissão de câmera negada" : "Não foi possível abrir a câmera neste dispositivo");
				onClose();
			}
		})();
		return () => {
			cancelled = true;
			stop();
		};
	}, [
		open,
		tick,
		onClose,
		stop
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => !v && (stop(), onClose()),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl p-0 sm:rounded-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
					className: "border-b border-border p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2 text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-4 w-4" }), " Escanear ficha"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative bg-black",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: videoRef,
							playsInline: true,
							muted: true,
							className: "aspect-[3/4] w-full object-cover sm:aspect-video"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-6 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute left-0 right-0 top-3 text-center text-xs font-medium text-white drop-shadow",
							children: !ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-black/50 px-3 py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), " Abrindo câmera…"]
							}) : detected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-3 w-3" }), " Ficha detectada — segure firme…"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-black/50 px-3 py-1",
								children: "Enquadre o QR Code da ficha"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => (stop(), onClose()),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 h-4 w-4" }), " Cancelar"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: captureNow,
						disabled: !ready,
						className: "bg-gradient-brand text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-1 h-4 w-4" }), " Capturar agora"]
					})]
				})
			]
		})
	});
}
var MAX_DIM = 2e3;
var MAX_SHEETS = 12;
var PREVIEW_DATAURL_MAX = 320;
async function loadImageFromFile(file) {
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		img.crossOrigin = "anonymous";
		await new Promise((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(/* @__PURE__ */ new Error("Falha ao carregar imagem"));
			img.src = url;
		});
		return img;
	} finally {
		setTimeout(() => URL.revokeObjectURL(url), 3e4);
	}
}
function drawToCanvas(img, maxDim) {
	const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
	const w = Math.max(1, Math.round(img.naturalWidth * ratio));
	const h = Math.max(1, Math.round(img.naturalHeight * ratio));
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas indisponível neste navegador");
	ctx.drawImage(img, 0, 0, w, h);
	return canvas;
}
async function decodeSheetsInImage(file) {
	const canvas = drawToCanvas(await loadImageFromFile(file), MAX_DIM);
	const hits = findAllQRs(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height));
	if (hits.length === 0) throw new Error("Nenhum QR Code encontrado na imagem");
	const seen = /* @__PURE__ */ new Set();
	return hits.filter((h) => {
		if (seen.has(h.token)) return false;
		seen.add(h.token);
		return true;
	}).map((hit) => cropSheetAroundQR(canvas, hit));
}
function findAllQRs(imageData) {
	const hits = [];
	const work = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
	for (let i = 0; i < MAX_SHEETS; i++) {
		const code = (0, import_jsQR.default)(work.data, work.width, work.height, { inversionAttempts: "attemptBoth" });
		if (!code?.data) break;
		const token = code.data.trim();
		const loc = code.location;
		const xs = [
			loc.topLeftCorner.x,
			loc.topRightCorner.x,
			loc.bottomLeftCorner.x,
			loc.bottomRightCorner.x
		];
		const ys = [
			loc.topLeftCorner.y,
			loc.topRightCorner.y,
			loc.bottomLeftCorner.y,
			loc.bottomRightCorner.y
		];
		const minX = Math.max(0, Math.min(...xs));
		const maxX = Math.min(work.width, Math.max(...xs));
		const minY = Math.max(0, Math.min(...ys));
		const maxY = Math.min(work.height, Math.max(...ys));
		const w = Math.max(1, maxX - minX);
		const h = Math.max(1, maxY - minY);
		if (token.startsWith("PM1.")) hits.push({
			token,
			cx: (minX + maxX) / 2,
			cy: (minY + maxY) / 2,
			qrSize: (w + h) / 2,
			bbox: {
				x: minX,
				y: minY,
				w,
				h
			}
		});
		maskRect(work, minX - w * .3, minY - h * .3, w * 1.6, h * 1.6);
	}
	return hits;
}
function maskRect(img, x, y, w, h) {
	const x0 = Math.max(0, Math.floor(x));
	const y0 = Math.max(0, Math.floor(y));
	const x1 = Math.min(img.width, Math.ceil(x + w));
	const y1 = Math.min(img.height, Math.ceil(y + h));
	for (let py = y0; py < y1; py++) {
		let idx = (py * img.width + x0) * 4;
		for (let px = x0; px < x1; px++) {
			img.data[idx] = 255;
			img.data[idx + 1] = 255;
			img.data[idx + 2] = 255;
			img.data[idx + 3] = 255;
			idx += 4;
		}
	}
}
function cropSheetAroundQR(srcCanvas, hit) {
	const qr = hit.qrSize;
	const pageW = qr * (210 / 32);
	const pageH = qr * (297 / 32);
	const qrRightInset = 28 / 210;
	const qrTopOffset = 24 / 297;
	const pageRight = hit.cx + pageW * qrRightInset;
	const pageTop = hit.cy - pageH * qrTopOffset;
	const pageLeft = pageRight - pageW;
	const pageBottom = pageTop + pageH;
	const pad = .02;
	const sx = Math.max(0, Math.floor(pageLeft - pageW * pad));
	const sy = Math.max(0, Math.floor(pageTop - pageH * pad));
	const ex = Math.min(srcCanvas.width, Math.ceil(pageRight + pageW * pad));
	const ey = Math.min(srcCanvas.height, Math.ceil(pageBottom + pageH * pad));
	const sw = Math.max(1, ex - sx);
	const sh = Math.max(1, ey - sy);
	const out = document.createElement("canvas");
	out.width = sw;
	out.height = sh;
	out.getContext("2d").drawImage(srcCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
	const imageBase64 = out.toDataURL("image/jpeg", .85).split(",")[1] ?? "";
	const pratio = Math.min(1, PREVIEW_DATAURL_MAX / Math.max(sw, sh));
	const pw = Math.max(1, Math.round(sw * pratio));
	const ph = Math.max(1, Math.round(sh * pratio));
	const pcv = document.createElement("canvas");
	pcv.width = pw;
	pcv.height = ph;
	pcv.getContext("2d").drawImage(out, 0, 0, pw, ph);
	const previewDataUrl = pcv.toDataURL("image/jpeg", .7);
	return {
		token: hit.token,
		imageBase64,
		mime: "image/jpeg",
		width: sw,
		height: sh,
		previewDataUrl
	};
}
GlobalWorkerOptions.workerSrc = "/assets/pdf.worker-DTrjDNvb.mjs";
var RENDER_SCALE = 2;
var MAX_PAGES = 20;
async function rasterizePdfToImages(file) {
	const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
	const total = Math.min(pdf.numPages, MAX_PAGES);
	const out = [];
	for (let i = 1; i <= total; i++) {
		const page = await pdf.getPage(i);
		const viewport = page.getViewport({ scale: RENDER_SCALE });
		const canvas = document.createElement("canvas");
		canvas.width = Math.ceil(viewport.width);
		canvas.height = Math.ceil(viewport.height);
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Canvas indisponível para renderizar PDF");
		await page.render({
			canvasContext: ctx,
			viewport
		}).promise;
		const blob = await new Promise((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("Falha ao gerar imagem da página")), "image/png"));
		out.push(new File([blob], `${file.name.replace(/\.pdf$/i, "")}-p${i}.png`, { type: "image/png" }));
	}
	return out;
}
function isPdfFile(file) {
	return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}
var ocrSheetImage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.token?.startsWith("PM1.")) throw new Error("Token de ficha inválido");
	if (!data.imageBase64 || data.imageBase64.length < 200) throw new Error("Imagem inválida ou vazia");
	if (data.imageBase64.length > 85e5) throw new Error("Imagem muito grande (máx ~6 MB)");
	if (![
		"image/jpeg",
		"image/png",
		"image/webp"
	].includes(data.mime)) throw new Error("Formato de imagem não suportado");
	return data;
}).handler(createSsrRpc("aaf53dd3114d355800179ed77b4e41552a506ec2eba41394b7f417b2e9b39195"));
var resolveSheetToken = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.token?.startsWith("PM1.")) throw new Error("Token de ficha inválido");
	return data;
}).handler(createSsrRpc("e7994dafb508e73edf489fca048a2eac0fb340fee4a6332ec1e5fe4131960bca"));
var PAGE_W = 210;
var PAGE_H = 297;
var MARGIN = 12;
var COL_W = (PAGE_W - MARGIN * 2 - 4) / 2;
var ROW_H = 16;
var VBOX_W = 34;
var VBOX_H = ROW_H - 6;
var GRID_Y0 = 78;
function valueBoxMM(index) {
	const col = index % 2;
	const row = Math.floor(index / 2);
	const x = MARGIN + col * 95;
	const cy = GRID_Y0 + row * 18;
	return {
		x: x + COL_W - 38,
		y: cy + 3,
		w: VBOX_W,
		h: VBOX_H
	};
}
function normalize(roi) {
	return {
		x: roi.x / PAGE_W,
		y: roi.y / PAGE_H,
		w: roi.w / PAGE_W,
		h: roi.h / PAGE_H
	};
}
var SHEET_FIELD_ROIS = [
	"weight_kg",
	"height_cm",
	"waist_cm",
	"wingspan_cm",
	"sit_and_reach_cm",
	"abdominal_reps",
	"horizontal_jump_cm",
	"medicine_ball_m",
	"square_test_s",
	"sprint_20m_s",
	"run_6min_m"
].reduce((acc, key, i) => {
	acc[key] = normalize(valueBoxMM(i));
	return acc;
}, {});
var DATE_ROI = normalize({
	x: 167,
	y: 44,
	w: 30,
	h: 9
});
var FIELD_RANGES = {
	weight_kg: {
		min: 20,
		max: 200
	},
	height_cm: {
		min: 100,
		max: 230
	},
	waist_cm: {
		min: 40,
		max: 160
	},
	wingspan_cm: {
		min: 100,
		max: 230
	},
	sit_and_reach_cm: {
		min: -20,
		max: 60
	},
	abdominal_reps: {
		min: 0,
		max: 100
	},
	horizontal_jump_cm: {
		min: 30,
		max: 350
	},
	medicine_ball_m: {
		min: .5,
		max: 15
	},
	square_test_s: {
		min: 4,
		max: 20
	},
	sprint_20m_s: {
		min: 2,
		max: 15
	},
	run_6min_m: {
		min: 300,
		max: 2500
	}
};
/**
* Converte uma ROI em coordenadas de página para coordenadas DENTRO do crop
* gerado por `cropSheetAroundQR`, que adiciona ~2% de padding em cada lado.
*/
function roiInCrop(roi, pad = .02) {
	const scale = 1 / (1 + 2 * pad);
	const off = pad * scale;
	return {
		x: off + roi.x * scale,
		y: off + roi.y * scale,
		w: roi.w * scale,
		h: roi.h * scale
	};
}
function isOutOfRange(key, value) {
	if (value == null || !Number.isFinite(value)) return false;
	const r = FIELD_RANGES[key];
	return value < r.min || value > r.max;
}
/** Carrega um data URL JPEG (output de qr-decode) em um HTMLCanvasElement. */
async function dataUrlToCanvas(dataUrl) {
	const img = new Image();
	await new Promise((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(/* @__PURE__ */ new Error("Falha ao carregar imagem"));
		img.src = dataUrl;
	});
	const canvas = document.createElement("canvas");
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	canvas.getContext("2d").drawImage(img, 0, 0);
	return canvas;
}
/** Recorta uma região normalizada (0..1) do canvas. */
function cropROI(src, roi, upscale = 2) {
	const sx = Math.max(0, Math.floor(roi.x * src.width));
	const sy = Math.max(0, Math.floor(roi.y * src.height));
	const sw = Math.max(1, Math.floor(roi.w * src.width));
	const sh = Math.max(1, Math.floor(roi.h * src.height));
	const out = document.createElement("canvas");
	out.width = Math.max(1, sw * upscale);
	out.height = Math.max(1, sh * upscale);
	const ctx = out.getContext("2d");
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";
	ctx.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);
	return out;
}
/**
* Converte para tons de cinza + aplica threshold de Otsu para binarizar.
* Melhora muito a leitura do Tesseract em manuscritos com sombra leve.
*/
function enhance(canvas) {
	const ctx = canvas.getContext("2d");
	const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = img.data;
	const gray = new Uint8ClampedArray(data.length / 4);
	for (let i = 0, j = 0; i < data.length; i += 4, j++) gray[j] = data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114 | 0;
	const hist = new Array(256).fill(0);
	for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
	const total = gray.length;
	let sum = 0;
	for (let t = 0; t < 256; t++) sum += t * hist[t];
	let sumB = 0, wB = 0, varMax = 0, threshold = 128;
	for (let t = 0; t < 256; t++) {
		wB += hist[t];
		if (wB === 0) continue;
		const wF = total - wB;
		if (wF === 0) break;
		sumB += t * hist[t];
		const mB = sumB / wB;
		const mF = (sum - sumB) / wF;
		const v = wB * wF * (mB - mF) * (mB - mF);
		if (v > varMax) {
			varMax = v;
			threshold = t;
		}
	}
	for (let i = 0, j = 0; i < data.length; i += 4, j++) {
		const v = gray[j] > threshold ? 255 : 0;
		data[i] = data[i + 1] = data[i + 2] = v;
		data[i + 3] = 255;
	}
	ctx.putImageData(img, 0, 0);
	return canvas;
}
var workerPromise = null;
async function getWorker() {
	if (!workerPromise) workerPromise = (async () => {
		const { createWorker } = await import("../_libs/tesseract.js+unenv.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		return await createWorker("eng", 1, {});
	})();
	return workerPromise;
}
function parseNumber(raw) {
	const cleaned = raw.replace(/[^0-9.,-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
	if (!cleaned) return null;
	const n = parseFloat(cleaned);
	return Number.isFinite(n) ? n : null;
}
async function ocrField(canvas, opts = {}) {
	const worker = await getWorker();
	await worker.setParameters({
		tessedit_char_whitelist: opts.allowSlash ? "0123456789,./-" : "0123456789,.-",
		tessedit_pageseg_mode: "7"
	});
	const { data } = await worker.recognize(canvas);
	const raw = (data.text ?? "").trim();
	const conf = Math.max(0, Math.min(1, (data.confidence ?? 0) / 100));
	return {
		value: parseNumber(raw),
		confidence: conf,
		raw
	};
}
async function ocrDate(canvas) {
	const worker = await getWorker();
	await worker.setParameters({
		tessedit_char_whitelist: "0123456789/-.",
		tessedit_pageseg_mode: "7"
	});
	const { data } = await worker.recognize(canvas);
	const raw = (data.text ?? "").trim();
	const conf = Math.max(0, Math.min(1, (data.confidence ?? 0) / 100));
	const m = raw.match(/(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);
	if (!m) return {
		value: null,
		confidence: conf,
		raw
	};
	let [, d, mo, y] = m;
	if (y.length === 2) y = (Number(y) > 70 ? "19" : "20") + y;
	const dd = d.padStart(2, "0");
	const mm = mo.padStart(2, "0");
	const iso = `${y}-${mm}-${dd}`;
	const t = Date.parse(iso);
	if (Number.isNaN(t)) return {
		value: null,
		confidence: conf,
		raw
	};
	return {
		value: iso,
		confidence: conf,
		raw
	};
}
function ImportPage() {
	const { tenantId } = useCurrentTenant();
	const navigate = useNavigate();
	const isMobile = useIsMobile();
	const resolveFn = useServerFn(resolveSheetToken);
	const aiFn = useServerFn(ocrSheetImage);
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [cameraOpen, setCameraOpen] = (0, import_react.useState)(false);
	const [lastSource, setLastSource] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	const studentsList = useQuery({
		queryKey: ["students-lite", tenantId],
		enabled: !!tenantId,
		queryFn: async () => {
			const { data, error } = await supabase.from("students").select("id, full_name, sex, birth_date, class_id, group_id, class:classes(name)").eq("tenant_id", tenantId).eq("is_active", true).order("full_name");
			if (error) throw error;
			return data ?? [];
		}
	});
	const changeStudent = (entryId, studentId) => {
		const s = studentsList.data?.find((x) => x.id === studentId);
		if (!s || !tenantId) return;
		setEntries((prev) => prev.map((e) => e.id === entryId ? {
			...e,
			student: {
				studentId: s.id,
				studentName: s.full_name,
				birthDate: s.birth_date,
				sex: s.sex,
				classId: s.class_id,
				groupId: s.group_id,
				className: s.class?.name ?? null,
				tenantId
			}
		} : e));
	};
	const runLocalOCR = (0, import_react.useCallback)(async (entry) => {
		const baseCanvas = await dataUrlToCanvas(entry.decoded.previewDataUrl);
		const full = await dataUrlToCanvas(`data:${entry.decoded.mime};base64,${entry.decoded.imageBase64}`).catch(() => baseCanvas);
		const out = {};
		for (const key of OCR_FIELD_KEYS) {
			const crop = enhance(cropROI(full, roiInCrop(SHEET_FIELD_ROIS[key]), 3));
			try {
				const r = await ocrField(crop);
				out[key] = {
					value: r.value == null ? "" : String(r.value),
					confidence: r.confidence,
					source: "ocr"
				};
			} catch {
				out[key] = {
					value: "",
					confidence: 0,
					source: "ocr"
				};
			}
		}
		return out;
	}, []);
	const tryReadDate = (0, import_react.useCallback)(async (entry) => {
		try {
			return (await ocrDate(enhance(cropROI(await dataUrlToCanvas(`data:${entry.decoded.mime};base64,${entry.decoded.imageBase64}`), roiInCrop(DATE_ROI), 3)))).value;
		} catch {
			return null;
		}
	}, []);
	const addFiles = (0, import_react.useCallback)(async (files, method) => {
		const incoming = Array.from(files);
		const list = [];
		for (const f of incoming) if (isPdfFile(f)) try {
			const pages = await rasterizePdfToImages(f);
			pages.forEach((p) => list.push({
				file: p,
				method: "pdf"
			}));
			if (pages.length > 1) toast.success(`${pages.length} páginas extraídas de "${f.name}"`);
		} catch {
			toast.error(`Não foi possível abrir o PDF "${f.name}"`);
		}
		else if (f.type.startsWith("image/")) list.push({
			file: f,
			method
		});
		if (list.length === 0) {
			toast.error("Selecione PDFs ou imagens (JPG, PNG, WEBP)");
			return;
		}
		for (const { file, method: m } of list) {
			const placeholderId = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`;
			const fallbackUrl = URL.createObjectURL(file);
			const placeholder = {
				id: placeholderId,
				fileName: file.name,
				sheetIndex: 0,
				sheetsInFile: 1,
				previewUrl: fallbackUrl,
				status: "decoding",
				startedAt: Date.now(),
				importMethod: m
			};
			setEntries((prev) => [...prev, placeholder]);
			let decodedList = [];
			try {
				decodedList = await decodeSheetsInImage(file);
			} catch (err) {
				setEntries((prev) => prev.map((e) => e.id === placeholderId ? {
					...e,
					status: "error",
					error: err instanceof Error ? err.message : "Falha ao ler QR"
				} : e));
				continue;
			}
			if (decodedList.length > 1) toast.success(`${decodedList.length} fichas detectadas em "${file.name}"`);
			const expanded = decodedList.map((dec, idx) => ({
				id: `${placeholderId}-${idx}`,
				fileName: file.name,
				sheetIndex: idx,
				sheetsInFile: decodedList.length,
				previewUrl: dec.previewDataUrl,
				status: "ocr",
				decoded: dec,
				startedAt: Date.now(),
				importMethod: m
			}));
			setEntries((prev) => {
				const out = [...prev];
				const i = out.findIndex((e) => e.id === placeholderId);
				if (i >= 0) out.splice(i, 1, ...expanded);
				else out.push(...expanded);
				return out;
			});
			for (const entry of expanded) try {
				const student = await resolveFn({ data: { token: entry.decoded.token } });
				const [fields, isoDate] = await Promise.all([runLocalOCR(entry), tryReadDate(entry)]);
				setEntries((prev) => prev.map((e) => e.id === entry.id ? {
					...e,
					status: "ready",
					student,
					fields,
					evaluatedAt: isoDate ?? "",
					observations: "",
					durationMs: Date.now() - (e.startedAt ?? Date.now())
				} : e));
			} catch (err) {
				setEntries((prev) => prev.map((e) => e.id === entry.id ? {
					...e,
					status: "error",
					error: err instanceof Error ? err.message : "Falha desconhecida"
				} : e));
			}
		}
	}, [
		resolveFn,
		runLocalOCR,
		tryReadDate
	]);
	const onSelect = (e) => {
		if (e.target.files?.length) {
			setLastSource("files");
			addFiles(e.target.files, "photo");
		}
		e.target.value = "";
	};
	const onDrop = (e) => {
		e.preventDefault();
		if (e.dataTransfer.files?.length) {
			setLastSource("files");
			addFiles(e.dataTransfer.files, "photo");
		}
	};
	const onCameraCapture = (0, import_react.useCallback)((file) => {
		setCameraOpen(false);
		setLastSource("camera");
		addFiles([file], "scan");
	}, [addFiles]);
	const updateField = (id, key, value) => {
		setEntries((prev) => prev.map((e) => e.id === id && e.fields ? {
			...e,
			fields: {
				...e.fields,
				[key]: {
					...e.fields[key],
					value,
					source: "manual",
					confidence: 1
				}
			}
		} : e));
	};
	const updateDate = (id, value) => setEntries((prev) => prev.map((e) => e.id === id ? {
		...e,
		evaluatedAt: value
	} : e));
	const updateObs = (id, value) => setEntries((prev) => prev.map((e) => e.id === id ? {
		...e,
		observations: value
	} : e));
	const removeEntry = (id) => setEntries((prev) => {
		const e = prev.find((x) => x.id === id);
		if (e) URL.revokeObjectURL(e.previewUrl);
		return prev.filter((x) => x.id !== id);
	});
	/** Recurso opcional: substitui a leitura pelo OCR da IA configurada no tenant. */
	const aiAssist = useMutation({
		mutationFn: async (entry) => {
			if (!entry.decoded) throw new Error("Imagem indisponível");
			return await aiFn({ data: {
				token: entry.decoded.token,
				imageBase64: entry.decoded.imageBase64,
				mime: entry.decoded.mime
			} });
		},
		onSuccess: (res, entry) => {
			setEntries((prev) => prev.map((e) => {
				if (e.id !== entry.id) return e;
				const fields = { ...e.fields ?? {} };
				for (const k of OCR_FIELD_KEYS) {
					const v = res.ocr.fields[k].value;
					fields[k] = {
						value: v == null ? "" : String(v),
						confidence: res.ocr.fields[k].confidence,
						source: "ai"
					};
				}
				return {
					...e,
					fields,
					evaluatedAt: e.evaluatedAt || res.ocr.evaluated_at || "",
					observations: e.observations || res.ocr.observations || "",
					usedAI: true
				};
			}));
			toast.success(`IA reinterpretou a ficha de ${entry.student?.studentName ?? "aluno"}`);
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao chamar IA")
	});
	const saveOne = useMutation({
		mutationFn: async (entry) => {
			if (!entry.student || !entry.fields || !tenantId) throw new Error("Dados incompletos");
			if (!entry.evaluatedAt) throw new Error("Informe a data da avaliação antes de salvar");
			const numeric = {};
			for (const k of OCR_FIELD_KEYS) {
				const raw = (entry.fields[k].value ?? "").trim();
				if (raw === "") numeric[k] = null;
				else {
					const n = parseFloat(raw.replace(",", "."));
					numeric[k] = Number.isFinite(n) ? n : null;
				}
			}
			const date = entry.evaluatedAt;
			const age = ageFromBirth(entry.student.birthDate, new Date(date));
			const payload = {
				tenant_id: tenantId,
				student_id: entry.student.studentId,
				evaluated_at: date,
				age_years: age
			};
			for (const k of OCR_FIELD_KEYS) payload[k] = numeric[k] ?? null;
			payload.imc = calcImc(payload.weight_kg, payload.height_cm);
			payload.rce = calcRce(payload.waist_cm, payload.height_cm);
			payload.classifications = classifyAll({
				sex: entry.student.sex,
				age,
				weight_kg: payload.weight_kg,
				height_cm: payload.height_cm,
				waist_cm: payload.waist_cm,
				sit_and_reach_cm: payload.sit_and_reach_cm,
				abdominal_reps: payload.abdominal_reps,
				horizontal_jump_cm: payload.horizontal_jump_cm,
				medicine_ball_m: payload.medicine_ball_m,
				square_test_s: payload.square_test_s,
				sprint_20m_s: payload.sprint_20m_s,
				run_6min_m: payload.run_6min_m
			});
			const { data: u0 } = await supabase.auth.getUser();
			if (u0.user?.id) payload.evaluator_id = u0.user.id;
			const { error } = await supabase.from("evaluations").insert(payload);
			if (error) throw error;
			const confidences = OCR_FIELD_KEYS.map((k) => entry.fields[k].confidence);
			const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
			try {
				const { data: u } = await supabase.auth.getUser();
				if (u.user?.id) await supabase.from("audit_logs").insert({
					actor_id: u.user.id,
					actor_email: u.user.email ?? null,
					tenant_id: tenantId,
					action: "evaluation.import",
					entity_type: "evaluation",
					entity_id: entry.student.studentId,
					metadata: {
						method: entry.importMethod ?? "photo",
						avg_confidence: Number(avg.toFixed(3)),
						used_ai: !!entry.usedAI,
						duration_ms: entry.durationMs ?? null
					}
				});
			} catch {}
		},
		onSuccess: (_d, entry) => {
			toast.success(`${entry.student?.studentName ?? "Aluno"} — avaliação salva`, {
				action: lastSource === "camera" ? {
					label: "Escanear próxima",
					onClick: () => setCameraOpen(true)
				} : void 0,
				duration: lastSource === "camera" ? 8e3 : 4e3
			});
			setEntries((prev) => prev.map((e) => e.id === entry.id ? {
				...e,
				status: "saved"
			} : e));
		},
		onError: (err) => {
			const msg = err?.message || err?.details || (typeof err === "string" ? err : "Erro ao salvar");
			toast.error(`Erro ao salvar: ${msg}`);
			console.error("[evaluations.import] save failed", err);
		}
	});
	const progress = (0, import_react.useMemo)(() => {
		if (entries.length === 0) return 0;
		const done = entries.filter((e) => e.status === "ready" || e.status === "saved" || e.status === "error").length;
		return Math.round(done / entries.length * 100);
	}, [entries]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Importar fichas (Modo Prancheta)",
				description: "Pipeline híbrido: o QR identifica o aluno, o OCR tradicional lê campo por campo pelo layout fixo da ficha. A IA do seu espaço é opcional, apenas como apoio.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => navigate({ to: "/evaluations" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1 h-4 w-4" }), " Voltar"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setCameraOpen(true),
						className: cn("group flex items-center gap-4 rounded-2xl border bg-card p-5 text-left shadow-soft transition hover:border-primary/60 hover:shadow-md", isMobile ? "order-1 ring-2 ring-primary/40" : "order-2"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-6 w-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-display text-base font-semibold",
									children: "Escanear fichas"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: isMobile ? "Aponte a câmera para a ficha — captura automática" : "Use a webcam para escanear uma ficha por vez"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "hidden text-[10px] sm:inline-flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mr-1 h-3 w-3" }), " Auto"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onDragOver: (e) => e.preventDefault(),
						onDrop,
						onClick: () => inputRef.current?.click(),
						className: cn("group flex w-full items-center gap-4 rounded-2xl border-2 border-dashed bg-card p-5 text-left shadow-soft transition hover:border-primary/60", isMobile ? "order-2" : "order-1 ring-2 ring-primary/40"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-6 w-6" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-base font-semibold",
								children: "Importar arquivos"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									"PDF, JPG, PNG ou WEBP — arraste aqui ou",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-primary underline-offset-2 group-hover:underline",
										children: "escolha um arquivo"
									}),
									"."
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						type: "file",
						multiple: true,
						accept: "application/pdf,image/jpeg,image/png,image/webp",
						className: "hidden",
						onChange: onSelect
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1 inline h-3 w-3" }),
					"Leitura padrão por ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "OCR tradicional" }),
					" (sem custo de IA). Use o botão",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Interpretar com IA" }),
					" em caso de baixa confiança — usa a IA configurada em",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Configurações → Inteligência Artificial" }),
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraScanner, {
				open: cameraOpen,
				onClose: () => setCameraOpen(false),
				onCapture: onCameraCapture
			}),
			entries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Progresso de leitura" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [progress, "%"] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: progress })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: entries.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetCard, {
					entry: e,
					students: studentsList.data ?? [],
					onChangeStudent: (sid) => changeStudent(e.id, sid),
					onChangeField: (k, v) => updateField(e.id, k, v),
					onChangeDate: (v) => updateDate(e.id, v),
					onChangeObs: (v) => updateObs(e.id, v),
					onSave: () => saveOne.mutate(e),
					onAI: () => aiAssist.mutate(e),
					onRemove: () => removeEntry(e.id),
					saving: saveOne.isPending && saveOne.variables?.id === e.id,
					aiBusy: aiAssist.isPending && aiAssist.variables?.id === e.id
				}, e.id))
			})
		]
	});
}
function SheetCard({ entry, students, onChangeStudent, onChangeField, onChangeDate, onChangeObs, onSave, onAI, onRemove, saving, aiBusy }) {
	const statusLabel = {
		decoding: "Lendo QR Code…",
		ocr: "Lendo campos (OCR local)…",
		ready: "Revisar e salvar",
		saved: "Salva",
		error: "Erro"
	};
	const avgConfidence = (0, import_react.useMemo)(() => {
		if (!entry.fields) return 0;
		const arr = OCR_FIELD_KEYS.map((k) => entry.fields[k].confidence);
		return arr.reduce((a, b) => a + b, 0) / arr.length;
	}, [entry.fields]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl border border-border bg-card p-4 shadow-soft",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 md:grid-cols-[200px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: entry.previewUrl,
						alt: entry.sheetsInFile > 1 ? `${entry.fileName} — ficha ${entry.sheetIndex + 1}/${entry.sheetsInFile}` : entry.fileName,
						className: "aspect-[3/4] w-full rounded-lg border border-border object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: entry.status === "saved" ? "default" : entry.status === "error" ? "destructive" : "secondary",
							className: "gap-1",
							children: [entry.status === "decoding" || entry.status === "ocr" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : entry.status === "saved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }) : entry.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "h-3 w-3" }), statusLabel[entry.status]]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							onClick: onRemove,
							"aria-label": "Remover",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})]
					}),
					entry.fields && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-muted-foreground",
						children: [
							"Confiança média: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [Math.round(avgConfidence * 100), "%"] }),
							entry.usedAI && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "ml-1 text-[10px]",
								children: "IA usada"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [entry.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive",
					children: entry.error
				}), entry.student && entry.fields && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-[240px] space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Aluno avaliado *"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: entry.student.studentId,
									onValueChange: onChangeStudent,
									disabled: entry.status === "saved",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										className: "max-h-72",
										children: students.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: s.id,
											children: [s.full_name, s.class?.name ? ` — ${s.class.name}` : ""]
										}, s.id))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-muted-foreground",
									children: [
										"QR identificou ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: entry.student.studentName }),
										" · você pode trocar o aluno antes de salvar."
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							variant: "outline",
							onClick: onAI,
							disabled: aiBusy || entry.status === "saved",
							className: "gap-1",
							children: [aiBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), "Interpretar com IA"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Data da avaliação *"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: entry.evaluatedAt ?? "",
									onChange: (ev) => onChangeDate(ev.target.value),
									disabled: entry.status === "saved",
									className: cn(!entry.evaluatedAt && "border-amber-400")
								}),
								!entry.evaluatedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-amber-600",
									children: "Não foi possível identificar a data na ficha — informe manualmente."
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: OCR_FIELD_KEYS.map((k) => {
							const f = entry.fields[k];
							const low = f.confidence < .85;
							const numeric = f.value === "" ? null : parseFloat(f.value.replace(",", "."));
							const oor = isOutOfRange(k, Number.isFinite(numeric ?? NaN) ? numeric : null);
							const sourceBadge = f.source === "ai" ? "IA" : f.source === "manual" ? "Manual" : "OCR";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										className: "flex items-center justify-between text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											OCR_FIELD_LABEL[k].label,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: [
													"(",
													OCR_FIELD_LABEL[k].unit,
													")"
												]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[9px] px-1 py-0",
												children: sourceBadge
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: cn("text-[10px]", low ? "text-amber-600" : "text-muted-foreground"),
												children: [Math.round(f.confidence * 100), "%"]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										inputMode: "decimal",
										value: f.value,
										onChange: (ev) => onChangeField(k, ev.target.value),
										disabled: entry.status === "saved",
										className: cn(oor && "border-amber-400 bg-amber-50 dark:bg-amber-950/30", low && !oor && "border-amber-300")
									}),
									oor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-amber-600",
										children: "Valor fora da faixa esperada — confirme."
									})
								]
							}, k);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Observações"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							value: entry.observations ?? "",
							onChange: (ev) => onChangeObs(ev.target.value),
							disabled: entry.status === "saved"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: onSave,
							disabled: entry.status === "saved" || saving || !entry.evaluatedAt,
							className: "bg-gradient-brand text-primary-foreground",
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 h-4 w-4" }), entry.status === "saved" ? "Salva" : "Confirmar e salvar"]
						})
					})
				] })]
			})]
		})
	});
}
//#endregion
export { ImportPage as component };
