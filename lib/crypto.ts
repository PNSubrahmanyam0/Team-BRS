import { createCipheriv, randomBytes } from "node:crypto";

/**
 * Encrypts the optional employee ID before persistence. The key must be a
 * server-only 32-byte base64 secret managed through the deployment secret
 * store. Ciphertext format: version:iv:tag:ciphertext (all base64url).
 */
export function encryptEmployeeId(value: string) {
  const encodedKey = process.env.EMPLOYEE_ID_ENCRYPTION_KEY;
  if (!encodedKey) {
    throw new Error("Employee ID encryption is not configured.");
  }
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) {
    throw new Error("EMPLOYEE_ID_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(":");
}
