import { keyframes } from '@emotion/react';

/**
 * Motion primitives from the design canvas ("Foundations" -> Motion).
 *
 * Usage from an `sx` prop:
 *   sx={{ animation: `${rise} .5s cubic-bezier(.2,.7,.3,1) both` }}
 *
 * A global `@media (prefers-reduced-motion: reduce)` rule in `theme.styles.root`
 * disables all animations and transitions, so individual call sites do not need
 * to guard for it.
 */

/** Entrance: translateY + fade. 500ms, cubic-bezier(.2,.7,.3,1), staggered 60–80ms. */
export const rise = keyframes({
  from: { opacity: 0, transform: 'translateY(12px)' },
  to: { opacity: 1, transform: 'none' },
});

/** Text caret blink. */
export const blink = keyframes({
  '0%, 49%': { opacity: 1 },
  '50%, 100%': { opacity: 0 },
});

/** Indeterminate progress sweep — a single bar travelling across its track. */
export const sweep = keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(320%)' },
});

/** Refusal: 6px horizontal shake, 500ms, once, never repeated. */
export const shake = keyframes({
  '0%, 100%': { transform: 'translateX(0)' },
  '18%': { transform: 'translateX(-6px)' },
  '38%': { transform: 'translateX(5px)' },
  '58%': { transform: 'translateX(-3px)' },
  '78%': { transform: 'translateX(2px)' },
});

/** Gentle "this is live" pulse for status dots. */
export const softpulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.4 },
});

/** Chevron hint on the slide-to-confirm control. */
export const nudge = keyframes({
  '0%, 100%': { opacity: 0.25, transform: 'translateX(0)' },
  '50%': { opacity: 0.8, transform: 'translateX(5px)' },
});

/** Expanding ring behind a working/idle indicator. */
export const ringout = keyframes({
  '0%': { transform: 'scale(.82)', opacity: 0.55 },
  '100%': { transform: 'scale(1.35)', opacity: 0 },
});

/** Success mark pop. */
export const popin = keyframes({
  '0%': { opacity: 0, transform: 'scale(.9)' },
  '60%': { transform: 'scale(1.04)' },
  '100%': { opacity: 1, transform: 'scale(1)' },
});

/** Reveal of a decrypted secret: blur(9px) -> 0 over 750ms. */
export const unblur = keyframes({
  from: { opacity: 0, filter: 'blur(9px)' },
  to: { opacity: 1, filter: 'blur(0)' },
});

/** Modal dialog entrance. */
export const dialogin = keyframes({
  from: { opacity: 0, transform: 'translateY(14px) scale(.975)' },
  to: { opacity: 1, transform: 'none' },
});

/** Modal overlay entrance. */
export const fadein = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

/** Continuous rotation, used by the spinner. */
export const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

/** Skeleton shimmer for loading placeholders. */
export const shimmer = keyframes({
  '0%': { backgroundPosition: '-340px 0' },
  '100%': { backgroundPosition: '340px 0' },
});
