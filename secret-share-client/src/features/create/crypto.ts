import { strToU8, zlibSync } from 'fflate';

/**
 * Client-side encryption for the create flow.
 *
 * Ported verbatim (in behavior/output format) from the pre-rewrite
 * `EncryptForm.tsx` (see `git show HEAD:secret-share-client/src/components/EncryptForm.tsx`
 * for the original). The wire format is unchanged on purpose: links created by
 * the old UI must keep decrypting correctly, so this must always produce
 *
 *   - AES-GCM-256 ciphertext, base64-encoded
 *   - the AES key exported as JWK, JSON-stringified, zlib-deflated, then
 *     base64-encoded
 *   - a 12-byte random IV, base64-encoded
 *   - a share link of the form
 *     `${origin}/retrieve/${base64("<identifier>?key=<keyB64>&iv=<ivB64>")}`
 *   - a manage link of the form `${origin}/manage/<creatorIdentifier>`
 *
 * The only change from the original is `bytesToBase64` below: the old code
 * called `String.fromCharCode(...bytes)` directly, which can overflow the
 * engine's call-stack argument limit on a large secret. Chunking produces the
 * exact same base64 string for any input, just without that ceiling.
 */

export interface EncryptedSecret {
  /** Base64 AES-GCM ciphertext. */
  encryptedSecret: string;
  /** Base64 zlib-compressed JWK of the one-time AES key. */
  keyB64: string;
  /** Base64 12-byte GCM IV. */
  ivB64: string;
}

/** `String.fromCharCode(...bytes)` -> `btoa`, chunked to avoid stack limits. */
function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/**
 * Generates a one-time AES-GCM-256 key, encrypts `plaintext` with it, and
 * returns everything needed to build a share link. Nothing here ever leaves
 * this function un-encrypted; the key itself is only returned in its
 * compressed, base64 form for embedding in the link fragment.
 */
export async function encryptSecret(plaintext: string): Promise<EncryptedSecret> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error(
      'Web Crypto is unavailable. SecretShare must be served over HTTPS (or from localhost).',
    );
  }

  const secretBytes = new TextEncoder().encode(plaintext);

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, secretBytes);
  const exportedKey = await crypto.subtle.exportKey('jwk', key);

  const compressedKey = zlibSync(strToU8(JSON.stringify(exportedKey)));

  return {
    encryptedSecret: bytesToBase64(new Uint8Array(encrypted)),
    keyB64: bytesToBase64(compressedKey),
    ivB64: bytesToBase64(iv),
  };
}

/** `${origin}/retrieve/${base64("<identifier>?key=<keyB64>&iv=<ivB64>")}` */
export function buildShareLink(identifier: string, keyB64: string, ivB64: string): string {
  const urlData = btoa(`${identifier}?key=${keyB64}&iv=${ivB64}`);
  return `${window.location.origin}/retrieve/${urlData}`;
}

/** `${origin}/manage/<creatorIdentifier>` */
export function buildManageLink(creatorIdentifier: string): string {
  return `${window.location.origin}/manage/${creatorIdentifier}`;
}
