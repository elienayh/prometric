import process from "node:process";
import { Buffer } from "node:buffer";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/qr-payload.server-FjQi81hR.js
function getKey() {
	const raw = process.env.PROMETRIC_AI_ENCRYPTION_KEY;
	if (!raw) throw new Error("PROMETRIC_AI_ENCRYPTION_KEY ausente no servidor");
	return createHash("sha256").update(raw).digest();
}
function b64url(buf) {
	return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s) {
	const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - s.length % 4);
	return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}
/** Returns a compact string: "PM1.<payload_b64url>.<sig_b64url>" */
function signSheetToken(studentId, tenantId) {
	const payload = {
		v: "v1",
		s: studentId,
		t: tenantId,
		i: Math.floor(Date.now() / 1e3)
	};
	const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
	return `PM1.${body}.${b64url(createHmac("sha256", getKey()).update(body).digest())}`;
}
function verifySheetToken(token) {
	const parts = token.split(".");
	if (parts.length !== 3 || parts[0] !== "PM1") throw new Error("Token de ficha inválido");
	const [, body, sig] = parts;
	const expected = b64url(createHmac("sha256", getKey()).update(body).digest());
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Assinatura da ficha inválida");
	const payload = JSON.parse(b64urlDecode(body).toString("utf8"));
	if (payload.v !== "v1") throw new Error("Versão de ficha não suportada");
	return payload;
}
//#endregion
export { signSheetToken, verifySheetToken };
