/** @jsxImportSource theme-ui */
import type { ReactNode } from 'react';
import { Card } from '@components/ui';
import { Globe, Key, Mail } from '@components/icons';
import { pluralize } from './utils';

export interface ProtectionsSummaryProps {
  hasPassword: boolean;
  ipRestrictions: string[];
  emailNotification: string | null;
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 2,
        borderRadius: 2,
        bg: 'chip',
        fontSize: 3,
        color: '#D3E4E9',
      }}
    >
      <span aria-hidden sx={{ display: 'flex', color: 'primary' }}>
        {icon}
      </span>
      {children}
    </span>
  );
}

/**
 * A compact strip of what is actively protecting this secret — password, IP
 * allowlist, notification address. Purely a summary of the fixed, at-creation
 * settings; it does not repeat the view-limit/expiry numbers already covered
 * by the stat tiles above it.
 */
export function ProtectionsSummary({
  hasPassword,
  ipRestrictions,
  emailNotification,
}: ProtectionsSummaryProps) {
  const chips: ReactNode[] = [];

  if (hasPassword) {
    chips.push(
      <Chip key="password" icon={<Key size={14} />}>
        Password required
      </Chip>,
    );
  }
  if (ipRestrictions.length > 0) {
    chips.push(
      <Chip key="ip" icon={<Globe size={14} />}>
        {ipRestrictions.length} allowed {pluralize(ipRestrictions.length, 'address', 'addresses')}
      </Chip>,
    );
  }
  if (emailNotification) {
    chips.push(
      <Chip key="email" icon={<Mail size={14} />}>
        Notifying {emailNotification}
      </Chip>,
    );
  }

  return (
    <Card
      variant="surface"
      flush
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
        p: [4, 5],
        borderRadius: 5,
      }}
    >
      <span sx={{ variant: 'text.cap' }}>Protections</span>
      {chips.length > 0 ? (
        chips
      ) : (
        <span sx={{ fontSize: 3, color: 'textMuted' }}>
          No password, no IP restrictions, and no notifications set on this secret.
        </span>
      )}
      <span sx={{ flexGrow: 1, display: ['none', 'block'] }} />
      {chips.length > 0 ? (
        <span sx={{ fontSize: 1, color: 'textMuted' }}>
          Protections are fixed once a secret is created.
        </span>
      ) : null}
    </Card>
  );
}

export default ProtectionsSummary;
