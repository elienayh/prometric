// Criptografia simétrica AES-256-GCM para chaves de API dos tenants.
// A chave mestra (PROMETRIC_AI_ENCRYPTION_KEY) reside exclusivamente no servidor via variáveis de ambiente.
// O ciphertext armazenado no banco é inútil sem a chave secreta de ambiente.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getServerEnv, getRequiredServerEnv } from "@/lib/server-env";

const ALGO = "aes-256-gcm";

/**
 * Obtém a chave mestra primária para criptografia e descriptografia.
 * Obtida exclusivamente da variável de ambiente PROMETRIC_AI_ENCRYPTION_KEY.
 */
function getPrimaryMasterKey(): Buffer {
  const raw = getRequiredServerEnv(
    "PROMETRIC_AI_ENCRYPTION_KEY",
    "Variável de ambiente PROMETRIC_AI_ENCRYPTION_KEY não configurada no servidor.",
  );
  return createHash("sha256").update(raw).digest();
}

/**
 * Retorna as chaves candidatas para descriptografia.
 * Sempre testa a chave mestra primária (PROMETRIC_AI_ENCRYPTION_KEY).
 * Se configurada no ambiente para migração legada, testa também PROMETRIC_AI_LEGACY_DECRYPT_KEY.
 * Nenhuma chave é mantida hardcoded no código.
 */
function getDecryptionKeys(): Buffer[] {
  const keys: Buffer[] = [getPrimaryMasterKey()];

  // Compatibilidade legada opcional obtida estritamente de variável de ambiente (secret)
  const legacySecret = getServerEnv("PROMETRIC_AI_LEGACY_DECRYPT_KEY");
  if (legacySecret && legacySecret.trim().length > 0) {
    const legacyKey = createHash("sha256").update(legacySecret.trim()).digest();
    if (!legacyKey.equals(keys[0])) {
      keys.push(legacyKey);
    }
  }

  return keys;
}

export type EncryptedPayload = {
  ciphertext: string;  // base64
  iv: string;          // base64
  tag: string;         // base64
  fingerprint: string; // últimos 4 chars da chave (para exibição segura na UI: "••••abcd")
};

/**
 * Criptografa uma chave de API utilizando AES-256-GCM com a chave mestra primária.
 */
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

/**
 * Descriptografa uma credencial de API utilizando as chaves autorizadas do ambiente.
 */
export function decryptApiKey(payload: { ciphertext: string; iv: string; tag: string }): string {
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const ct = Buffer.from(payload.ciphertext, "base64");

  const candidates = getDecryptionKeys();
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

  throw (
    lastErr ??
    new Error(
      "Falha ao descriptografar chave de API. Verifique a configuração de PROMETRIC_AI_ENCRYPTION_KEY no ambiente.",
    )
  );
}
