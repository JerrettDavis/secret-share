/** @jsxImportSource theme-ui */
import { useParams } from 'react-router-dom';
import { PageMain, type PageWidth } from '@components/layout';
import { DecryptingState } from './DecryptingState';
import { RetrieveErrorState } from './RetrieveErrorState';
import { RetrievePasswordStep } from './RetrievePasswordStep';
import { RetrieveReady } from './RetrieveReady';
import { RevealedSecret } from './RevealedSecret';
import { useRetrieveSecret, type RetrievePhase } from './useRetrieveSecret';

const WIDTH_BY_PHASE: Record<RetrievePhase['phase'], PageWidth> = {
  ready: 'retrieve',
  password: 'narrow',
  decrypting: 'narrow',
  revealed: 'success',
  error: 'narrow',
};

/**
 * "Retrieve a secret" — the recipient-facing flow.
 *
 * Reads `:identifier` from the route (the base64 fragment `parseShareLink`
 * decodes), owns nothing else — all state lives in `useRetrieveSecret`. This
 * component's only job is picking the right child, and the right page width,
 * for the current phase.
 */
export function RetrievePage() {
  const { identifier } = useParams<{ identifier: string }>();
  const { phase, busy, confirmReveal, submitPassword } = useRetrieveSecret(identifier);

  return (
    <PageMain maxWidth={WIDTH_BY_PHASE[phase.phase]} center>
      {phase.phase === 'ready' && <RetrieveReady busy={busy} onConfirm={confirmReveal} />}

      {phase.phase === 'password' && (
        <RetrievePasswordStep busy={busy} error={phase.error} onSubmit={submitPassword} />
      )}

      {phase.phase === 'decrypting' && <DecryptingState />}

      {phase.phase === 'revealed' && <RevealedSecret secret={phase.secret} />}

      {phase.phase === 'error' && <RetrieveErrorState error={phase.error} />}
    </PageMain>
  );
}

export default RetrievePage;
