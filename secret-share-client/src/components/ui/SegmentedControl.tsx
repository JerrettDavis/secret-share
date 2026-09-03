/** @jsxImportSource theme-ui */
import { useId, type ReactNode } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: ReactNode;
  /** Optional short caption under the label (e.g. "recommended"). */
  hint?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  /** Visually hide the group label. Default true — most uses sit under a heading. */
  hideLabel?: boolean;
  /**
   * Columns per breakpoint. Defaults to `[2, 4]`: two-up on mobile so each
   * target keeps its 44px height, four-up from 48em.
   */
  columns?: number[];
  sx?: ThemeUIStyleObject;
}

/**
 * A radio group rendered as a row of tiles.
 *
 * Implemented with real `<input type="radio">` elements inside a
 * `<fieldset>`/`<legend>`, so arrow-key navigation, form participation and
 * screen-reader group semantics all come free from the platform.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  label,
  hideLabel = true,
  columns = [2, 4],
  sx,
}: SegmentedControlProps<T>) {
  const name = useId();

  return (
    <fieldset
      sx={{
        m: 0,
        p: 0,
        border: 0,
        display: 'grid',
        gridTemplateColumns: columns.map((c) => `repeat(${c}, minmax(0, 1fr))`),
        gap: 2,
        ...sx,
      }}
    >
      <legend
        sx={
          hideLabel
            ? {
                position: 'absolute',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
                whiteSpace: 'nowrap',
              }
            : { variant: 'text.cap', mb: 2, p: 0 }
        }
      >
        {label}
      </legend>

      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <label
            key={opt.value}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              minHeight: [44, 36],
              px: 2,
              border: '1px solid',
              borderColor: selected ? 'primary' : 'borderInput',
              borderRadius: 2,
              bg: selected ? 'primarySoft' : 'well',
              color: selected ? 'primary' : 'textSecondary',
              fontFamily: 'body',
              fontSize: 3,
              fontWeight: selected ? 'heading' : 'medium',
              textAlign: 'center',
              cursor: opt.disabled ? 'not-allowed' : 'pointer',
              opacity: opt.disabled ? 0.5 : 1,
              transition: 'border-color .16s ease, background-color .16s ease, color .16s ease',
              '&:hover': opt.disabled || selected ? undefined : { borderColor: 'borderStrong' },
              '&:focus-within': { boxShadow: 'ringPrimary', borderColor: 'primary' },
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              disabled={opt.disabled}
              onChange={() => onChange(opt.value)}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                m: 0,
                opacity: 0,
                cursor: 'inherit',
              }}
            />
            <span>{opt.label}</span>
            {opt.hint ? (
              <span sx={{ fontSize: 0, fontWeight: 'body', color: 'textMuted' }}>{opt.hint}</span>
            ) : null}
          </label>
        );
      })}
    </fieldset>
  );
}

export default SegmentedControl;
