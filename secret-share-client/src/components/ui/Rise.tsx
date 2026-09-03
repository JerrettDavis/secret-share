/** @jsxImportSource theme-ui */
import type { ElementType, ReactNode } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';
import { rise } from './keyframes';

export interface RiseProps {
  children: ReactNode;
  /** Stagger in ms. The canvas uses 60–80ms between siblings down the page. */
  delay?: number;
  /** Element to render. Defaults to `div`. */
  as?: ElementType;
  sx?: ThemeUIStyleObject;
  className?: string;
}

/**
 * Entrance wrapper: translateY(12px) + fade over 500ms.
 *
 * `both` fill mode means the child starts invisible, so a staggered group never
 * flashes at full opacity before its turn. Motion is disabled globally under
 * `prefers-reduced-motion: reduce`; because the animation is what makes the
 * element visible, the reduced-motion rule leaves it simply *present*.
 */
export function Rise({ children, delay = 0, as: Tag = 'div', sx, className }: RiseProps) {
  return (
    <Tag
      className={className}
      sx={{
        animation: `${rise} .5s cubic-bezier(.2,.7,.3,1) both`,
        animationDelay: delay ? `${delay}ms` : undefined,
        ...sx,
      }}
    >
      {children}
    </Tag>
  );
}

export default Rise;
