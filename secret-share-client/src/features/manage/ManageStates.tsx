/** @jsxImportSource theme-ui */
import { Link } from 'react-router-dom';
import type { ThemeUIStyleObject } from 'theme-ui';
import { Card, Rise, Spinner, keyframes } from '@components/ui';
import { ArrowRight, LinkBroken, Trash } from '@components/icons';

function Sk({ sx }: { sx: ThemeUIStyleObject }) {
  return (
    <div
      sx={{
        bg: 'disabledBg',
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.055) 50%, rgba(255,255,255,0) 100%)',
        backgroundSize: '340px 100%',
        backgroundRepeat: 'no-repeat',
        borderRadius: 2,
        animation: `${keyframes.shimmer} 1.5s linear infinite`,
        ...sx,
      }}
    />
  );
}

/**
 * The initial-load skeleton. Mirrors the shape of the loaded page (title,
 * four tiles, protections strip, log table, revoke section) closely enough
 * that nothing visibly reflows once the real data lands.
 */
export function ManageLoadingState() {
  return (
    <div sx={{ display: 'flex', flexDirection: 'column', gap: [5, 9] }}>
      <div sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <h1 sx={{ variant: 'text.title', fontSize: [11, 12] }}>Secret overview</h1>
          <span
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              px: 4,
              py: 2,
              borderRadius: 9,
              border: '1px solid',
              borderColor: 'borderInput',
              bg: 'surface',
              fontSize: 1,
              color: 'textDim',
            }}
          >
            <Spinner size={14} />
            Loading this secret
          </span>
        </div>
        <Sk sx={{ width: 320, height: 15 }} />
      </div>

      <div
        sx={{
          display: 'grid',
          gridTemplateColumns: ['repeat(2, minmax(0, 1fr))', 'repeat(4, minmax(0, 1fr))'],
          gap: 3,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} variant="surface" flush sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 5, borderRadius: 5 }}>
            <Sk sx={{ width: 70, height: 11 }} />
            <Sk sx={{ width: 90, height: 26 }} />
            <Sk sx={{ width: '100%', height: 5, borderRadius: 9 }} />
          </Card>
        ))}
      </div>

      <Card variant="surface" flush sx={{ display: 'flex', alignItems: 'center', gap: 4, p: 5, borderRadius: 5 }}>
        <Sk sx={{ width: 90, height: 11 }} />
        <Sk sx={{ width: 140, height: 28, borderRadius: 2 }} />
        <Sk sx={{ width: 160, height: 28, borderRadius: 2 }} />
      </Card>

      <Card variant="surface" flush sx={{ overflow: 'hidden', borderRadius: 6 }}>
        <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, p: 5 }}>
          <div sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <h2 sx={{ variant: 'text.cardHeading' }}>Access log</h2>
            <p sx={{ m: 0, fontSize: 3, color: 'textDim' }}>
              Every attempt on this link, granted or refused, newest first.
            </p>
          </div>
          <Sk sx={{ width: 240, height: 40, borderRadius: 2, display: [null, 'block'] }} />
        </div>
        <div sx={{ display: 'flex', flexDirection: 'column' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                px: 5,
                py: 4,
                borderTop: '1px solid',
                borderColor: 'borderSubtle',
              }}
            >
              <Sk sx={{ width: 100, height: 12 }} />
              <Sk sx={{ width: 80, height: 22, borderRadius: 9 }} />
              <Sk sx={{ width: 120, height: 12, display: [null, 'block'] }} />
              <Sk sx={{ width: 140, height: 12, display: [null, 'block'] }} />
            </div>
          ))}
        </div>
      </Card>

      <p sx={{ m: 0, fontSize: 1, color: 'textMuted' }}>
        Reading the access log for this secret. Nothing is decrypted on this page, so this should
        take about a second.
      </p>
    </div>
  );
}

/** Terminal state: the creator link is dead — wrong identifier, or the
 *  secret already expired / hit its view limit / was revoked in a previous
 *  visit. All indistinguishable from here, so all land here. */
export function ManageNotFoundState() {
  return (
    <Rise>
      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 5, textAlign: 'center' }}>
        <span
          sx={{
            display: 'flex',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 6,
            bg: 'chip',
            color: 'textDim',
          }}
        >
          <LinkBroken size={24} />
        </span>
        <h1 sx={{ variant: 'text.pageTitle' }}>This secret no longer exists.</h1>
        <p sx={{ m: 0, fontSize: 5, lineHeight: 'lead', color: 'textSecondary' }}>
          The management link may be mistyped, or the secret it points to has already been
          revoked, expired, or reached its view limit.
        </p>
        <Link
          to="/"
          sx={{
            display: 'inline-flex',
            alignSelf: 'center',
            alignItems: 'center',
            gap: 2,
            fontSize: 4,
            fontWeight: 'medium',
          }}
        >
          Create a secret link
          <ArrowRight size={14} />
        </Link>
      </Card>
    </Rise>
  );
}

/** Terminal state right after this session revoked the secret. */
export function ManageRevokedState() {
  return (
    <Rise>
      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 5, textAlign: 'center' }}>
        <span
          sx={{
            display: 'flex',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 6,
            backgroundColor: 'rgba(255,92,122,0.11)',
            border: '1px solid',
            borderColor: 'rgba(255,92,122,0.3)',
            color: 'danger',
          }}
        >
          <Trash size={22} />
        </span>
        <h1 sx={{ variant: 'text.pageTitle' }}>This secret has been revoked.</h1>
        <p sx={{ m: 0, fontSize: 5, lineHeight: 'lead', color: 'textSecondary' }}>
          It and its access log have been permanently deleted from the server. The share link no
          longer works for anyone who still has it.
        </p>
        <Link
          to="/"
          sx={{
            display: 'inline-flex',
            alignSelf: 'center',
            alignItems: 'center',
            gap: 2,
            fontSize: 4,
            fontWeight: 'medium',
          }}
        >
          Create a new secret
          <ArrowRight size={14} />
        </Link>
      </Card>
    </Rise>
  );
}
