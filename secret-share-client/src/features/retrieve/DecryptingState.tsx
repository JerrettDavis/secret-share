/** @jsxImportSource theme-ui */
import { BracketFrame, Card, Spinner, SweepBar } from '@components/ui';
import { ringout } from '@components/ui/keyframes';
import { Lock } from '@components/icons';

/**
 * Brief transition between "password accepted" and "secret revealed".
 *
 * Real work here (an AES-GCM decrypt via WebCrypto) is near-instant, so this
 * is on screen for a moment at most — but it is the moment the server is
 * asked to destroy its copy, so it earns a beat of its own rather than a bare
 * spinner over a blank page.
 */
export function DecryptingState() {
  return (
    <BracketFrame radius={14}>
      <Card flush sx={{ overflow: 'hidden' }}>
        <SweepBar label="Decrypting" height={3} sx={{ borderRadius: 0 }} />

        <div
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            px: [6, 9],
            py: [9, 10],
          }}
        >
          <span
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 62,
              height: 62,
            }}
          >
            <span
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 9,
                border: '1px solid',
                borderColor: 'primaryLine',
                animation: `${ringout} 2.2s ease-out infinite`,
              }}
            />
            <span
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 9,
                border: '1px solid',
                borderColor: 'primaryLine',
                animation: `${ringout} 2.2s ease-out 1.1s infinite`,
              }}
            />
            <span
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 62,
                height: 62,
                borderRadius: 9,
                bg: 'primarySoft',
                border: '1px solid',
                borderColor: 'primaryLine',
                color: 'primary',
              }}
            >
              <Lock size={26} />
            </span>
          </span>

          <div
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              textAlign: 'center',
            }}
          >
            <h1
              sx={{
                m: 0,
                fontFamily: 'heading',
                fontWeight: 'heading',
                letterSpacing: 'heading',
                fontSize: 10,
                color: 'text',
              }}
            >
              Opening your secret
            </h1>
            <p
              sx={{
                m: 0,
                maxWidth: '40ch',
                fontSize: 4,
                lineHeight: 'body',
                color: 'textSecondary',
              }}
            >
              This is the one time it opens. Keep the tab in front of you.
            </p>
          </div>

          <div
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              px: 4,
              py: 3,
              width: '100%',
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'borderDim',
            }}
          >
            <Spinner size={18} />
            <span sx={{ fontSize: 4, fontWeight: 'medium', color: 'text' }}>
              Decrypting with the key from your link
            </span>
          </div>

          <p
            sx={{
              m: 0,
              maxWidth: '44ch',
              textAlign: 'center',
              fontSize: 1,
              lineHeight: 'body',
              color: 'textMuted',
            }}
          >
            Decryption happens here, in your browser. The server never sees the key or the plain
            text.
          </p>
        </div>
      </Card>
    </BracketFrame>
  );
}

export default DecryptingState;
