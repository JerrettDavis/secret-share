/** @jsxImportSource theme-ui */
import { useEffect, useId, useState } from 'react';
import { Button, Callout, Modal } from '@components/ui';
import { Trash } from '@components/icons';
import { formatRelative } from '@lib/format';

export interface RevokeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
  error: string | null;
  reportedViews: number;
  maxViews: number | null;
  expirationDate: string | null;
  logCount: number;
}

const CONFIRM_WORD = 'REVOKE';

function ConsequenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        px: 4,
        py: 3,
        borderBottom: '1px solid',
        borderColor: 'borderSubtle',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <span sx={{ fontSize: 3, color: 'textDim' }}>{label}</span>
      <span sx={{ fontFamily: 'monospace', fontSize: 3, color: 'text' }}>{value}</span>
    </div>
  );
}

/**
 * The revoke confirmation dialog. Shows exactly what is lost — remaining
 * views, the expiry that would have applied, how many log entries go with
 * it — and keeps the confirm button disabled until the literal word `REVOKE`
 * is typed, so a stray Enter key can never trigger it.
 */
export function RevokeDialog({
  open,
  onClose,
  onConfirm,
  submitting,
  error,
  reportedViews,
  maxViews,
  expirationDate,
  logCount,
}: RevokeDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const inputId = useId();

  useEffect(() => {
    if (open) setConfirmText('');
  }, [open]);

  const canConfirm = confirmText === CONFIRM_WORD && !submitting;

  const viewsRemaining =
    maxViews === null ? 'Unlimited' : `${Math.max(maxViews - reportedViews, 0)} of ${maxViews}`;
  const wouldHaveExpired = expirationDate ? formatRelative(expirationDate) : 'Never';

  return (
    <Modal
      open={open}
      onClose={onClose}
      tone="danger"
      title="Revoke this secret?"
      description="The secret and its access log are deleted from the server straight away. Anyone still holding the share link will be told it doesn't exist. There is no undo and no recovery."
      footer={
        <div
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: ['column-reverse', 'row'],
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <span sx={{ fontSize: 1, color: 'textMuted', display: [null, 'block'] }}>
            Esc to cancel
          </span>
          <div sx={{ display: 'flex', gap: 3, width: ['100%', 'auto'] }}>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
              sx={{ width: ['100%', 'auto'] }}
            >
              Keep it
            </Button>
            <Button
              variant="destructiveSolid"
              icon={<Trash size={16} />}
              disabled={!canConfirm}
              loading={submitting}
              onClick={onConfirm}
              sx={{ width: ['100%', 'auto'] }}
            >
              Revoke permanently
            </Button>
          </div>
        </div>
      }
    >
      <div
        sx={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'borderSubtle',
          borderRadius: 4,
          bg: 'surfaceSubtle',
          overflow: 'hidden',
        }}
      >
        <ConsequenceRow label="Views still available" value={viewsRemaining} />
        <ConsequenceRow label="Would have expired" value={wouldHaveExpired} />
        <ConsequenceRow label="Log entries deleted with it" value={String(logCount)} />
      </div>

      <div sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
        <label htmlFor={inputId} sx={{ fontSize: 3, color: 'textSecondary' }}>
          Type{' '}
          <span sx={{ fontFamily: 'monospace', fontWeight: 'medium', color: 'dangerText' }}>
            {CONFIRM_WORD}
          </span>{' '}
          to confirm
        </label>
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canConfirm) onConfirm();
          }}
          disabled={submitting}
          aria-describedby={error ? `${inputId}-error` : undefined}
          sx={{
            variant: 'forms.input',
            fontFamily: 'monospace',
            letterSpacing: 'mono',
            borderColor: 'danger',
            boxShadow: 'ringDanger',
            '&:focus': { borderColor: 'danger', boxShadow: 'ringDanger' },
          }}
        />
      </div>

      {error ? (
        <Callout tone="danger" sx={{ mt: 4 }}>
          <p id={`${inputId}-error`} sx={{ m: 0, fontSize: 2 }}>
            {error}
          </p>
        </Callout>
      ) : null}
    </Modal>
  );
}

export default RevokeDialog;
