/** @jsxImportSource theme-ui */
import type { ReactNode } from 'react';
import type { ISecretAccessLog } from '@generated/models/ISecretAccessLog';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div sx={{ display: 'flex', flexDirection: ['column', 'row'], gap: [1, 4] }}>
      <span sx={{ flexShrink: 0, width: [null, '110px'], fontSize: 1, color: 'textMuted' }}>
        {label}
      </span>
      <span
        sx={{
          flexGrow: 1,
          minWidth: 0,
          fontSize: 1,
          lineHeight: 'body',
          color: 'textSecondary',
          overflowWrap: 'anywhere',
        }}
      >
        {children}
      </span>
    </div>
  );
}

export interface AccessLogDetailsProps {
  log: ISecretAccessLog;
}

/**
 * The raw material behind one access-attempt row: the full user-agent
 * string, the referrer, and whatever request headers were recorded. Shared
 * between the desktop table's row expansion and the mobile card's disclosure
 * so the two never drift apart.
 */
export function AccessLogDetails({ log }: AccessLogDetailsProps) {
  const headers = log.requestHeaders ?? [];

  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 4,
        border: '1px solid',
        borderColor: 'borderDim',
        borderRadius: 4,
        bg: 'well',
      }}
    >
      <Row label="User agent">
        <span sx={{ fontFamily: 'monospace' }}>{log.userAgent || 'Not recorded'}</span>
      </Row>
      <Row label="Referrer">
        {log.referrer ? (
          <span sx={{ fontFamily: 'monospace' }}>{log.referrer}</span>
        ) : (
          <span sx={{ color: 'textFaint' }}>No referrer</span>
        )}
      </Row>
      <Row label="Request headers">
        {headers.length === 0 ? (
          <span sx={{ color: 'textFaint' }}>None recorded</span>
        ) : (
          <div sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {headers.map((h, i) => (
              <span key={i} sx={{ fontFamily: 'monospace' }}>
                {h}
              </span>
            ))}
          </div>
        )}
      </Row>
      {log.requestBody ? (
        <Row label="Request body">
          <span sx={{ fontFamily: 'monospace' }}>{log.requestBody}</span>
        </Row>
      ) : null}
    </div>
  );
}

export default AccessLogDetails;
