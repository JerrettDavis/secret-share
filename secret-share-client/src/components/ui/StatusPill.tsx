/** @jsxImportSource theme-ui */
import type { ThemeUIStyleObject } from 'theme-ui';
import { Check, X } from '../icons';
import { softpulse } from './keyframes';

export type StatusVariant =
  | 'active'
  | 'expired'
  | 'exhausted'
  | 'revoked'
  | 'granted'
  | 'refused';

/**
 * Default wording per status.
 *
 * From the canvas's own foundations: *no status is ever communicated by colour
 * alone — every one carries a word.* That rule is enforced here rather than
 * left to call sites, which is why `children` only ever overrides the wording,
 * never removes it.
 */
const LABELS: Record<StatusVariant, string> = {
  active: 'Active',
  expired: 'Expired',
  exhausted: 'Views used up',
  revoked: 'Revoked',
  granted: 'Granted',
  refused: 'Refused',
};

/** Statuses that get a dot; the attempt outcomes get a glyph instead. */
const DOT_COLORS: Partial<Record<StatusVariant, string>> = {
  active: 'success',
  expired: 'warning',
  exhausted: 'accent',
  revoked: 'danger',
};

export interface StatusPillProps {
  status: StatusVariant;
  /** Overrides the default wording. Cannot be empty — the word is the point. */
  children?: string;
  /** Animate the "active" dot. Default true for `active`, ignored elsewhere. */
  pulse?: boolean;
  sx?: ThemeUIStyleObject;
}

export function StatusPill({ status, children, pulse = true, sx }: StatusPillProps) {
  const text = children?.trim() ? children : LABELS[status];
  const dot = DOT_COLORS[status];

  return (
    <span sx={{ variant: `badges.${status}`, ...sx }}>
      {dot ? (
        <span
          aria-hidden
          sx={{
            width: '7px',
            height: '7px',
            borderRadius: 9,
            flexShrink: 0,
            bg: dot,
            animation:
              status === 'active' && pulse ? `${softpulse} 2.2s ease-in-out infinite` : undefined,
          }}
        />
      ) : status === 'granted' ? (
        <Check size={13} />
      ) : (
        <X size={13} />
      )}
      {text}
    </span>
  );
}

export default StatusPill;
