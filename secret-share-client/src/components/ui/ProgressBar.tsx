/** @jsxImportSource theme-ui */
import type { ThemeUIStyleObject } from 'theme-ui';

export interface ProgressBarProps {
  /** Current value, e.g. views used. */
  value: number;
  /** Maximum, e.g. the view limit. Values <= 0 render an empty track. */
  max: number;
  /** Accessible name, e.g. "Views used". */
  label: string;
  /** Track height in px. Default 5, matching the manage-page tiles. */
  height?: number;
  /** Bar colour token. Default `primary`. */
  color?: string;
  sx?: ThemeUIStyleObject;
}

/**
 * Determinate progress — "1 of 3 views used".
 *
 * The visible bar is clamped to a 2px minimum whenever `value > 0`, so a
 * single view out of a large limit still reads as "something has happened"
 * rather than an empty track.
 */
export function ProgressBar({
  value,
  max,
  label,
  height = 5,
  color = 'primary',
  sx,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 0;
  const clamped = safeMax ? Math.min(Math.max(value, 0), safeMax) : 0;
  const pct = safeMax ? (clamped / safeMax) * 100 : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuetext={`${clamped} of ${safeMax}`}
      sx={{
        overflow: 'hidden',
        width: '100%',
        height,
        borderRadius: 9,
        bg: 'borderDim',
        ...sx,
      }}
    >
      <div
        aria-hidden
        sx={{
          height: '100%',
          width: `${pct}%`,
          minWidth: clamped > 0 ? '2px' : 0,
          borderRadius: 9,
          bg: color,
          transition: 'width .3s cubic-bezier(.2,.7,.3,1)',
        }}
      />
    </div>
  );
}

export default ProgressBar;
