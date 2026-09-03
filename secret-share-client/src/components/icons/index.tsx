/** @jsxImportSource theme-ui */
import type { SVGProps } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';
import { spin } from '../ui/keyframes';

/**
 * Icon system.
 *
 * Every icon is a line drawing on a 20x20 grid: no fills, no emoji, one stroke
 * weight — 1.5 at 20px, scaling up to ~1.9 at smaller sizes so the shapes keep
 * their optical weight when they shrink.
 *
 * All icons take `currentColor`, so colour them by setting `color` on a parent
 * (or on the icon itself via `sx`/`style`).
 */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'fill'> {
  /** Rendered width/height in px. Default 20. */
  size?: number;
  /** Forwarded to the underlying `<svg>`. */
  sx?: ThemeUIStyleObject;
}

/** 1.5 at 20px, ~1.9 at 12px, ~1.4 at 24px. */
function strokeFor(size: number): number {
  const raw = 1.5 + (20 - size) * 0.05;
  return Math.min(1.9, Math.max(1.35, Math.round(raw * 100) / 100));
}

interface BaseIconProps extends IconProps {
  children: React.ReactNode;
  viewBox?: string;
}

function Icon({ size = 20, children, viewBox = '0 0 20 20', strokeWidth, ...rest }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? strokeFor(size)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest['aria-label'] ? undefined : true}
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Lock = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.6" y="8.6" width="12.8" height="8.8" rx="2.4" />
    <path d="M6.8 8.6V6.2a3.2 3.2 0 0 1 6.4 0v2.4" />
  </Icon>
);

export const LockOpen = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.6" y="8.6" width="12.8" height="8.8" rx="2.4" />
    <path d="M6.8 8.6V6.2a3.2 3.2 0 0 1 6.3-.72" />
  </Icon>
);

export const Key = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6.6" cy="13.4" r="3" />
    <path d="M8.8 11.2 16 4" />
    <path d="m13.6 6.4 2 2" />
  </Icon>
);

export const Globe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7.2" />
    <path d="M2.8 10h14.4" />
    <path d="M10 2.8c1.9 2 2.9 4.5 2.9 7.2s-1 5.2-2.9 7.2c-1.9-2-2.9-4.5-2.9-7.2S8.1 4.8 10 2.8Z" />
  </Icon>
);

export const Layers = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 2.8 17.4 6.6 10 10.4 2.6 6.6 10 2.8Z" />
    <path d="m2.6 10.4 7.4 3.8 7.4-3.8" />
    <path d="m2.6 13.9 7.4 3.8 7.4-3.8" />
  </Icon>
);

export const Clock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7.2" />
    <path d="M10 5.8V10l2.8 1.8" />
  </Icon>
);

export const Mail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.6" y="4.6" width="14.8" height="10.8" rx="2" />
    <path d="m3.4 6 6.6 4.6L16.6 6" />
  </Icon>
);

export const Copy = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6.6" y="6.6" width="9.2" height="9.2" rx="2" />
    <path d="M12.4 6.6V4.6a2 2 0 0 0-2-2H4.6a2 2 0 0 0-2 2v5.8a2 2 0 0 0 2 2h2" />
  </Icon>
);

export const Eye = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="2.6" />
    <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" />
  </Icon>
);

export const EyeOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8.2 5.4A6.9 6.9 0 0 1 10 5.2c5 0 8 4.8 8 4.8a13 13 0 0 1-2.4 2.9" />
    <path d="M5.6 6.4A13.2 13.2 0 0 0 2 10s3 4.8 8 4.8c1 0 1.9-.2 2.7-.5" />
    <path d="m2.8 2.8 14.4 14.4" />
  </Icon>
);

export const Shield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 2.6 16.4 5v5c0 3.6-2.6 6.4-6.4 7.4C6.2 16.4 3.6 13.6 3.6 10V5L10 2.6Z" />
    <path d="m7.4 9.9 1.9 1.9 3.5-3.6" />
  </Icon>
);

export const Trash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.6 5.6h12.8" />
    <path d="M8 5.6V4.2A1.4 1.4 0 0 1 9.4 2.8h1.2A1.4 1.4 0 0 1 12 4.2v1.4" />
    <path d="m14.4 5.6-.6 10a1.6 1.6 0 0 1-1.6 1.5H7.8a1.6 1.6 0 0 1-1.6-1.5l-.6-10" />
  </Icon>
);

export const LinkBroken = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8.4 11.6 6.8 13.2a3.4 3.4 0 0 1-4.8-4.8l1.6-1.6" />
    <path d="M11.6 8.4 13.2 6.8a3.4 3.4 0 0 1 4.8 4.8l-1.6 1.6" />
    <path d="m2.9 2.9 14.2 14.2" />
  </Icon>
);

export const Check = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 10.4 3.4 3.4L15.2 6.6" />
  </Icon>
);

export const X = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 6 8 8m0-8-8 8" />
  </Icon>
);

export const Plus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 4.6v10.8M4.6 10h10.8" />
  </Icon>
);

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10h12m-4.6-4.6L16 10l-4.6 4.6" />
  </Icon>
);

export const ChevronUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5.6 12.3 4.4-4.4 4.4 4.4" />
  </Icon>
);

export const ChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5.6 7.7 4.4 4.4 4.4-4.4" />
  </Icon>
);

export const ChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m7.7 5.6 4.4 4.4-4.4 4.4" />
  </Icon>
);

export const Warning = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3.2 18 16.8H2L10 3.2Z" />
    <path d="M10 8.2v3.4" />
    <path d="M10 14.1h.01" />
  </Icon>
);

export const Info = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7.2" />
    <path d="M10 9.4v4.2" />
    <path d="M10 6.4h.01" />
  </Icon>
);

export const Menu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.4 6h13.2M3.4 10h13.2M3.4 14h13.2" />
  </Icon>
);

export const ExternalLink = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8.4 11.6 16 4" />
    <path d="M16 4v5m0-5h-5" />
    <path d="M16.4 12.2v3.2a2 2 0 0 1-2 2H5.4a2 2 0 0 1-2-2V6.4a2 2 0 0 1 2-2h3.2" />
  </Icon>
);

export const Sliders = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.4 6.2h13.2M3.4 13.8h13.2" />
    <circle cx="7.2" cy="6.2" r="2" />
    <circle cx="12.8" cy="13.8" r="2" />
  </Icon>
);

/**
 * Indeterminate spinner. Rotates a dashed ring; the arc is drawn with the
 * current colour and the remainder is left open.
 *
 * Motion is suppressed under `prefers-reduced-motion: reduce` (both by the
 * global rule in `theme.styles.root` and by the local guard here), which leaves
 * a static three-quarter ring — still a legible "busy" mark.
 */
export const Spinner = ({ size = 20, sx, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeFor(size)}
    strokeLinecap="round"
    role="status"
    aria-label={rest['aria-label'] ?? 'Loading'}
    sx={{
      animation: `${spin} .85s linear infinite`,
      transformOrigin: '50% 50%',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      ...sx,
    }}
    {...rest}
  >
    <circle cx="10" cy="10" r="7.2" opacity="0.22" />
    <path d="M17.2 10A7.2 7.2 0 0 0 10 2.8" />
  </svg>
);

/**
 * The SecretShare mark — a padlock keyhole drawn on a 16px grid, used in the
 * header wordmark lockup. Deliberately simpler than `Lock` so it stays readable
 * at 15–16px inside its 28–30px rounded tile.
 */
export const Wordmark = ({ size = 16, ...rest }: IconProps) => (
  <Icon size={size} viewBox="0 0 16 16" strokeWidth={1.5} {...rest}>
    <circle cx="8" cy="6" r="2.4" />
    <path d="M6.9 8.2 6.1 13.2h3.8l-.8-5" />
  </Icon>
);
