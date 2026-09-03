/** @jsxImportSource theme-ui */
import type { ThemeUIStyleObject } from 'theme-ui';
import { Spinner as SpinnerIcon } from '../icons';

export interface SpinnerProps {
  size?: number;
  /** Announced by assistive tech. Default "Loading". */
  label?: string;
  sx?: ThemeUIStyleObject;
}

/**
 * The single permitted "waiting" indicator, alongside `SweepBar`. Per the
 * canvas: never more than one thing moving at a time on a screen.
 */
export function Spinner({ size = 20, label = 'Loading', sx }: SpinnerProps) {
  return <SpinnerIcon size={size} aria-label={label} sx={sx} />;
}

export default Spinner;
