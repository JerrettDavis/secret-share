/** @jsxImportSource theme-ui */
import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';
import { Eye, EyeOff } from '../icons';

export interface MaskedFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label. Omit it and pass `aria-label` instead if the design has no label. */
  label?: string;
  /** Help text under the field. */
  hint?: string;
  /** Error message. Sets the error styling, `aria-invalid` and `role="alert"`. */
  error?: string;
  /** Controls the toggle from outside. Leave undefined for internal state. */
  revealed?: boolean;
  onRevealedChange?: (revealed: boolean) => void;
  sx?: ThemeUIStyleObject;
}

/**
 * A password/secret input with a Show/Hide toggle.
 *
 * While masked the field is monospace with wide letter-spacing, which gives the
 * dots the even rhythm the canvas specifies and makes the character count
 * countable; revealing it drops back to normal tracking so the actual value is
 * readable.
 */
export const MaskedField = forwardRef<HTMLInputElement, MaskedFieldProps>(function MaskedField(
  { label, hint, error, revealed, onRevealedChange, id, sx, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const [internal, setInternal] = useState(false);
  const isRevealed = revealed ?? internal;
  const toggle = () => {
    const next = !isRevealed;
    if (revealed === undefined) setInternal(next);
    onRevealedChange?.(next);
  };

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div sx={{ display: 'flex', flexDirection: 'column', gap: 2, ...sx }}>
      {label ? (
        <label htmlFor={inputId} sx={{ variant: 'forms.label', mb: 0 }}>
          {label}
        </label>
      ) : null}

      <div sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={ref}
          id={inputId}
          type={isRevealed ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          sx={{
            variant: error ? 'forms.inputError' : 'forms.inputMono',
            pr: 11,
            letterSpacing: isRevealed ? 0 : 'mask',
          }}
          {...rest}
        />
        <button
          type="button"
          onClick={toggle}
          aria-pressed={isRevealed}
          aria-controls={inputId}
          aria-label={isRevealed ? 'Hide' : 'Show'}
          sx={{
            position: 'absolute',
            right: 2,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            minHeight: ['touch', 'control'],
            px: 3,
            border: 0,
            borderRadius: 2,
            bg: 'chipHover',
            color: 'textSecondary',
            fontFamily: 'body',
            fontSize: 1,
            fontWeight: 'medium',
            cursor: 'pointer',
            '&:hover': { color: 'text' },
            '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
          }}
        >
          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
          {isRevealed ? 'Hide' : 'Show'}
        </button>
      </div>

      {hint && !error ? (
        <span id={hintId} sx={{ fontSize: 1, lineHeight: 'body', color: 'textMuted' }}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} role="alert" sx={{ fontSize: 1, lineHeight: 'body', color: 'dangerText' }}>
          {error}
        </span>
      ) : null}
    </div>
  );
});

export default MaskedField;
