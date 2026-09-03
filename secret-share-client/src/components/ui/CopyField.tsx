/** @jsxImportSource theme-ui */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';
import { Check, Copy } from '../icons';
import { visuallyHidden } from './styles';

export type CopyFieldVariant = 'primary' | 'creator';

export interface CopyFieldProps {
  /** The text shown, and the text copied. */
  value: string;
  /**
   * `primary` = cyan share-link treatment; `creator` = purple management-link
   * treatment. The two exist so the recipient link and the private management
   * link can never be confused for one another at a glance.
   */
  variant?: CopyFieldVariant;
  /** Accessible name for the copy button. Default "Copy link". */
  label?: string;
  /** Fired after a successful copy. */
  onCopy?: (value: string) => void;
  sx?: ThemeUIStyleObject;
}

const RESET_MS = 2000;

/**
 * A read-only monospace value with a copy button that flips to a "Copied"
 * confirmation for two seconds.
 *
 * The confirmation is inline (and announced via `aria-live`) rather than a
 * toast: on the create-success screen there are two of these side by side, and
 * a floating toast could not say *which* link was copied.
 */
export function CopyField({
  value,
  variant = 'primary',
  label = 'Copy link',
  onCopy,
  sx,
}: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    clearTimeout(timer.current);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setFailed(false);
      setCopied(true);
      onCopy?.(value);
      timer.current = setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      // Clipboard access can be denied (insecure context, permission policy).
      // Say so instead of silently doing nothing — the user must be able to
      // fall back to selecting the text by hand.
      setCopied(false);
      setFailed(true);
      timer.current = setTimeout(() => setFailed(false), RESET_MS * 2);
    }
  }, [value, onCopy]);

  const creator = variant === 'creator';

  return (
    <div sx={{ display: 'flex', flexDirection: 'column', gap: 2, ...sx }}>
      <div
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minHeight: 50,
          pl: 5,
          pr: 2,
          py: 1,
          border: '1px solid',
          borderColor: creator ? '#362B42' : 'borderInput',
          borderRadius: 3,
          bg: creator ? 'secondaryWell' : 'well',
        }}
      >
        <span
          title={value}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
            fontSize: 2,
            color: '#D3E4E9',
          }}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : label}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            flexShrink: 0,
            minHeight: ['touch', 'control'],
            px: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: copied ? 'successLine' : creator ? '#46375A' : 'borderStrong',
            backgroundColor: copied
              ? 'rgba(63,214,140,0.14)'
              : creator
                ? '#1E1929'
                : 'transparent',
            color: copied ? 'success' : creator ? '#E3D6EE' : 'textSecondary',
            fontFamily: 'body',
            fontSize: 2,
            fontWeight: copied ? 'heading' : 'medium',
            cursor: 'pointer',
            transition: 'background-color .16s ease, color .16s ease, border-color .16s ease',
            '&:hover': { color: 'text' },
            '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <span aria-live="polite" sx={visuallyHidden}>
        {copied ? 'Copied to clipboard' : ''}
      </span>

      {failed ? (
        <span role="alert" sx={{ fontSize: 1, color: 'warning' }}>
          Could not reach the clipboard. Select the text above and copy it manually.
        </span>
      ) : null}
    </div>
  );
}

export default CopyField;
