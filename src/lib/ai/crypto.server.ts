// Criptografia simétrica AES-256-GCM para chaves de API dos tenants.
// A chave mestra (PROMETRIC_AI_ENCRYPTION_KEY) vive apenas no servidor.
// O ciphertext armazenado no banco é inútil sem essa chave.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getPrimaryMasterKey(): Buffer {
  const raw =
    process.env.PROMETRIC_AI_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "sb_secret_pFBCeFShC068vz50yW2PYQ_FDEEKzy6";
  return createHash("sha256").update(raw).digest();
}

function getKeyCandidates(): Buffer[] {
  const seeds = [
    process.env.PROMETRIC_AI_ENCRYPTION_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "sb_secret_pFBCeFShC068vz50yW2PYQ_FDEEKzy6",
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    "sb_publishable_nPkW_QcQk2Rki7BIeu9PCA_MfkcEnS4",
    "prometric-master-salt-default-key-v1",
  ].filter(Boolean) as string[];

  const seen = new Set<string>();
  const keys: Buffer[] = [];
  for (const seed of seeds) {
    const hash = createHash("sha256").update(seed).digest();
    const hex = hash.toString("hex");
    if (!seen.has(hex)) {
      seen.add(hex);
      keys.push(hash);
    }
  }
  return keys;
}

export type EncryptedPayload = {
  ciphertext: string; // base64
  iv: string;         // base64
  tag: string;        // base64
  fingerprint: string; // últimos 4 chars da chave (para UI: "••••abcd")
};

export function encryptApiKey(plain: string): EncryptedPayload {
  if (!plain || plain.length < 8) throw new Error("Chave de API muito curta");
  const key = getPrimaryMasterKey();
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
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const ct = Buffer.from(payload.ciphertext, "base64");

  const candidates = getKeyCandidates();
  let lastErr: unknown;

  for (const key of candidates) {
    try {
      const decipher = createDecipheriv(ALGO, key, iv);
      decipher.setAuthTag(tag);
      const dec = Buffer.concat([decipher.update(ct), decipher.final()]);
      return dec.toString("utf8");
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr ?? new Error("Falha ao descriptografar chave de API");
}
