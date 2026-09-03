/** @jsxImportSource theme-ui */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';
import { ArrowRight, ChevronRight } from '../icons';
import { nudge } from './keyframes';

export interface SlideToConfirmProps {
  /** Fired once, when the control is confirmed. */
  onConfirm: () => void;
  /** Track label, e.g. "Slide to decrypt". */
  label: string;
  /** Label while `busy`. Default "Working…". */
  busyLabel?: string;
  /** Fraction of the travel that counts as confirmed. Default 0.75. */
  threshold?: number;
  disabled?: boolean;
  /** Locks the control and shows `busyLabel` — set this while the request runs. */
  busy?: boolean;
  sx?: ThemeUIStyleObject;
}

const TRACK_HEIGHT = 62;
const KNOB = 52;
const PAD = 5;

/**
 * The "slide to decrypt" control.
 *
 * Deliberately awkward to trigger by accident, because opening the secret
 * destroys it — there is no second attempt.
 *
 * Built on Pointer Events so mouse, touch and pen all take the same path.
 * Crucially it is **not drag-only**: Enter and Space confirm it directly, so a
 * keyboard or switch user is not locked out of retrieving their own secret. It
 * is a `<button>` for exactly that reason, with the drag layered on top.
 */
export function SlideToConfirm({
  onConfirm,
  label,
  busyLabel = 'Working…',
  threshold = 0.75,
  disabled = false,
  busy = false,
  sx,
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLButtonElement | null>(null);
  const [travel, setTravel] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const confirmed = useRef(false);

  const locked = disabled || busy;

  // Measure available travel, and keep it correct across resizes.
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setTravel(Math.max(0, el.clientWidth - KNOB - PAD * 2));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!busy) confirmed.current = false;
  }, [busy]);

  const fire = useCallback(() => {
    if (confirmed.current || locked) return;
    confirmed.current = true;
    onConfirm();
  }, [locked, onConfirm]);

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (locked || travel <= 0) return;
    knobRef.current?.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startOffset.current = offset;
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const next = Math.min(travel, Math.max(0, startOffset.current + (e.clientX - startX.current)));
    setOffset(next);
  };

  const endDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    knobRef.current?.releasePointerCapture?.(e.pointerId);
    setDragging(false);
    const moved = Math.abs(offset - startOffset.current);
    if (travel > 0 && offset >= travel * threshold) {
      setOffset(travel);
      fire();
    } else {
      setOffset(0);
      // A tap that never really moved is a click, and a click should work:
      // requiring a drag would make this unusable with assistive pointers.
      if (moved < 4) fire();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (locked) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setOffset(travel);
      fire();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setOffset((o) => Math.min(travel, o + Math.max(24, travel / 6)));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setOffset((o) => Math.max(0, o - Math.max(24, travel / 6)));
    }
  };

  const progress = travel > 0 ? offset / travel : 0;

  return (
    <div
      ref={trackRef}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        height: TRACK_HEIGHT,
        p: `${PAD}px`,
        border: '1px solid',
        borderColor: locked ? 'disabledBorder' : 'borderInput',
        borderRadius: 9,
        bg: locked ? 'disabledBg' : 'well',
        overflow: 'hidden',
        touchAction: 'pan-y',
        opacity: disabled ? 0.6 : 1,
        ...sx,
      }}
    >
      {/* Filled trail behind the knob. */}
      <div
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${PAD + KNOB / 2 + offset}px`,
          bg: 'primaryWash',
          pointerEvents: 'none',
          transition: dragging ? 'none' : 'width .28s cubic-bezier(.2,.7,.3,1)',
        }}
      />

      <button
        ref={knobRef}
        type="button"
        disabled={disabled}
        aria-label={busy ? busyLabel : label}
        aria-disabled={locked || undefined}
        aria-busy={busy || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: KNOB,
          height: KNOB,
          p: 0,
          border: 0,
          borderRadius: 9,
          bg: locked ? 'disabledBorder' : 'primary',
          color: locked ? 'disabledText' : 'textOnAccent',
          cursor: locked ? 'not-allowed' : dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform .28s cubic-bezier(.2,.7,.3,1)',
          boxShadow: locked
            ? 'none'
            : 'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 18px -8px rgba(15,198,217,0.9)',
          touchAction: 'none',
          '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
        }}
      >
        <ArrowRight size={22} />
      </button>

      {/* Chevron hint — fades out as the knob advances. */}
      <span
        aria-hidden
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          pl: 2,
          flexShrink: 0,
          color: 'primary',
          opacity: locked ? 0 : 1 - progress,
          transition: 'opacity .2s linear',
        }}
      >
        {[0, 0.2, 0.4].map((d) => (
          <ChevronRight
            key={d}
            size={16}
            sx={{ animation: `${nudge} 1.6s ease-in-out ${d}s infinite` }}
          />
        ))}
      </span>

      <span
        aria-hidden
        sx={{
          flexGrow: 1,
          textAlign: 'center',
          pr: `${KNOB - 6}px`,
          fontFamily: 'heading',
          fontSize: 7,
          fontWeight: 'heading',
          letterSpacing: 'heading',
          color: locked ? 'disabledText' : 'textSecondary',
          opacity: 1 - progress * 0.8,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {busy ? busyLabel : label}
      </span>
    </div>
  );
}

export default SlideToConfirm;
