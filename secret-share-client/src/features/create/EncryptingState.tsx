/** @jsxImportSource theme-ui */
import type { ReactNode } from 'react';
import { BracketFrame, Button, Spinner, SweepBar, keyframes } from '@components/ui';
import { Check, Lock, Warning } from '@components/icons';
import type { EncryptStage } from './useCreateSecret';

export interface EncryptingStateProps {
  stage: EncryptStage;
  /** When set, replaces the checklist with a retry-capable error state. */
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}

interface StepRowProps {
  label: string;
  trailing?: ReactNode;
  done?: boolean;
  active?: boolean;
}

function StepRow({ label, trailing, done = false, active = false }: StepRowProps) {
  return (
    <div
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        px: 2,
        py: 3,
        borderRadius: 3,
        bg: active ? 'primaryWash' : 'transparent',
      }}
    >
      <span sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 24, height: 24 }}>
        {done ? (
          <span
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 9,
              bg: 'successSoft',
              color: 'success',
            }}
          >
            <Check size={14} />
          </span>
        ) : active ? (
          <Spinner size={20} />
        ) : (
          <span aria-hidden sx={{ width: '7px', height: '7px', borderRadius: 9, bg: 'borderStrong' }} />
        )}
      </span>
      <span sx={{ flexGrow: 1, fontSize: 5, fontWeight: active ? 'medium' : 'body', color: done || active ? 'text' : 'textMuted' }}>
        {label}
      </span>
      {trailing ? (
        <span
          sx={{
            fontFamily: 'monospace',
            fontSize: 1,
            color: active ? 'primary' : 'textMuted',
            animation: active ? `${keyframes.softpulse} 1.4s ease-in-out infinite` : undefined,
          }}
        >
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

/**
 * The brief transition between "editing" and "done": a sweep bar, a short
 * checklist tracking the two real client-side steps (`stage`), and — the one
 * behavior the old `EncryptForm` never had — a retry-capable error state.
 * The old code awaited the create request with no try/catch at all, so a
 * failed request just died as an unhandled promise rejection and the page sat
 * there looking like nothing had happened.
 */
export function EncryptingState({ stage, error, onRetry, onBack }: EncryptingStateProps) {
  return (
    <BracketFrame sx={{ width: '100%' }}>
      <div sx={{ width: '100%', border: '1px solid', borderColor: 'border', borderRadius: 7, bg: 'surface', overflow: 'hidden' }}>
        {!error ? <SweepBar label="Encrypting" height={3} sx={{ borderRadius: 0 }} /> : null}

        <div sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, px: [6, 8], py: [8, 9] }}>
          <div sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '84px', height: '84px' }}>
            {!error ? (
              <>
                <span
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 9,
                    border: '1px solid',
                    borderColor: 'primaryLine',
                    animation: `${keyframes.ringout} 2.2s ease-out infinite`,
                  }}
                />
                <span
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 9,
                    border: '1px solid',
                    borderColor: 'primaryLine',
                    animation: `${keyframes.ringout} 2.2s ease-out 1.1s infinite`,
                  }}
                />
              </>
            ) : null}
            <span
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '62px',
                height: '62px',
                borderRadius: 9,
                bg: error ? 'dangerSoft' : 'primarySoft',
                border: '1px solid',
                borderColor: error ? 'dangerLine' : 'primaryLine',
                color: error ? 'danger' : 'primary',
              }}
            >
              {error ? <Warning size={26} /> : <Lock size={26} />}
            </span>
          </div>

          <div sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
            <h1 sx={{ variant: 'text.title', fontSize: 11 }}>
              {error ? 'Could not create your secret' : 'Encrypting on this device'}
            </h1>
            <p sx={{ m: 0, maxWidth: '40ch', fontSize: 5, lineHeight: 'lead', color: 'textSecondary' }}>
              {error ?? 'Your secret is being sealed before anything is sent. Keep this tab open for a moment.'}
            </p>
          </div>

          {!error ? (
            <div
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                width: '100%',
                py: 2,
                borderTop: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'borderDim',
              }}
            >
              <StepRow done label="Generated a one-time 256-bit key" trailing="AES-GCM" />
              <StepRow
                active={stage === 'sealing'}
                done={stage !== 'sealing'}
                label="Sealing your secret"
                trailing={stage === 'sealing' ? 'working' : undefined}
              />
              <StepRow active={stage === 'uploading'} label="Creating your share and management links" />
            </div>
          ) : null}

          {error ? (
            <div sx={{ display: 'flex', gap: 3, width: '100%' }}>
              {/* Not `fullWidth`: the shared Button variants set `flexShrink: 0`
                  so two `width: 100%` buttons side by side would both claim the
                  full row and overflow rather than share it. `flexGrow` +
                  `minWidth: 0` here override that to split the row evenly. */}
              <Button variant="secondary" onClick={onBack} sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                Back to editing
              </Button>
              <Button variant="primary" onClick={onRetry} sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                Try again
              </Button>
            </div>
          ) : (
            <p sx={{ m: 0, maxWidth: '44ch', textAlign: 'center', fontSize: 1, lineHeight: 'body', color: 'textMuted' }}>
              Only the encrypted result leaves this browser. The key stays in the link you are about to
              receive.
            </p>
          )}
        </div>
      </div>
    </BracketFrame>
  );
}

export default EncryptingState;
