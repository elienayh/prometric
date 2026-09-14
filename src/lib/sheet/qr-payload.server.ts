// HMAC signing/verification for printed evaluation sheets.
// QR payload binds a printed sheet to a specific student+tenant.
// Reuses PROMETRIC_AI_ENCRYPTION_KEY as the HMAC secret.

import { createHash, createHmac, timingSafeEqual } from "crypto";

export const SHEET_VERSION = "v1";

export type SheetPayload = {
  v: string;       // version
  s: string;       // studentId
  t: string;       // tenantId
  i: number;       // issued at (epoch sec)
};

function getKey(): Buffer {
  const raw = process.env.PROMETRIC_AI_ENCRYPTION_KEY;
  if (!raw) throw new Error("PROMETRIC_AI_ENCRYPTION_KEY ausente no servidor");
  return createHash("sha256").update(raw).digest();
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

/** Returns a compact string: "PM1.<payload_b64url>.<sig_b64url>" */
export function signSheetToken(studentId: string, tenantId: string): string {
  const payload: SheetPayload = {
    v: SHEET_VERSION,
    s: studentId,
    t: tenantId,
    i: Math.floor(Date.now() / 1000),
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = b64url(createHmac("sha256", getKey()).update(body).digest());
  return `PM1.${body}.${sig}`;
}

export function verifySheetToken(token: string): SheetPayload {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "PM1") throw new Error("Token de ficha inválido");
  const [, body, sig] = parts;
  const expected = b64url(createHmac("sha256", getKey()).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Assinatura da ficha inválida");
  const payload = JSON.parse(b64urlDecode(body).toString("utf8")) as SheetPayload;
  if (payload.v !== SHEET_VERSION) throw new Error("Versão de ficha não suportada");
  return payload;
}
