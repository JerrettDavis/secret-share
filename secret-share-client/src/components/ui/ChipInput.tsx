/** @jsxImportSource theme-ui */
import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';
import { X } from '../icons';
import { blink } from './keyframes';

export interface ChipInputProps {
  /** Committed chips. Controlled — the parent owns the array. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Accessible name for the input. */
  label: string;
  /** Shown while the field is empty, after a blinking caret. */
  placeholder?: string;
  /**
   * Validate a candidate chip. Return an error string to reject it, or
   * `null`/`undefined` to accept. Rejected input stays in the field so the user
   * can fix it rather than losing what they typed.
   */
  validate?: (candidate: string) => string | null | undefined;
  /** Normalise a value before it is stored (trim, lowercase, …). */
  normalize?: (candidate: string) => string;
  disabled?: boolean;
  sx?: ThemeUIStyleObject;
}

/**
 * Tag entry, used for the IP allowlist.
 *
 * Enter, comma and blur all commit the pending text; Backspace on an empty
 * field removes the last chip. Each chip's remove button is a real button, so
 * the whole control is operable from the keyboard alone.
 */
export function ChipInput({
  value,
  onChange,
  label,
  placeholder = 'Add an address',
  validate,
  normalize = (s) => s.trim(),
  disabled = false,
  sx,
}: ChipInputProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const commit = useCallback(
    (raw: string) => {
      const candidate = normalize(raw);
      if (!candidate) {
        setDraft('');
        setError(null);
        return;
      }
      const problem = validate?.(candidate);
      if (problem) {
        setError(problem);
        return;
      }
      if (value.includes(candidate)) {
        setDraft('');
        setError(null);
        return;
      }
      onChange([...value, candidate]);
      setDraft('');
      setError(null);
    },
    [normalize, onChange, validate, value],
  );

  const remove = (chip: string) => onChange(value.filter((v) => v !== chip));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div sx={{ display: 'flex', flexDirection: 'column', gap: 2, ...sx }}>
      <div
        onClick={() => inputRef.current?.focus()}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          minHeight: 'field',
          px: 3,
          py: 2,
          border: '1px solid',
          borderColor: error ? 'danger' : 'borderInput',
          borderRadius: 4,
          bg: 'well',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
          '&:focus-within': {
            borderColor: error ? 'danger' : 'primary',
            boxShadow: error ? 'ringDanger' : 'ringPrimary',
          },
        }}
      >
        {value.map((chip) => (
          <span
            key={chip}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              pl: 2,
              pr: 1,
              py: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'borderStrong',
              bg: 'chip',
              fontFamily: 'monospace',
              fontSize: 1,
              color: '#D3E4E9',
            }}
          >
            {chip}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                remove(chip);
              }}
              aria-label={`Remove ${chip}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                p: 0,
                border: 0,
                borderRadius: 1,
                bg: 'transparent',
                color: 'textDim',
                cursor: 'pointer',
                '&:hover': { color: 'text' },
                '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
              }}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <span sx={{ position: 'relative', display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 140 }}>
          {value.length === 0 && draft === '' ? (
            <span
              aria-hidden
              sx={{
                position: 'absolute',
                left: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                pointerEvents: 'none',
                fontFamily: 'monospace',
                fontSize: 3,
                color: 'textFaint',
              }}
            >
              <span
                sx={{
                  display: 'inline-block',
                  width: '2px',
                  height: '17px',
                  bg: 'primary',
                  animation: `${blink} 1.1s steps(1, end) infinite`,
                }}
              />
              {placeholder}
            </span>
          ) : null}

          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={draft}
            disabled={disabled}
            aria-label={label}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={onKeyDown}
            onBlur={() => commit(draft)}
            sx={{
              width: '100%',
              minWidth: 0,
              minHeight: 28,
              p: 0,
              border: 0,
              bg: 'transparent',
              color: 'text',
              fontFamily: 'monospace',
              fontSize: 3,
              outline: 'none',
            }}
          />
        </span>
      </div>

      {error ? (
        <span id={errorId} role="alert" sx={{ fontSize: 1, color: 'dangerText' }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export default ChipInput;
