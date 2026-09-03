/**
 * SHA-256 of a UTF-8 string, lowercase hex.
 *
 * This is the ONE place the secret-protection password is transformed, and it
 * is shared on purpose:
 *
 *  - the **create** flow hashes the password the author sets before sending it
 *    with the new secret;
 *  - the **retrieve** flow hashes the password the recipient types before
 *    sending it in the `x-secret-password` header.
 *
 * The server compares those two values directly, so both sides must apply an
 * identical transform. If this ever needs to change (a different digest, a
 * salt, a KDF), it changes here for both flows at once — never fork it.
 *
 * Requires a secure context (HTTPS or localhost): `crypto.subtle` is undefined
 * over plain HTTP on a non-loopback origin.
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error(
      'Web Crypto is unavailable. SecretShare must be served over HTTPS (or from localhost).',
    );
  }

  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);

  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default hashPassword;
