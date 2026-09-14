import process from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/providers.server-Bkck8fQI.js
var PING_PROMPT = "ok";
async function withTimeout(p, ms = 12e3) {
	return await Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(/* @__PURE__ */ new Error("Timeout após " + ms + "ms")), ms))]);
}
async function pingProvider(provider, apiKey, model) {
	const start = Date.now();
	try {
		switch (provider) {
			case "openai":
				await withTimeout(pingOpenAI(apiKey, model));
				break;
			case "xai":
				await withTimeout(pingXai(apiKey, model));
				break;
			case "google":
				await withTimeout(pingGoogle(apiKey, model));
				break;
			case "anthropic":
				await withTimeout(pingAnthropic(apiKey, model));
				break;
			case "lovable":
				await withTimeout(pingLovable(model));
				break;
		}
		return {
			ok: true,
			latencyMs: Date.now() - start
		};
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		return {
			ok: false,
			latencyMs: Date.now() - start,
			error: message
		};
	}
}
async function pingOpenAI(apiKey, model) {
	const res = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model,
			max_tokens: 5,
			messages: [{
				role: "user",
				content: PING_PROMPT
			}]
		})
	});
	if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
async function pingXai(apiKey, model) {
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model,
			max_tokens: 5,
			messages: [{
				role: "user",
				content: PING_PROMPT
			}]
		})
	});
	if (!res.ok) throw new Error(`xAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
async function pingGoogle(apiKey, model) {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents: [{ parts: [{ text: PING_PROMPT }] }],
			generationConfig: { maxOutputTokens: 5 }
		})
	});
	if (!res.ok) throw new Error(`Google ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
async function pingAnthropic(apiKey, model) {
	const res = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01"
		},
		body: JSON.stringify({
			model,
			max_tokens: 5,
			messages: [{
				role: "user",
				content: PING_PROMPT
			}]
		})
	});
	if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
async function pingLovable(model) {
	const key = process.env.LOVABLE_API_KEY;
	if (!key) throw new Error("LOVABLE_API_KEY ausente no servidor");
	const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Lovable-API-Key": key
		},
		body: JSON.stringify({
			model,
			max_tokens: 5,
			messages: [{
				role: "user",
				content: PING_PROMPT
			}]
		})
	});
	if (!res.ok) throw new Error(`Lovable AI ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
//#endregion
export { pingProvider };
