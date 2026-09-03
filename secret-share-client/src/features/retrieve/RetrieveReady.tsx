/** @jsxImportSource theme-ui */
import { Link } from 'react-router-dom';
import { BracketFrame, Card, Rise, SlideToConfirm } from '@components/ui';
import { ArrowRight, Lock, Shield, Trash } from '@components/icons';

export interface RetrieveReadyProps {
  /** True while the initial (no-password) retrieve request is in flight. */
  busy: boolean;
  /** Fired once, when the slide gesture is confirmed. */
  onConfirm: () => void;
}

const FEATURES = [
  { icon: <Shield size={16} />, label: 'Decrypted in your browser' },
  { icon: <Trash size={16} />, label: 'Deleted after viewing' },
];

/**
 * The reveal-gesture screen — the first thing a recipient sees.
 *
 * Copy is deliberate about the one-time nature of the link: this is the last
 * point before the secret is destroyed server-side, so the slide gesture is
 * intentionally awkward to trigger by accident (see `SlideToConfirm`).
 */
export function RetrieveReady({ busy, onConfirm }: RetrieveReadyProps) {
  return (
    <Rise sx={{ display: 'flex', flexDirection: 'column', gap: [6, 7] }}>
      <BracketFrame radius={14}>
        <Card sx={{ display: 'flex', flexDirection: 'column', gap: [6, 7] }}>
          <div sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span sx={{ variant: 'badges.eyebrow', alignSelf: 'flex-start' }}>
              <Lock size={12} />
              A secret is waiting for you
            </span>
            <h1 sx={{ variant: 'text.display' }}>You can open this once.</h1>
            <p sx={{ variant: 'text.lead' }}>
              The moment you open it, the secret is decrypted here and destroyed on the server.
              Have somewhere ready to paste it before you slide.
            </p>
          </div>

          <div sx={{ display: 'flex', flexDirection: ['column', 'row'], gap: 3 }}>
            {FEATURES.map((f) => (
              <div
                key={f.label}
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  minHeight: 'touch',
                  px: 4,
                  border: '1px solid',
                  borderColor: 'borderDim',
                  borderRadius: 4,
                  bg: 'well',
                }}
              >
                <span sx={{ flexShrink: 0, display: 'flex', color: 'primary' }}>{f.icon}</span>
                <span sx={{ fontSize: 1, lineHeight: 'body', color: 'textSecondary' }}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>

          <div sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <SlideToConfirm
              onConfirm={onConfirm}
              label="Slide to decrypt"
              busyLabel="Opening…"
              busy={busy}
            />
            <p sx={{ variant: 'text.caption', textAlign: 'center' }}>
              Deliberately hard to press by accident. There is no second attempt.
            </p>
          </div>
        </Card>
      </BracketFrame>

      <div
        sx={{
          display: 'flex',
          flexDirection: ['column', 'row'],
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          fontSize: 3,
          color: 'textDim',
        }}
      >
        Need to send one of your own?
        <Link
          to="/"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 'medium' }}
        >
          Create a secret link
          <ArrowRight size={14} />
        </Link>
      </div>
    </Rise>
  );
}

export default RetrieveReady;
