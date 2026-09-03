/** @jsxImportSource theme-ui */
import type { ThemeUIStyleObject } from 'theme-ui';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name. Pass `labelledBy` instead if a visible label already names it. */
  label?: string;
  /** id of an element that labels this switch. */
  labelledBy?: string;
  /** id of an element that describes this switch. */
  describedBy?: string;
  disabled?: boolean;
  sx?: ThemeUIStyleObject;
}

/**
 * A 42x24 pill switch.
 *
 * `role="switch"` + `aria-checked` rather than a checkbox: the protections rows
 * read as "on/off", not "selected", and the switch role is what conveys that.
 * The 42x24 pill is smaller than the 44px touch minimum, so the button carries
 * invisible vertical padding to bring its hit area up to 44px without changing
 * the visual size.
 */
export function Toggle({
  checked,
  onChange,
  label,
  labelledBy,
  describedBy,
  disabled = false,
  sx,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        flexShrink: 0,
        width: 42,
        height: 24,
        p: '3px',
        // Extends the hit area to a 44px touch target without growing the pill.
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-10px',
          bottom: '-10px',
          left: 0,
          right: 0,
        },
        border: '1px solid',
        borderColor: checked ? 'transparent' : 'borderStrong',
        borderRadius: 9,
        bg: checked ? 'primary' : 'border',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color .18s ease, border-color .18s ease',
        '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
        ...sx,
      }}
    >
      <span
        aria-hidden
        sx={{
          width: 16,
          height: 16,
          borderRadius: 9,
          bg: checked ? '#0B1B1F' : 'textMuted',
          transition: 'background-color .18s ease',
        }}
      />
    </button>
  );
}

export default Toggle;
