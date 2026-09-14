import { t as supabase } from "./client-DYw29LwH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/branding-B47KYsR4.js
var DEFAULT_BRANDING = {
	displayName: "ProMetric",
	primaryColor: "#6366f1",
	secondaryColor: "#10b981",
	description: "Avaliação física inteligente para escolas, clubes e academias.",
	website: "https://prometric.app",
	email: "contato@prometric.app",
	phone: "",
	logoUrl: null
};
/** Pick first non-empty value across the chain. */
function pick(...vals) {
	for (const v of vals) {
		if (v === null || v === void 0) continue;
		if (typeof v === "string" && v.trim() === "") continue;
		return v;
	}
	return null;
}
/** Hierarchical resolver: group > school > tenant > defaults. */
function resolveBrandingChain(group, school, tenant) {
	const logo = pick(group?.logo_url, school?.logo_url, tenant?.logo_url);
	const source = group?.logo_url || group?.primary_color ? "group" : school?.logo_url || school?.primary_color ? "school" : tenant?.logo_url || tenant?.primary_color ? "tenant" : "default";
	return {
		displayName: pick(group?.display_name, group?.name, school?.display_name, school?.name, tenant?.display_name, tenant?.name) ?? DEFAULT_BRANDING.displayName,
		primaryColor: pick(group?.primary_color, school?.primary_color, tenant?.primary_color) ?? DEFAULT_BRANDING.primaryColor,
		secondaryColor: pick(group?.secondary_color, school?.secondary_color, tenant?.secondary_color) ?? DEFAULT_BRANDING.secondaryColor,
		description: pick(group?.description, school?.description, tenant?.description) ?? DEFAULT_BRANDING.description,
		website: pick(tenant?.website) ?? DEFAULT_BRANDING.website,
		email: pick(tenant?.email) ?? DEFAULT_BRANDING.email,
		phone: pick(tenant?.phone) ?? DEFAULT_BRANDING.phone,
		logoUrl: logo,
		source
	};
}
function hexToRgb(hex) {
	const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
	if (!m) return [
		99,
		102,
		241
	];
	const n = parseInt(m[1], 16);
	return [
		n >> 16 & 255,
		n >> 8 & 255,
		n & 255
	];
}
async function resolveLogoUrl(logoPath) {
	if (!logoPath) return null;
	if (/^https?:\/\//i.test(logoPath)) return logoPath;
	const { data, error } = await supabase.storage.from("branding").createSignedUrl(logoPath, 3600);
	if (error || !data?.signedUrl) return null;
	return data.signedUrl;
}
async function fetchImageDataUrl(url) {
	try {
		const res = await fetch(url, { cache: "no-store" });
		if (!res.ok) return null;
		const blob = await res.blob();
		return await new Promise((resolve, reject) => {
			const r = new FileReader();
			r.onload = () => resolve(String(r.result));
			r.onerror = () => reject(r.error);
			r.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}
//#endregion
export { resolveLogoUrl as a, resolveBrandingChain as i, fetchImageDataUrl as n, hexToRgb as r, DEFAULT_BRANDING as t };
