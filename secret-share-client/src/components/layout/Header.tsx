/** @jsxImportSource theme-ui */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus, Wordmark, X } from '../icons';
import { fadein } from '../ui/keyframes';

export type HeaderNavKey = 'new' | 'manage';

export interface HeaderProps {
  /**
   * Highlights the matching nav item. Omit it and the header derives the
   * current section from the route, which is what the app shell does — pass it
   * explicitly only to override that.
   */
  active?: HeaderNavKey;
}

/**
 * Informational links shown in the header. They point at the project's own
 * documentation because this app has no marketing pages of its own — change the
 * hrefs here and both the desktop nav and the mobile drawer follow.
 */
const REPO_URL = 'https://github.com/JerrettDavis/secret-share';
const INFO_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'How it works', href: `${REPO_URL}#how-it-works` },
  { label: 'Security', href: `${REPO_URL}#security-model` },
];

const navLinkSx = {
  display: 'flex',
  alignItems: 'center',
  px: 3,
  py: 2,
  borderRadius: 2,
  fontSize: 4,
  fontWeight: 'medium',
  color: 'textSecondary',
  textDecoration: 'none',
  transition: 'color .16s ease, background-color .16s ease',
  '&:hover': { color: 'text', bg: 'chip' },
  '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
} as const;

function deriveActive(pathname: string): HeaderNavKey | undefined {
  if (pathname === '/') return 'new';
  if (pathname.startsWith('/manage/')) return 'manage';
  return undefined;
}

export function Header({ active: activeProp }: HeaderProps) {
  const { pathname } = useLocation();
  const active = activeProp ?? deriveActive(pathname);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKey);
    // Move focus into the drawer so keyboard users are not stranded behind it.
    drawerRef.current?.querySelector<HTMLElement>('a,button')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <header
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        flexShrink: 0,
        height: [56, 68],
        px: [5, 10],
        borderBottom: '1px solid',
        borderColor: 'border',
        bg: 'chrome',
      }}
    >
      <Link
        to="/"
        aria-label="SecretShare home"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: [2, 3],
          textDecoration: 'none',
          '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary', borderRadius: 3 },
        }}
      >
        <span
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: [28, 30],
            height: [28, 30],
            borderRadius: 3,
            bg: 'primarySoft',
            border: '1px solid',
            borderColor: 'primaryLine',
            color: 'primary',
          }}
        >
          <Wordmark size={15} />
        </span>
        <span
          sx={{
            fontFamily: 'heading',
            fontSize: [8, 9],
            fontWeight: 'heading',
            letterSpacing: 'wordmark',
            color: 'text',
          }}
        >
          SecretShare
        </span>
      </Link>

      {/* Desktop nav */}
      <nav
        aria-label="Main"
        sx={{ display: ['none', 'flex'], alignItems: 'center', gap: 1 }}
      >
        <Link
          to="/"
          aria-current={active === 'new' ? 'page' : undefined}
          sx={{
            ...navLinkSx,
            ...(active === 'new' ? { color: 'text', bg: 'chip' } : null),
          }}
        >
          New secret
        </Link>
        {active === 'manage' ? (
          <span
            aria-current="page"
            sx={{ ...navLinkSx, color: 'text', bg: 'chip', cursor: 'default' }}
          >
            Manage
          </span>
        ) : null}
        {INFO_LINKS.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer noopener" sx={navLinkSx}>
            {l.label}
          </a>
        ))}
      </nav>

      {/* Mobile trigger */}
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        sx={{
          display: ['inline-flex', 'none'],
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: 'touch',
          height: 'touch',
          p: 0,
          border: 0,
          borderRadius: 3,
          bg: 'transparent',
          color: 'textSecondary',
          cursor: 'pointer',
          '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
        }}
      >
        {open ? <X size={20} /> : <Menu size={21} />}
      </button>

      {/* Mobile drawer */}
      {open ? (
        <div
          ref={drawerRef}
          sx={{
            display: ['flex', 'none'],
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 40,
            flexDirection: 'column',
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'border',
            bg: 'chrome',
            boxShadow: 'dialog',
            animation: `${fadein} .18s ease-out both`,
          }}
        >
          <Link
            to="/"
            onClick={close}
            aria-current={active === 'new' ? 'page' : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minHeight: 'touch',
              px: 3,
              borderRadius: 2,
              fontSize: 6,
              fontWeight: 'medium',
              color: active === 'new' ? 'text' : 'textSecondary',
              bg: active === 'new' ? 'chip' : 'transparent',
              textDecoration: 'none',
            }}
          >
            <Plus size={17} />
            New secret
          </Link>
          {INFO_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
              onClick={close}
              sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: 'touch',
                px: 3,
                borderRadius: 2,
                fontSize: 6,
                fontWeight: 'medium',
                color: 'textSecondary',
                textDecoration: 'none',
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export default Header;
