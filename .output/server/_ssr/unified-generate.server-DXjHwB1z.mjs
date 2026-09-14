import { t as DEFAULT_MODELS } from "./providers-catalog-7OxrGM4p.mjs";
import process from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/unified-generate.server-DXjHwB1z.js
async function resolveTenantModel(supabase, tenantId) {
	const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
	const { data: cred } = await supabaseAdmin.from("tenant_ai_credentials").select("provider, model, is_active, api_key_ciphertext, api_key_iv, api_key_tag, prompt_version").eq("tenant_id", tenantId).maybeSingle();
	const row = cred;
	if (row?.is_active && row.provider !== "lovable" && row.api_key_ciphertext) {
		const { decryptApiKey } = await import("./crypto.server-6EGdDl7D.mjs");
		const apiKey = decryptApiKey({
			ciphertext: row.api_key_ciphertext,
			iv: row.api_key_iv,
			tag: row.api_key_tag
		});
		return {
			provider: row.provider,
			model: row.model,
			apiKey,
			source: "tenant",
			promptVersion: row.prompt_version ?? "v1.0.0"
		};
	}
	const lovableKey = process.env.LOVABLE_API_KEY;
	if (!lovableKey) throw new Error("LOVABLE_API_KEY ausente no servidor");
	return {
		provider: "lovable",
		model: row?.is_active && row.provider === "lovable" ? row.model : DEFAULT_MODELS.lovable,
		apiKey: lovableKey,
		source: "fallback",
		promptVersion: row?.prompt_version ?? "v1.0.0"
	};
}
async function generateJSON(resolved, systemPrompt, userPrompt) {
	const { provider, model, apiKey } = resolved;
	return safeParseJSON(await callProvider(provider, apiKey, model, systemPrompt, userPrompt));
}
function safeParseJSON(raw) {
	const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
	try {
		return JSON.parse(cleaned);
	} catch {
		const match = cleaned.match(/\{[\s\S]*\}/);
		if (match) try {
			return JSON.parse(match[0]);
		} catch {}
		throw new Error("Resposta da IA não é JSON válido");
	}
}
async function callProvider(provider, apiKey, model, system, user) {
	switch (provider) {
		case "openai": return callOpenAICompatible("https://api.openai.com/v1/chat/completions", { Authorization: `Bearer ${apiKey}` }, model, system, user);
		case "xai": return callOpenAICompatible("https://api.x.ai/v1/chat/completions", { Authorization: `Bearer ${apiKey}` }, model, system, user);
		case "lovable": return callOpenAICompatible("https://ai.gateway.lovable.dev/v1/chat/completions", { "Lovable-API-Key": apiKey }, model, system, user);
		case "google": return callGoogle(apiKey, model, system, user);
		case "anthropic": return callAnthropic(apiKey, model, system, user);
	}
}
async function callOpenAICompatible(url, authHeaders, model, system, user) {
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...authHeaders
		},
		body: JSON.stringify({
			model,
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user
			}],
			response_format: { type: "json_object" }
		})
	});
	if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
	if (res.status === 402) throw new Error("Créditos de IA esgotados.");
	if (!res.ok) throw new Error(`Falha na IA (${res.status}): ${(await res.text()).slice(0, 300)}`);
	return (await res.json())?.choices?.[0]?.message?.content ?? "{}";
}
async function callGoogle(apiKey, model, system, user) {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			systemInstruction: { parts: [{ text: system }] },
			contents: [{
				role: "user",
				parts: [{ text: user }]
			}],
			generationConfig: {
				responseMimeType: "application/json",
				temperature: .7
			}
		})
	});
	if (!res.ok) throw new Error(`Falha na IA Google (${res.status}): ${(await res.text()).slice(0, 300)}`);
	return (await res.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
}
async function callAnthropic(apiKey, model, system, user) {
	const res = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01"
		},
		body: JSON.stringify({
			model,
			max_tokens: 2e3,
			system: system + "\n\nIMPORTANTE: responda EXCLUSIVAMENTE em JSON válido, sem markdown.",
			messages: [{
				role: "user",
				content: user
			}]
		})
	});
	if (!res.ok) throw new Error(`Falha na IA Anthropic (${res.status}): ${(await res.text()).slice(0, 300)}`);
	return (await res.json())?.content?.[0]?.text ?? "{}";
}
//#endregion
export { generateJSON, resolveTenantModel };
