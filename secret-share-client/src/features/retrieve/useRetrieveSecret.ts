import { useCallback, useRef, useState } from 'react';
import { secretsApi } from '@api/client';
import { LinkMalformedError, toRetrieveError, type RetrieveError } from '@api/errors';
import { hashPassword } from '@lib/hashPassword';
import { decryptSecret, parseShareLink, type ParsedShareLink } from './crypto';

export type RetrievePhase =
  | { phase: 'ready' }
  | { phase: 'password'; error?: 'INVALID_PASSWORD' }
  | { phase: 'decrypting' }
  | { phase: 'revealed'; secret: string }
  | { phase: 'error'; error: RetrieveError };

export interface UseRetrieveSecretResult {
  phase: RetrievePhase;
  /** True while a retrieve attempt (with or without a password) is in flight. */
  busy: boolean;
  /** Fired once, by the ready screen's slide-to-confirm gesture. */
  confirmReveal: () => void;
  /** Fired by the password screen's submit — hashes `password` before sending it. */
  submitPassword: (password: string) => void;
}

/**
 * Owns the retrieve state machine described in the feature spec:
 *
 *   ready --confirm--> (fetch, no password)
 *     --PASSWORD_REQUIRED--> password
 *     --other error--------> error
 *     --success------------> decrypting --> revealed
 *
 *   password --submit(password)--> (fetch, hashed password header)
 *     --INVALID_PASSWORD--> password (error: 'INVALID_PASSWORD') — stays put, retryable
 *     --other error-------> error
 *     --success-----------> decrypting --> revealed
 *
 * The link's `serverIdentifier`/`key`/`iv` are parsed once (on the first
 * attempt) and cached in a ref, so a password retry does not re-parse the
 * route param.
 */
export function useRetrieveSecret(identifier: string | undefined): UseRetrieveSecretResult {
  const [phase, setPhase] = useState<RetrievePhase>({ phase: 'ready' });
  const [busy, setBusy] = useState(false);
  const linkRef = useRef<ParsedShareLink | null>(null);

  const attempt = useCallback(
    async (password?: string) => {
      if (busy) return;
      setBusy(true);

      // Clear a stale "that password doesn't match" banner while the retry is
      // in flight, rather than leaving it sitting next to a spinner.
      if (password !== undefined) {
        setPhase((prev) => (prev.phase === 'password' ? { phase: 'password' } : prev));
      }

      try {
        let link = linkRef.current;
        if (!link) {
          if (!identifier) throw new LinkMalformedError();
          link = parseShareLink(identifier);
          linkRef.current = link;
        }

        const headerPassword = password !== undefined ? await hashPassword(password) : undefined;
        const response = await secretsApi.getApiSecrets(link.serverIdentifier, headerPassword);
        const ciphertext = response.data?.secret;
        if (!ciphertext) throw new LinkMalformedError();

        setPhase({ phase: 'decrypting' });
        const secret = await decryptSecret(ciphertext, link.key, link.iv);
        setPhase({ phase: 'revealed', secret });
      } catch (e) {
        const err = toRetrieveError(e);
        if (err.code === 'PASSWORD_REQUIRED') {
          setPhase({ phase: 'password' });
        } else if (err.code === 'INVALID_PASSWORD') {
          setPhase({ phase: 'password', error: 'INVALID_PASSWORD' });
        } else {
          setPhase({ phase: 'error', error: err });
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, identifier],
  );

  const confirmReveal = useCallback(() => {
    void attempt(undefined);
  }, [attempt]);

  const submitPassword = useCallback(
    (password: string) => {
      void attempt(password);
    },
    [attempt],
  );

  return { phase, busy, confirmReveal, submitPassword };
}

export default useRetrieveSecret;
