/** @jsxImportSource theme-ui */

const REPO_URL = 'https://github.com/JerrettDavis/secret-share';

const LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Source', href: REPO_URL },
  { label: 'Security model', href: `${REPO_URL}#security-model` },
  { label: 'MIT License', href: `${REPO_URL}/blob/main/LICENSE` },
];

/**
 * Desktop: one row, blurb left / links right.
 * Mobile: stacked and reordered — links first, blurb centred underneath.
 */
export function Footer() {
  return (
    <footer
      sx={{
        display: 'flex',
        flexDirection: ['column', 'row'],
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: [4, 4],
        flexShrink: 0,
        px: [6, 10],
        pt: 7,
        pb: [9, 7],
        borderTop: '1px solid',
        borderColor: 'borderDim',
      }}
    >
      <p
        sx={{
          m: 0,
          order: [2, 1],
          textAlign: ['center', 'left'],
          fontSize: [1, 2],
          lineHeight: 'body',
          color: ['disabledText', 'textMuted'],
        }}
      >
        Self-hosted and open source. Secrets are encrypted in your browser.
      </p>
      <div
        sx={{
          display: 'flex',
          order: [1, 2],
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: 2,
        }}
      >
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer noopener"
            sx={{
              color: 'textMuted',
              textDecoration: 'none',
              '&:hover': { color: 'textSecondary' },
              '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary', borderRadius: 1 },
            }}
          >
            {l.label}
          </a>
        ))}
      </div>
    </footer>
  );
}

export default Footer;
