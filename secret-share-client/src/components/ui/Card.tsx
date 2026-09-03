/** @jsxImportSource theme-ui */
import type { ElementType, ReactNode } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';

export type CardVariant = 'surface' | 'well';
export type CardAccent = 'none' | 'primary' | 'creator' | 'danger';

const ACCENT_COLORS: Record<Exclude<CardAccent, 'none'>, string> = {
  primary: 'primary',
  creator: 'secondary',
  danger: 'danger',
};

export interface CardProps {
  children: ReactNode;
  /** `surface` = the standard #141D21 panel; `well` = the recessed input ground. */
  variant?: CardVariant;
  /** Draws a 3px coloured rail down the left edge (create-success link cards). */
  accent?: CardAccent;
  /** Drop the built-in padding — for cards that manage their own internal rows. */
  flush?: boolean;
  as?: ElementType;
  sx?: ThemeUIStyleObject;
  className?: string;
  id?: string;
}

/**
 * A panel. With `accent` set it becomes the two-part card from the canvas: a
 * coloured rail plus the content well, which is why the accent variant nests an
 * inner div rather than using a border-left (a border would round with the
 * card and thin out at the corners).
 */
export function Card({
  children,
  variant = 'surface',
  accent = 'none',
  flush = false,
  as: Tag = 'div',
  sx,
  className,
  id,
}: CardProps) {
  const creator = accent === 'creator';
  // Base geometry/colour lives in `theme.cards.*` so the tokens stay the single
  // source of truth; only the creator (purple) recolour is applied on top.
  const base: ThemeUIStyleObject = {
    variant: `cards.${variant}`,
    p: 0,
    ...(creator ? { borderColor: 'secondaryBorder', bg: 'secondarySurface' } : null),
  };

  const padding = flush ? null : { p: [5, 8] };

  if (accent === 'none') {
    return (
      <Tag id={id} className={className} sx={{ ...base, ...padding, ...sx }}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      id={id}
      className={className}
      sx={{ ...base, display: 'flex', overflow: 'hidden', ...sx }}
    >
      <div
        aria-hidden
        sx={{ flexShrink: 0, width: '3px', bg: ACCENT_COLORS[accent] }}
      />
      <div sx={{ flexGrow: 1, minWidth: 0, ...(flush ? null : { px: [5, 7], py: [5, 6] }) }}>
        {children}
      </div>
    </Tag>
  );
}

export default Card;
