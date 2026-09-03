/** @jsxImportSource theme-ui */
import { useState } from 'react';
import { StatusPill } from '@components/ui';
import { ChevronDown, ChevronUp } from '@components/icons';
import { formatLogTime } from '@lib/format';
import { formatUserAgent } from '@lib/userAgent';
import type { ISecretAccessLog } from '@generated/models/ISecretAccessLog';
import AccessLogDetails from './AccessLogDetails';

export interface AccessLogCardsProps {
  logs: ISecretAccessLog[];
}

function Pair({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span sx={{ fontSize: 0, color: 'textMuted' }}>{label}</span>
      <span sx={{ fontSize: 3, lineHeight: 'body', color: 'textSecondary', overflowWrap: 'anywhere' }}>
        {children}
      </span>
    </>
  );
}

/**
 * The mobile access log: one self-contained card per attempt. No column ever
 * has to be revealed by scrolling sideways — long values (user agents,
 * referrer URLs) wrap in place instead of truncating, since there is no wide
 * column here to expose them in.
 */
export function AccessLogCards({ logs }: AccessLogCardsProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div sx={{ display: 'flex', flexDirection: 'column' }}>
      {logs.map((log, i) => {
        const isOpen = expanded === i;
        const referrer = log.referrer?.trim();

        return (
          <div
            key={i}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              p: 5,
              borderBottom: '1px solid',
              borderColor: 'borderSubtle',
              bg: isOpen ? 'surfaceRaised' : undefined,
            }}
          >
            <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
              <StatusPill status={log.accessGranted ? 'granted' : 'refused'} />
              <span sx={{ fontFamily: 'monospace', fontSize: 1, color: 'textDim' }}>
                {log.accessDate ? formatLogTime(log.accessDate) : '—'}
              </span>
            </div>

            <div sx={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '4px 10px', alignItems: 'baseline' }}>
              <Pair label="Address">
                <span sx={{ fontFamily: 'monospace' }}>{log.ipAddress || '—'}</span>
              </Pair>
              <Pair label="Client">
                {log.userAgent ? formatUserAgent(log.userAgent) : 'Unknown client'}
              </Pair>
              <Pair label="Came from">
                <span sx={{ color: referrer ? undefined : 'textFaint' }}>
                  {referrer || 'No referrer'}
                </span>
              </Pair>
            </div>

            {isOpen ? <AccessLogDetails log={log} /> : null}

            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : i)}
              aria-expanded={isOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                width: '100%',
                minHeight: 'touch',
                border: '1px solid',
                borderColor: 'border',
                borderRadius: 3,
                bg: 'surfaceSubtle',
                color: 'textSecondary',
                fontSize: 3,
                fontWeight: 'medium',
                cursor: 'pointer',
                '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
              }}
            >
              {isOpen ? 'Hide details' : 'Details'}
              {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default AccessLogCards;
