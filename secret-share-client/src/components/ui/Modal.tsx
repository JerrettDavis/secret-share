/** @jsxImportSource theme-ui */
import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';
import { dialogin, fadein } from './keyframes';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Rendered as the dialog's accessible name. */
  title: ReactNode;
  /** Optional supporting line under the title. */
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons row pinned to the bottom of the dialog. */
  footer?: ReactNode;
  /** Danger dialogs (revoke) get a red-tinted border. */
  tone?: 'default' | 'danger';
  sx?: ThemeUIStyleObject;
}

/**
 * An accessible modal dialog.
 *
 * Traps Tab inside the dialog, closes on Escape or overlay click, restores
 * focus to whatever was focused before it opened, and locks body scroll while
 * open. Rendered inline rather than through a portal — nothing in this app
 * clips or transforms an ancestor of it, and staying in the tree keeps the
 * React context (theme, router) intact without extra plumbing.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  tone = 'default',
  sx,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = `${titleId}-desc`;

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const root = dialogRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;

    const root = dialogRef.current;
    const target =
      root?.querySelector<HTMLElement>(FOCUSABLE) ?? root ?? null;
    target?.focus();

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: [5, 10],
        backgroundColor: 'rgba(6,11,12,0.76)',
        backdropFilter: 'blur(4px)',
        animation: `${fadein} .25s ease-out both`,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        sx={{
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          p: [6, 8],
          border: '1px solid',
          borderColor: tone === 'danger' ? '#3A2830' : 'border',
          borderRadius: 8,
          backgroundColor: '#151B1E',
          boxShadow: 'dialog',
          outline: 'none',
          animation: `${dialogin} .35s cubic-bezier(.2,.8,.3,1) both`,
          ...sx,
        }}
      >
        <div sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h2 id={titleId} sx={{ variant: 'text.cardHeading' }}>
            {title}
          </h2>
          {description ? (
            <p id={descId} sx={{ m: 0, fontSize: 3, lineHeight: 'body', color: 'textDim' }}>
              {description}
            </p>
          ) : null}
        </div>

        {children}

        {footer ? (
          <div
            sx={{
              display: 'flex',
              flexDirection: ['column-reverse', 'row'],
              justifyContent: 'flex-end',
              gap: 3,
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Modal;
