import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { O as Save, Q as Image, c as Upload, n as X, q as LoaderCircle } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as resolveLogoUrl, t as DEFAULT_BRANDING } from "./branding-B47KYsR4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/branding-form-DHLCxdw7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BrandingForm({ entity, scope, table, storageFolder, invalidateKeys = [], hint }) {
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)({
		display_name: "",
		primary_color: "",
		secondary_color: "",
		description: "",
		website: "",
		email: "",
		phone: ""
	});
	const [logoPath, setLogoPath] = (0, import_react.useState)(null);
	const [logoPreview, setLogoPreview] = (0, import_react.useState)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!entity) return;
		setForm({
			display_name: entity.display_name ?? "",
			primary_color: entity.primary_color ?? "",
			secondary_color: entity.secondary_color ?? "",
			description: entity.description ?? "",
			website: entity.website ?? "",
			email: entity.email ?? "",
			phone: entity.phone ?? ""
		});
		setLogoPath(entity.logo_url ?? null);
		resolveLogoUrl(entity.logo_url ?? null).then(setLogoPreview);
	}, [entity?.id]);
	const showContact = scope === "tenant";
	const save = useMutation({
		mutationFn: async () => {
			if (!entity) throw new Error("Sem entidade");
			const patch = {
				display_name: form.display_name.trim() || null,
				primary_color: form.primary_color.trim() || null,
				secondary_color: form.secondary_color.trim() || null,
				description: form.description.trim() || null,
				logo_url: logoPath
			};
			if (showContact) {
				patch.website = form.website.trim() || null;
				patch.email = form.email.trim() || null;
				patch.phone = form.phone.trim() || null;
			}
			const { error } = await supabase.from(table).update(patch).eq("id", entity.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Identidade visual atualizada");
			qc.invalidateQueries({ queryKey: ["my-memberships"] });
			for (const k of invalidateKeys) qc.invalidateQueries({ queryKey: k });
		},
		onError: (e) => toast.error(e.message ?? "Erro ao salvar")
	});
	async function handleFile(f) {
		if (!entity) return;
		if (![
			"image/png",
			"image/jpeg",
			"image/svg+xml",
			"image/webp"
		].includes(f.type)) {
			toast.error("Formato inválido. Use PNG, JPG, SVG ou WEBP.");
			return;
		}
		if (f.size > 2 * 1024 * 1024) {
			toast.error("Imagem deve ter no máximo 2 MB");
			return;
		}
		setUploading(true);
		try {
			const ext = f.name.split(".").pop() ?? "png";
			const path = `${storageFolder}/logo-${Date.now()}.${ext}`;
			const { error } = await supabase.storage.from("branding").upload(path, f, {
				upsert: true,
				cacheControl: "3600"
			});
			if (error) throw error;
			setLogoPath(path);
			setLogoPreview(await resolveLogoUrl(path));
			toast.success("Logo enviado — clique em Salvar para aplicar");
		} catch (e) {
			toast.error(e.message ?? "Falha no upload");
		} finally {
			setUploading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-gradient-card p-6 shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Identidade Visual"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: hint ?? "Personalize logo, cores e descrição. Campos vazios herdam automaticamente do nível superior."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-[160px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Logo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-32 w-32 place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-card",
							children: logoPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: logoPreview,
								alt: "Logo",
								className: "h-full w-full object-contain"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-8 w-8 text-muted-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => fileRef.current?.click(),
								disabled: uploading,
								children: [uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-3 w-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1 h-3 w-3" }), "Enviar"]
							}), logoPath && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => {
									setLogoPath(null);
									setLogoPreview(null);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 h-3 w-3" }), " Remover"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileRef,
							type: "file",
							accept: "image/png,image/jpeg,image/svg+xml,image/webp",
							className: "hidden",
							onChange: (e) => {
								const f = e.target.files?.[0];
								if (f) handleFile(f);
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground",
							children: "PNG, JPG, SVG ou WEBP. Até 2 MB."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nome exibido",
							placeholder: entity?.name ?? DEFAULT_BRANDING.displayName,
							value: form.display_name,
							onChange: (v) => setForm({
								...form,
								display_name: v
							})
						}),
						showContact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Site",
								placeholder: DEFAULT_BRANDING.website,
								value: form.website,
								onChange: (v) => setForm({
									...form,
									website: v
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "E-mail institucional",
								placeholder: DEFAULT_BRANDING.email,
								value: form.email,
								onChange: (v) => setForm({
									...form,
									email: v
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Telefone",
								placeholder: "(11) 99999-0000",
								value: form.phone,
								onChange: (v) => setForm({
									...form,
									phone: v
								})
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
							label: "Cor principal",
							placeholder: DEFAULT_BRANDING.primaryColor,
							value: form.primary_color,
							onChange: (v) => setForm({
								...form,
								primary_color: v
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
							label: "Cor secundária",
							placeholder: DEFAULT_BRANDING.secondaryColor,
							value: form.secondary_color,
							onChange: (v) => setForm({
								...form,
								secondary_color: v
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Descrição"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								placeholder: DEFAULT_BRANDING.description,
								value: form.description,
								onChange: (e) => setForm({
									...form,
									description: e.target.value
								}),
								className: "mt-1"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => save.mutate(),
					disabled: save.isPending,
					className: "bg-gradient-brand text-primary-foreground",
					children: [save.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-1 h-3.5 w-3.5" }), "Salvar identidade"]
				})
			})
		]
	});
}
function Field({ label, value, onChange, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		className: "text-xs",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		className: "mt-1",
		value,
		onChange: (e) => onChange(e.target.value),
		placeholder
	})] });
}
function ColorField({ label, value, onChange, placeholder }) {
	const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : placeholder ?? "#6366f1";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		className: "text-xs",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1 flex gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "color",
			value: hex,
			onChange: (e) => onChange(e.target.value),
			className: "h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder,
			className: "flex-1 font-mono text-xs uppercase"
		})]
	})] });
}
//#endregion
export { BrandingForm as t };
