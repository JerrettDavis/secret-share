/** @jsxImportSource theme-ui */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';
import Spinner from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'destructiveSolid'
  | 'inline'
  | 'ghost';

/** Maps to `theme.sizes`: control 36, touch 44, field 48, action 54. */
export type ButtonSize = 'control' | 'touch' | 'field' | 'action';

const DEFAULT_SIZE: Record<ButtonVariant, ButtonSize> = {
  primary: 'field',
  secondary: 'field',
  destructive: 'field',
  destructiveSolid: 'field',
  inline: 'control',
  ghost: 'control',
};

const ICON_SIZE: Record<ButtonSize, number> = {
  control: 15,
  touch: 16,
  field: 17,
  action: 18,
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon element. Sized for you if you pass an icon component's output. */
  icon?: ReactNode;
  /** Trailing icon element. */
  iconEnd?: ReactNode;
  fullWidth?: boolean;
  /** Shows a spinner in place of the leading icon and disables the button. */
  loading?: boolean;
  children?: ReactNode;
  sx?: ThemeUIStyleObject;
}

/**
 * The app's button. Styling lives in `theme.buttons.*`; this component only
 * adds sizing, icon slots and the loading state.
 *
 * A `loading` button stays in the tab order (it is `aria-disabled`, not
 * `disabled`) so focus is not lost mid-submit, but it does not fire.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size,
    icon,
    iconEnd,
    fullWidth = false,
    loading = false,
    disabled = false,
    children,
    type = 'button',
    onClick,
    sx,
    ...rest
  },
  ref,
) {
  const resolvedSize = size ?? DEFAULT_SIZE[variant];
  const inert = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={inert ? (e) => e.preventDefault() : onClick}
      sx={{
        variant: `buttons.${variant}`,
        height: resolvedSize,
        minHeight: resolvedSize,
        width: fullWidth ? '100%' : undefined,
        ...sx,
      }}
      {...rest}
    >
      {loading ? (
        <Spinner size={ICON_SIZE[resolvedSize]} />
      ) : icon ? (
        <span sx={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
      ) : null}
      {children}
      {iconEnd ? <span sx={{ display: 'flex', flexShrink: 0 }}>{iconEnd}</span> : null}
    </button>
  );
});

export default Button;
