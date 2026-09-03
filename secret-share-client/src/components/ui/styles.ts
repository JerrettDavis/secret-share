import type { ThemeUIStyleObject } from 'theme-ui';

/**
 * Off-screen but still announced. Use for live regions and for labels that the
 * design communicates visually (an icon, a colour) but that a screen reader
 * still needs in words.
 */
export const visuallyHidden: ThemeUIStyleObject = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  p: 0,
  m: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
