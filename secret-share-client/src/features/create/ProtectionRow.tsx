/** @jsxImportSource theme-ui */
import { useId, type ReactNode } from 'react';
import { Toggle } from '@components/ui';

export interface ProtectionRowProps {
  icon: ReactNode;
  title: string;
  description: string;
  /**
   * Shown next to the toggle only while the row is off. Once a row is turned
   * on its expanded control takes over, so the chip would just be a
   * redundant, stale echo of whatever the control already shows.
   */
  valueChip?: string;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  children?: ReactNode;
  /** Drop the bottom border — the last row in the list. */
  isLast?: boolean;
}

/**
 * One row of the Protections panel: icon tile, title + description, an
 * optional value chip, and a toggle — expanding to `children` when on.
 *
 * The expanded content is indented under the icon on desktop (72px, so it
 * lines up with the title text above it) but runs full-width on mobile: at
 * 390px, a 72px indent eats roughly a fifth of the screen for no reason, so
 * the mobile control gets that space back instead.
 */
export function ProtectionRow({
  icon,
  title,
  description,
  valueChip,
  enabled,
  onToggle,
  children,
  isLast = false,
}: ProtectionRowProps) {
  const titleId = useId();
  const descId = useId();

  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'borderSubtle',
        bg: enabled ? 'surfaceRaised' : 'transparent',
      }}
    >
      <div
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: [3, 4],
          minHeight: ['68px', 'auto'],
          px: [5, 8],
          py: 4,
        }}
      >
        <span
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: '34px',
            height: '34px',
            borderRadius: 3,
            bg: enabled ? 'primarySoft' : 'chip',
            color: enabled ? 'primary' : 'textDim',
          }}
        >
          {icon}
        </span>

        <div sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span id={titleId} sx={{ fontSize: 5, fontWeight: 'medium', color: 'text' }}>
            {title}
          </span>
          <span id={descId} sx={{ fontSize: 2, lineHeight: 'body', color: 'textDim' }}>
            {description}
          </span>
        </div>

        {!enabled && valueChip ? (
          <span
            sx={{
              flexShrink: 0,
              mr: 1,
              px: 3,
              py: 1,
              borderRadius: 1,
              bg: 'chip',
              fontFamily: 'monospace',
              fontSize: 1,
              color: 'textSecondary',
            }}
          >
            {valueChip}
          </span>
        ) : null}

        <Toggle checked={enabled} onChange={onToggle} labelledBy={titleId} describedBy={descId} />
      </div>

      {enabled && children ? (
        <div
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            pl: [5, '72px'],
            pr: [5, 8],
            pb: [5, 6],
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default ProtectionRow;
