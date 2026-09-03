/** @jsxImportSource theme-ui */
import type { ThemeUIStyleObject } from 'theme-ui';
import { sweep } from './keyframes';

export interface SweepBarProps {
  /** Announced by assistive tech. Default "Working". */
  label?: string;
  /** Track height in px. Default 4. */
  height?: number;
  sx?: ThemeUIStyleObject;
}

/**
 * Indeterminate progress: one bar sweeping across a track.
 *
 * `aria-busy` plus an indeterminate `progressbar` (no `aria-valuenow`) is the
 * correct pairing for "something is happening, duration unknown".
 */
export function SweepBar({ label = 'Working', height = 4, sx }: SweepBarProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-busy="true"
      sx={{
        position: 'relative',
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
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '30%',
          borderRadius: 9,
          bg: 'primary',
          animation: `${sweep} 1.4s cubic-bezier(.4,0,.2,1) infinite`,
        }}
      />
    </div>
  );
}

export default SweepBar;
