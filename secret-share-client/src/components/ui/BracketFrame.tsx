/** @jsxImportSource theme-ui */
import type { ElementType, ReactNode } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';

export interface BracketFrameProps {
  children: ReactNode;
  /** Corner radius of the framed panel, so the brackets follow it. Default 14. */
  radius?: number;
  /** Bracket arm length in px. Default 14. */
  arm?: number;
  /** Bracket colour. Default a 50% cyan line. */
  color?: string;
  as?: ElementType;
  sx?: ThemeUIStyleObject;
  className?: string;
}

/**
 * The corner-bracket motif: a hairline elbow at the top-left and bottom-right
 * of a panel, drawn with `::before`/`::after` so it costs no extra DOM and
 * never intercepts pointer events.
 *
 * Wrap the panel itself — the component sets `position: relative` and expects
 * the caller to supply the panel's border/background via `sx`.
 */
export function BracketFrame({
  children,
  radius = 14,
  arm = 14,
  color = 'rgba(15,198,217,0.5)',
  as: Tag = 'div',
  sx,
  className,
}: BracketFrameProps) {
  return (
    <Tag
      className={className}
      sx={{
        position: 'relative',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          width: `${arm}px`,
          height: `${arm}px`,
          border: '1px solid',
          borderColor: color,
          pointerEvents: 'none',
        },
        '&::before': {
          top: '-1px',
          left: '-1px',
          borderRightWidth: 0,
          borderBottomWidth: 0,
          borderTopLeftRadius: `${radius}px`,
        },
        '&::after': {
          bottom: '-1px',
          right: '-1px',
          borderLeftWidth: 0,
          borderTopWidth: 0,
          borderBottomRightRadius: `${radius}px`,
        },
        ...sx,
      }}
    >
      {children}
    </Tag>
  );
}

export default BracketFrame;
