import process from "node:process";
import { Buffer } from "node:buffer";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/crypto.server-6EGdDl7D.js
var ALGO = "aes-256-gcm";
function getMasterKey() {
	const raw = process.env.PROMETRIC_AI_ENCRYPTION_KEY;
	if (!raw) throw new Error("PROMETRIC_AI_ENCRYPTION_KEY ausente no servidor");
	return createHash("sha256").update(raw).digest();
}
function encryptApiKey(plain) {
	if (!plain || plain.length < 8) throw new Error("Chave de API muito curta");
	const key = getMasterKey();
	const iv = randomBytes(12);
	const cipher = createCipheriv(ALGO, key, iv);
	const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return {
		ciphertext: enc.toString("base64"),
		iv: iv.toString("base64"),
		tag: tag.toString("base64"),
		fingerprint: plain.slice(-4)
	};
}
function decryptApiKey(payload) {
	const key = getMasterKey();
	const iv = Buffer.from(payload.iv, "base64");
	const tag = Buffer.from(payload.tag, "base64");
	const decipher = createDecipheriv(ALGO, key, iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, "base64")), decipher.final()]).toString("utf8");
}
//#endregion
export { decryptApiKey, encryptApiKey };
