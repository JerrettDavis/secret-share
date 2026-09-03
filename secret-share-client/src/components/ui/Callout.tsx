/** @jsxImportSource theme-ui */
import type { ReactNode } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';
import { Info, Shield, Warning } from '../icons';

export type CalloutTone = 'info' | 'warning' | 'danger';

const TONES: Record<
  CalloutTone,
  { border: string; bg: string; icon: string; text: string; Icon: typeof Info; role?: 'alert' }
> = {
  info: {
    border: 'borderDim',
    bg: 'surfaceSubtle',
    icon: 'primary',
    text: 'textDim',
    Icon: Shield,
  },
  warning: {
    border: 'warningLine',
    bg: 'rgba(242,169,59,0.06)',
    icon: 'warning',
    text: '#D9C29A',
    Icon: Warning,
    role: 'alert',
  },
  danger: {
    border: 'dangerLine',
    bg: 'dangerSoft',
    icon: 'danger',
    text: 'dangerText',
    Icon: Warning,
    role: 'alert',
  },
};

export interface CalloutProps {
  children: ReactNode;
  tone?: CalloutTone;
  /** Replace the default tone icon. Pass `null` for no icon at all. */
  icon?: ReactNode;
  sx?: ThemeUIStyleObject;
}

/**
 * A bordered note. `warning` and `danger` carry `role="alert"` so a screen
 * reader announces them when they appear mid-flow (a failed password, a
 * "copy both links before you leave" warning).
 */
export function Callout({ children, tone = 'info', icon, sx }: CalloutProps) {
  const t = TONES[tone];
  const Icon = t.Icon;

  return (
    <div
      role={t.role}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 3,
        border: '1px solid',
        borderColor: t.border,
        borderRadius: 4,
        backgroundColor: t.bg,
        px: 5,
        py: 4,
        fontSize: 2,
        lineHeight: 'body',
        color: t.text,
        ...sx,
      }}
    >
      {icon === null ? null : (
        <span sx={{ flexShrink: 0, mt: '1px', color: t.icon, display: 'flex' }}>
          {icon ?? <Icon size={17} />}
        </span>
      )}
      <div sx={{ minWidth: 0, '& > :first-of-type': { mt: 0 }, '& > :last-child': { mb: 0 } }}>
        {children}
      </div>
    </div>
  );
}

export default Callout;
