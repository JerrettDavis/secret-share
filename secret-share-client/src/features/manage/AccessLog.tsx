/** @jsxImportSource theme-ui */
import { Card, Callout, SegmentedControl, keyframes } from '@components/ui';
import { Eye, Info } from '@components/icons';
import { useIsDesktop } from '@lib/hooks/useIsDesktop';
import type { ISecretAccessLog } from '@generated/models/ISecretAccessLog';
import type { LogFilter } from './useSecretManagement';
import AccessLogTable from './AccessLogTable';
import AccessLogCards from './AccessLogCards';

export interface AccessLogProps {
  /** The full, unfiltered log — used only to tell "no attempts at all" apart
   *  from "no attempts matching the current filter". */
  logs: ISecretAccessLog[];
  filteredLogs: ISecretAccessLog[];
  filter: LogFilter;
  onFilterChange: (filter: LogFilter) => void;
  grantedCount: number;
  refusedCount: number;
}

const FILTER_OPTIONS = (granted: number, refused: number) => [
  { value: 'all' as const, label: `All ${granted + refused}` },
  { value: 'granted' as const, label: `Granted ${granted}` },
  { value: 'refused' as const, label: `Refused ${refused}` },
];

function EmptyLog() {
  return (
    <div sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, px: 6, py: [8, 11] }}>
      <div sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 76, height: 76 }}>
        <span
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 9,
            border: '1px dashed',
            borderColor: 'borderStrong',
            animation: `${keyframes.ringout} 3s ease-out infinite`,
          }}
        />
        <span
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 9,
            border: '1px dashed',
            borderColor: 'borderStrong',
            animation: `${keyframes.ringout} 3s ease-out 1.5s infinite`,
          }}
        />
        <span
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 54,
            height: 54,
            borderRadius: 9,
            border: '1px solid',
            borderColor: 'borderStrong',
            bg: 'surfaceRaised',
            color: 'textMuted',
          }}
        >
          <Eye size={24} />
        </span>
      </div>

      <div sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
        <h3 sx={{ variant: 'text.cardHeading', fontSize: 8 }}>No one has opened this link yet.</h3>
        <p sx={{ m: 0, maxWidth: '52ch', fontSize: 4, lineHeight: 'lead', color: 'textDim' }}>
          The first attempt will appear here within seconds of it happening — with the time,
          whether it was granted, the address it came from and the client it used.
        </p>
      </div>

      <Callout tone="info" icon={<Info size={16} />} sx={{ maxWidth: '56ch' }}>
        <p sx={{ m: 0, fontSize: 1, lineHeight: 'lead' }}>
          The share link can&rsquo;t be shown here. Its decryption key never reached the server, so
          the only copy is the one you saved when you created the secret.
        </p>
      </Callout>
    </div>
  );
}

/**
 * The access log section: filter controls, then a desktop table or a mobile
 * card stack depending on `useIsDesktop()` — the one place in this feature
 * where mobile is a genuinely different DOM tree rather than different
 * numbers on the same one.
 */
export function AccessLog({
  logs,
  filteredLogs,
  filter,
  onFilterChange,
  grantedCount,
  refusedCount,
}: AccessLogProps) {
  const isDesktop = useIsDesktop();
  const hasAnyLogs = logs.length > 0;

  return (
    <Card variant="surface" flush sx={{ overflow: 'hidden', borderRadius: 6 }}>
      <div
        sx={{
          display: 'flex',
          flexDirection: ['column', 'row'],
          alignItems: [null, 'center'],
          justifyContent: 'space-between',
          gap: 4,
          p: [4, 5],
        }}
      >
        <div sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <h2 sx={{ variant: 'text.cardHeading' }}>Access log</h2>
          <p sx={{ m: 0, fontSize: 3, color: 'textDim' }}>
            Every attempt on this link, granted or refused, newest first.
          </p>
        </div>

        {hasAnyLogs ? (
          <SegmentedControl
            label="Filter access attempts"
            value={filter}
            onChange={onFilterChange}
            options={FILTER_OPTIONS(grantedCount, refusedCount)}
            columns={[3, 3]}
            sx={{ width: [null, 'auto'], minWidth: [null, 280] }}
          />
        ) : (
          <span
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              alignSelf: ['flex-start', 'auto'],
              px: 4,
              py: 2,
              borderRadius: 2,
              bg: 'chip',
              fontSize: 1,
              color: 'textDim',
            }}
          >
            <span
              aria-hidden
              sx={{ width: '7px', height: '7px', borderRadius: 9, bg: 'primary' }}
            />
            Watching for the first attempt
          </span>
        )}
      </div>

      {!hasAnyLogs ? (
        <EmptyLog />
      ) : filteredLogs.length === 0 ? (
        <p sx={{ m: 0, px: 5, py: 9, textAlign: 'center', fontSize: 3, color: 'textMuted' }}>
          No {filter} attempts recorded.
        </p>
      ) : isDesktop ? (
        <AccessLogTable logs={filteredLogs} />
      ) : (
        <AccessLogCards logs={filteredLogs} />
      )}

      {hasAnyLogs ? (
        <div sx={{ p: [4, 5], borderTop: '1px solid', borderColor: 'borderSubtle', bg: 'surfaceSubtle' }}>
          <span sx={{ fontSize: 1, color: 'textMuted' }}>
            Logs live with the secret and are destroyed along with it — at the view limit, at
            expiry, or when you revoke it below.
          </span>
        </div>
      ) : null}
    </Card>
  );
}

export default AccessLog;
