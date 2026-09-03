/** @jsxImportSource theme-ui */
import type { ReactNode } from 'react';
import type { ThemeUIStyleObject } from 'theme-ui';

export type PageWidth = 'form' | 'retrieve' | 'narrow' | 'success' | 'wide';

export interface PageMainProps {
  /** Maps to `theme.sizes` — form 660, retrieve 560, narrow 520, success 680, wide 1040. */
  maxWidth?: PageWidth;
  /** Vertically centre the content in the viewport. Used by retrieve/error screens. */
  center?: boolean;
  children: ReactNode;
  sx?: ThemeUIStyleObject;
}

/**
 * The `<main>` landmark. Owns page gutters and the single content column so
 * feature screens only worry about what goes inside it.
 */
export function PageMain({ maxWidth = 'form', center = false, children, sx }: PageMainProps) {
  return (
    <main
      sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: center ? 'center' : 'flex-start',
        px: [5, 10],
        pt: [7, 11],
        pb: [9, 11],
      }}
    >
      <div
        sx={{
          width: '100%',
          maxWidth,
          display: 'flex',
          flexDirection: 'column',
          gap: [5, 9],
          ...sx,
        }}
      >
        {children}
      </div>
    </main>
  );
}

export default PageMain;
