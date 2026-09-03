/** @jsxImportSource theme-ui */
import { useState } from 'react';
import { StatusPill } from '@components/ui';
import { ChevronDown, ChevronUp } from '@components/icons';
import { formatLogTime } from '@lib/format';
import { formatUserAgent } from '@lib/userAgent';
import type { ISecretAccessLog } from '@generated/models/ISecretAccessLog';
import AccessLogDetails from './AccessLogDetails';

export interface AccessLogTableProps {
  logs: ISecretAccessLog[];
}

const COLUMNS = '172px 128px 152px 236px minmax(0, 1fr) 24px';

/**
 * The desktop access log: a real 6-column grid acting as a table, each row
 * expandable to reveal the raw user agent, referrer and request headers.
 */
export function AccessLogTable({ logs }: AccessLogTableProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div role="table" aria-label="Access attempts" sx={{ display: 'flex', flexDirection: 'column' }}>
      <div
        role="row"
        sx={{
          display: 'grid',
          gridTemplateColumns: COLUMNS,
          alignItems: 'center',
          gap: 4,
          px: 5,
          py: 3,
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'borderSubtle',
          bg: 'surfaceSubtle',
          fontSize: 0,
          fontWeight: 'heading',
          letterSpacing: 'caps',
          textTransform: 'uppercase',
          color: 'textMuted',
        }}
      >
        <span role="columnheader">When</span>
        <span role="columnheader">Result</span>
        <span role="columnheader">Address</span>
        <span role="columnheader">Client</span>
        <span role="columnheader">Came from</span>
        <span role="columnheader" aria-hidden />
      </div>

      {logs.map((log, i) => {
        const isOpen = expanded === i;
        const referrer = log.referrer?.trim();

        return (
          <div
            key={i}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'borderSubtle',
              bg: isOpen ? 'surfaceRaised' : undefined,
            }}
          >
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : i)}
              aria-expanded={isOpen}
              sx={{
                display: 'grid',
                width: '100%',
                gridTemplateColumns: COLUMNS,
                alignItems: 'center',
                gap: 4,
                px: 5,
                py: 4,
                border: 'none',
                bg: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                '&:focus-visible': { outline: 'none', boxShadow: 'ringPrimary' },
              }}
            >
              <span sx={{ fontFamily: 'monospace', fontSize: 1, color: '#D3E4E9' }}>
                {log.accessDate ? formatLogTime(log.accessDate) : '—'}
              </span>
              <span sx={{ justifySelf: 'start' }}>
                <StatusPill status={log.accessGranted ? 'granted' : 'refused'} />
              </span>
              <span sx={{ fontFamily: 'monospace', fontSize: 1, color: '#D3E4E9' }}>
                {log.ipAddress || '—'}
              </span>
              <span
                sx={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontSize: 3,
                  color: '#B6C9CF',
                }}
              >
                {log.userAgent ? formatUserAgent(log.userAgent) : 'Unknown client'}
              </span>
              <span
                sx={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontSize: 3,
                  color: referrer ? 'textDim' : 'textFaint',
                }}
              >
                {referrer || 'No referrer'}
              </span>
              <span sx={{ display: 'flex', justifyContent: 'flex-end', color: 'textDim' }}>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {isOpen ? (
              <div sx={{ px: 5, pb: 5 }}>
                <AccessLogDetails log={log} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default AccessLogTable;
