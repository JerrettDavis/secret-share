/** @jsxImportSource theme-ui */
import { useId, useState } from 'react';
import { BracketFrame } from '@components/ui';
import { Eye, EyeOff } from '@components/icons';

export interface SecretInputProps {
  value: string;
  onChange: (value: string) => void;
}

function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/**
 * The "Your secret" card: a multi-line entry that is masked by default.
 *
 * Masking a `<textarea>` isn't something the platform gives you for free the
 * way `type="password"` does for a single line, and the design calls for
 * preserving line breaks while hidden (the dot rows track each line's actual
 * length) — so the real `<textarea>` stays in the DOM and keeps receiving
 * keystrokes as normal, just rendered with `color: transparent` while masked;
 * a `pointer-events: none` overlay on top draws one row of `•` per line,
 * matching each line's length. The native caret (`caret-color`) still shows
 * through, and screen readers still see the real value in the textarea
 * itself — the masking is a shoulder-surfing precaution, not a content
 * restriction, so assistive tech is never made to guess at dots.
 */
export function SecretInput({ value, onChange }: SecretInputProps) {
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputId = useId();

  const lines = value.length ? value.split('\n') : [];
  const maskedText = lines.map((line) => '•'.repeat(line.length)).join('\n');

  return (
    <BracketFrame sx={{ borderRadius: 6 }}>
      <div
        sx={{
          border: '1px solid',
          borderColor: 'border',
          borderRadius: 6,
          bg: 'surface',
          p: [5, 6],
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 5 }}>
          <div sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <h2 sx={{ variant: 'text.cardHeading' }}>Your secret</h2>
            <p sx={{ m: 0, fontSize: 2, lineHeight: 'body', color: 'textDim' }}>
              Hidden while you type. Nothing leaves this device until you encrypt.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-pressed={revealed}
            aria-controls={inputId}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              flexShrink: 0,
              minHeight: ['touch', 'control'],
              px: 4,
              border: '1px solid',
              borderColor: 'borderStrong',
              borderRadius: 2,
              bg: 'transparent',
              color: 'textSecondary',
              fontFamily: 'body',
              fontSize: 2,
              fontWeight: 'medium',
              cursor: 'pointer',
              '&:hover': { color: 'text' },
              '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
            }}
          >
            {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
            {revealed ? 'Hide' : 'Show'}
          </button>
        </div>

        <div sx={{ position: 'relative' }}>
          <textarea
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Paste a password, an API key, a recovery phrase, or a short note."
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Your secret"
            rows={4}
            sx={{
              width: '100%',
              minHeight: ['116px', '124px'],
              resize: 'vertical',
              pl: 5,
              pr: 5,
              pt: 4,
              pb: 4,
              border: '1px solid',
              borderColor: focused ? 'primary' : 'borderInput',
              borderRadius: 4,
              bg: 'well',
              color: revealed ? 'text' : 'transparent',
              caretColor: 'primary',
              fontFamily: 'monospace',
              fontSize: 5,
              lineHeight: 'lead',
              outline: 'none',
              boxShadow: focused ? 'ringPrimary' : 'none',
              transition: 'border-color .16s ease, box-shadow .16s ease',
              '&::placeholder': { color: 'textFaint' },
            }}
          />
          {!revealed && value ? (
            <div
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                pl: 5,
                pr: 5,
                pt: 4,
                pb: 4,
                overflow: 'hidden',
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: 5,
                lineHeight: 'lead',
                letterSpacing: 'mono',
                color: 'textSecondary',
              }}
            >
              {maskedText}
            </div>
          ) : null}
        </div>

        {value ? (
          <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <span sx={{ fontSize: 1, color: 'textMuted' }}>
              {pluralize(lines.length, 'line', 'lines')} · {pluralize(value.length, 'character', 'characters')}
            </span>
            <span sx={{ display: ['none', 'inline'], fontSize: 1, color: 'textMuted' }}>
              Drag the corner to resize while writing
            </span>
            <span sx={{ display: ['inline', 'none'], fontSize: 1, color: 'textMuted' }}>
              Never sent in the clear
            </span>
          </div>
        ) : null}
      </div>
    </BracketFrame>
  );
}

export default SecretInput;
