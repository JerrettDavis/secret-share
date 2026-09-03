/** @jsxImportSource theme-ui */
import type { ReactNode } from 'react';
import Footer from './Footer';
import Header, { type HeaderNavKey } from './Header';

export interface AppLayoutProps {
  children: ReactNode;
  /** Forwarded to `<Header>` to highlight the current nav item. */
  active?: HeaderNavKey;
}

/**
 * Page shell: header, a flex-grow content slot, footer.
 *
 * The 34px grid background and page ground colour come from `theme.styles.root`
 * (applied to the document root), so the shell itself only needs to be
 * transparent and full height.
 */
export function AppLayout({ children, active }: AppLayoutProps) {
  return (
    <div
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header active={active} />
      {children}
      <Footer />
    </div>
  );
}

export default AppLayout;
