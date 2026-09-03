import { strFromU8, unzlibSync } from 'fflate';
import { LinkMalformedError } from '@api/errors';

/**
 * Share-link fragment parsing + AES-GCM decryption.
 *
 * Ported **verbatim in behavior** from the original `RetrieveForm.tsx` (see
 * `git show HEAD:secret-share-client/src/components/RetrieveForm.tsx` on the
 * commit that deleted it) so that links already sent out under the old client
 * keep working. The wire format is:
 *
 *   /retrieve/<base64(`${serverIdentifier}?key=<uri-encoded b64 zlib(JWK JSON)>&iv=<uri-encoded b64 iv>`)>
 *
 * Nothing here talks to the network — `useRetrieveSecret` owns that and calls
 * these two functions in sequence.
 */

export interface ParsedShareLink {
  /** The identifier the server knows this secret by. */
  serverIdentifier: string;
  /** Raw `key` fragment param — still URI-encoded, zlib-compressed, base64 JWK JSON. */
  key: string;
  /** Raw `iv` fragment param — still URI-encoded base64. */
  iv: string;
}

// `Uint8Array.from` types its result as `Uint8Array<ArrayBufferLike>`, which
// (as of TS's newer lib.dom typings) is no longer assignable to `BufferSource`
// — only an `ArrayBuffer`-backed view is. The buffer is always a plain
// `ArrayBuffer` here (never a `SharedArrayBuffer`), so the cast is safe.
function bytesFromBase64(b64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

/**
 * Decode the `:identifier` route param back into the server identifier and the
 * key/iv material the creator embedded in the link.
 *
 * Matches the original client exactly: split the decoded string on the first
 * `?`, then the remainder on `&` and `=`. Throws `LinkMalformedError` for any
 * shape that doesn't fit — invalid base64, no `?` segment, or a missing
 * `key`/`iv` param — so the caller can surface the `LINK_MALFORMED` error
 * state instead of crashing.
 */
export function parseShareLink(param: string): ParsedShareLink {
  try {
    const decoded = atob(param);
    const serverIdentifier = decoded.split('?')[0];
    const queryString = decoded.split('?')[1];
    if (!serverIdentifier || !queryString) {
      throw new Error('share link is missing its key/iv segment');
    }

    const dict = queryString.split('&').reduce<Record<string, string>>((acc, part) => {
      const [k, v] = part.split('=');
      if (k) acc[k] = v ?? '';
      return acc;
    }, {});

    const key = dict['key'];
    const iv = dict['iv'];
    if (!key || !iv) {
      throw new Error('share link is missing key or iv');
    }

    return { serverIdentifier, key, iv };
  } catch {
    throw new LinkMalformedError();
  }
}

/**
 * Decrypt the base64 ciphertext the server returned, using the `key`/`iv`
 * pair recovered by `parseShareLink`.
 *
 * Same steps as the original client: URI-decode the param, base64-decode it,
 * zlib-inflate the key material back into JWK JSON, import it, then AES-GCM
 * decrypt the ciphertext (plain base64, no URI-decoding — the server never
 * URI-encodes the payload) with the recovered IV. Any failure along this path
 * (malformed key JSON, wrong IV length, tampered/mismatched ciphertext)
 * surfaces as `LinkMalformedError` rather than an unhandled rejection.
 */
export async function decryptSecret(
  ciphertextBase64: string,
  keyParam: string,
  ivParam: string,
): Promise<string> {
  try {
    const compressedKey = bytesFromBase64(decodeURIComponent(keyParam));
    const keyJson = strFromU8(unzlibSync(compressedKey));
    const jwk = JSON.parse(keyJson) as JsonWebKey;
    const iv = bytesFromBase64(decodeURIComponent(ivParam));
    const encryptedData = bytesFromBase64(ciphertextBase64);

    const importedKey = await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      importedKey,
      encryptedData,
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    throw new LinkMalformedError();
  }
}
