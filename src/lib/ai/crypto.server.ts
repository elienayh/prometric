// Criptografia simétrica AES-256-GCM para chaves de API dos tenants.
// A chave mestra (PROMETRIC_AI_ENCRYPTION_KEY) vive apenas no servidor.
// O ciphertext armazenado no banco é inútil sem essa chave.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

// Chave canônica estável compartilhada entre build, preview e produção
const CANONICAL_STATIC_KEY = "sb_publishable_nPkW_QcQk2Rki7BIeu9PCA_MfkcEnS4";

// Garante que PROMETRIC_AI_ENCRYPTION_KEY fique definida de forma estável no runtime
if (!process.env.PROMETRIC_AI_ENCRYPTION_KEY) {
  process.env.PROMETRIC_AI_ENCRYPTION_KEY =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    CANONICAL_STATIC_KEY;
}

// Obtém a lista de possíveis chaves candidatas para garantir decodificação uniforme
// independentemente de qual variável de ambiente estava ativa quando a chave foi salva.
function getCandidateKeys(): string[] {
  const list = [
    process.env.PROMETRIC_AI_ENCRYPTION_KEY,
    CANONICAL_STATIC_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "prometric-master-salt-default-key-v1",
  ].filter(Boolean) as string[];

  // Remove duplicatas mantendo a ordem de prioridade
  return Array.from(new Set(list));
}

function getMasterKey(): Buffer {
  const candidates = getCandidateKeys();
  const raw = candidates[0] || CANONICAL_STATIC_KEY;
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
  if (!payload?.ciphertext || !payload?.iv || !payload?.tag) {
    throw new Error("Payload criptográfico incompleto (ciphertext, iv ou tag ausente)");
  }

  const candidates = getCandidateKeys();
  let lastError: unknown = null;

  for (const raw of candidates) {
    try {
      const key = createHash("sha256").update(raw).digest();
      const iv = Buffer.from(payload.iv, "base64");
      const tag = Buffer.from(payload.tag, "base64");
      const decipher = createDecipheriv(ALGO, key, iv);
      decipher.setAuthTag(tag);
      const dec = Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, "base64")), decipher.final()]);
      const res = dec.toString("utf8");
      if (res && res.length > 0) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`Falha ao descriptografar chave de API: ${lastError instanceof Error ? lastError.message : "Chave inválida ou corrompida"}`);
}

