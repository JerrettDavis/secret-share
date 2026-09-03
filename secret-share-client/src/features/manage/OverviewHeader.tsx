/** @jsxImportSource theme-ui */
import { useCallback, useEffect, useRef, useState } from 'react';
import { StatusPill, type StatusVariant, visuallyHidden } from '@components/ui';
import { Check, Copy } from '@components/icons';
import { formatCreated } from '@lib/format';
import { truncateIdentifier } from './utils';

export interface OverviewHeaderProps {
  status: StatusVariant;
  identifier: string;
  createdAt: string | null;
}

const RESET_MS = 2000;

/**
 * `h1` + status + a truncated, copyable identifier chip + the "Created …"
 * line. The identifier chip is deliberately its own small control rather than
 * the full `CopyField` component — that one is sized for the share/management
 * *links* elsewhere in the app; here it is just a compact reference to the
 * secret shown alongside a status badge.
 */
export function OverviewHeader({ status, identifier, createdAt }: OverviewHeaderProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(identifier);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      // No clipboard access — the identifier is still visible (if truncated)
      // for manual copying, so this is a quiet no-op rather than an error.
    }
  }, [identifier]);

  return (
    <div sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <h1 sx={{ variant: 'text.title', fontSize: [11, 12] }}>Secret overview</h1>
        <StatusPill status={status} />
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied identifier' : `Copy identifier ${identifier}`}
          title={identifier}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            minHeight: 'control',
            pl: 5,
            pr: 3,
            border: '1px solid transparent',
            borderRadius: 2,
            bg: 'chip',
            color: copied ? 'success' : 'textSecondary',
            fontFamily: 'monospace',
            fontSize: 1,
            cursor: 'pointer',
            transition: 'color .16s ease',
            '&:hover': { color: copied ? 'success' : 'text' },
            '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
          }}
        >
          {truncateIdentifier(identifier)}
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p sx={{ m: 0, fontSize: [5, 6], lineHeight: 'body', color: 'textDim' }}>
        {createdAt ? `Created ${formatCreated(createdAt)}.` : 'Created a moment ago.'} Only someone
        holding the management link can see this page — the secret itself is not readable from
        here.
      </p>
      <span aria-live="polite" sx={visuallyHidden}>
        {copied ? 'Identifier copied to clipboard' : ''}
      </span>
    </div>
  );
}

export default OverviewHeader;
