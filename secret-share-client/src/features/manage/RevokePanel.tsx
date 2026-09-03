/** @jsxImportSource theme-ui */
import { Button } from '@components/ui';
import { Trash } from '@components/icons';

export interface RevokePanelProps {
  onRevoke: () => void;
  /** Picks the copy variant — softer wording when nothing has touched the
   *  link yet, sharper wording once there is real activity to lose. */
  hasActivity: boolean;
}

/**
 * The destructive section: always visually set apart in red so it never
 * blends in with the informational cards above it.
 */
export function RevokePanel({ onRevoke, hasActivity }: RevokePanelProps) {
  return (
    <section
      sx={{
        display: 'flex',
        flexDirection: ['column', 'row'],
        alignItems: ['stretch', 'flex-start'],
        gap: 4,
        p: [4, 5],
        border: '1px solid',
        borderColor: 'rgba(255,92,122,0.26)',
        borderRadius: 6,
        backgroundColor: 'rgba(255,92,122,0.045)',
      }}
    >
      <div sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 38,
            height: 38,
            borderRadius: 4,
            backgroundColor: 'rgba(255,92,122,0.11)',
            border: '1px solid',
            borderColor: 'rgba(255,92,122,0.3)',
            color: 'danger',
          }}
        >
          <Trash size={19} />
        </span>
        <h2 sx={{ variant: 'text.cardHeading', fontSize: 8, display: [null, 'none'] }}>
          Revoke this secret
        </h2>
      </div>

      <div sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <h2 sx={{ variant: 'text.cardHeading', fontSize: 8, display: ['none', 'block'] }}>
          Revoke this secret
        </h2>
        <p sx={{ m: 0, maxWidth: '62ch', fontSize: 3, lineHeight: 'lead', color: 'textSecondary' }}>
          {hasActivity
            ? 'Destroy the secret and its access log right now, before the view limit or the expiry date is reached. Anyone still holding the share link will be told the link does not exist. This cannot be undone.'
            : "Sent the link to the wrong person? Revoke it now, before anyone opens it. The secret is destroyed immediately and the link stops working. This cannot be undone."}
        </p>
      </div>

      <Button
        variant="destructive"
        icon={<Trash size={16} />}
        onClick={onRevoke}
        sx={{ flexShrink: 0, width: ['100%', 'auto'], height: [50, 44] }}
      >
        Revoke secret
      </Button>
    </section>
  );
}

export default RevokePanel;
