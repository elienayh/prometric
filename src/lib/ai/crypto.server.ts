// Criptografia simétrica AES-256-GCM para chaves de API dos tenants.
// A chave mestra (PROMETRIC_AI_ENCRYPTION_KEY) vive apenas no servidor.
// O ciphertext armazenado no banco é inútil sem essa chave.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getMasterKey(): Buffer {
  const raw = process.env.PROMETRIC_AI_ENCRYPTION_KEY;
  if (!raw) throw new Error("PROMETRIC_AI_ENCRYPTION_KEY ausente no servidor");
  // Deriva 32 bytes determinísticos a partir do secret (qualquer comprimento).
  return createHash("sha256").update(raw).digest();
}

export type EncryptedPayload = {
  ciphertext: string; // base64
  iv: string;         // base64
  tag: string;        // base64
  fingerprint: string; // últimos 4 chars da chave (para UI: "••••abcd")
};

export function encryptApiKey(plain: string): EncryptedPayload {
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
    fingerprint: plain.slice(-4),
  };
}

export function decryptApiKey(payload: { ciphertext: string; iv: string; tag: string }): string {
  const key = getMasterKey();
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, "base64")), decipher.final()]);
  return dec.toString("utf8");
}
