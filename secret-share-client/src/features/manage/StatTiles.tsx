/** @jsxImportSource theme-ui */
import type { ReactNode } from 'react';
import { Card, ProgressBar } from '@components/ui';
import { formatRelative, formatUtc } from '@lib/format';

export interface StatTilesProps {
  reportedViews: number;
  /** `null` = unlimited views. */
  maxViews: number | null;
  /** `null` = never expires. */
  expirationDate: string | null;
  grantedAttempts: number;
  refusedAttempts: number;
  uniqueViews: number;
  /** Of the unique addresses seen, how many are outside the IP allowlist. */
  addressesOffAllowlist: number;
  hasIpRestrictions: boolean;
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card
      variant="surface"
      flush
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: [4, 5],
        borderRadius: 5,
      }}
    >
      <span sx={{ fontSize: 1, fontWeight: 'medium', color: 'textDim' }}>{label}</span>
      {children}
    </Card>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      sx={{ width: '6px', height: '6px', borderRadius: 9, flexShrink: 0, bg: color }}
    />
  );
}

/**
 * The four headline tiles. 4-across from `48em`, 2x2 below it.
 *
 * `maxViews === null` (unlimited) is the one real edge case here: a progress
 * bar has no denominator to draw against, so that tile swaps the bar for a
 * plain "no limit" caption instead of rendering a bar that is always empty
 * (which would misleadingly read as "no views used yet").
 */
export function StatTiles({
  reportedViews,
  maxViews,
  expirationDate,
  grantedAttempts,
  refusedAttempts,
  uniqueViews,
  addressesOffAllowlist,
  hasIpRestrictions,
}: StatTilesProps) {
  const totalAttempts = grantedAttempts + refusedAttempts;

  return (
    <div
      sx={{
        display: 'grid',
        gridTemplateColumns: ['repeat(2, minmax(0, 1fr))', 'repeat(4, minmax(0, 1fr))'],
        gap: 3,
      }}
    >
      <Tile label="Views used">
        <div sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span sx={{ fontFamily: 'heading', fontSize: 11, fontWeight: 'heading', letterSpacing: 'heading' }}>
            {reportedViews}
          </span>
          <span sx={{ fontFamily: 'heading', fontSize: 8, fontWeight: 'medium', color: 'textMuted' }}>
            {maxViews === null ? 'views so far' : `of ${maxViews}`}
          </span>
        </div>
        {maxViews === null ? (
          <span sx={{ fontSize: 0, color: 'textMuted' }}>No view limit set</span>
        ) : (
          <ProgressBar value={reportedViews} max={maxViews} label="Views used" />
        )}
      </Tile>

      <Tile label="Expires">
        <span sx={{ fontFamily: 'heading', fontSize: 11, fontWeight: 'heading', letterSpacing: 'heading' }}>
          {expirationDate ? formatRelative(expirationDate) : 'Never'}
        </span>
        <span sx={{ fontFamily: 'monospace', fontSize: 0, color: 'textMuted' }}>
          {expirationDate ? formatUtc(expirationDate) : 'No expiration date set'}
        </span>
      </Tile>

      <Tile label="Access attempts">
        <span
          sx={{
            fontFamily: 'heading',
            fontSize: 11,
            fontWeight: 'heading',
            letterSpacing: 'heading',
            color: totalAttempts === 0 ? 'textFaint' : 'text',
          }}
        >
          {totalAttempts}
        </span>
        {totalAttempts === 0 ? (
          <span sx={{ fontSize: 0, color: 'textFaint' }}>Nothing yet</span>
        ) : (
          <span sx={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 0, color: 'textMuted' }}>
            <span sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Dot color="success" />
              {grantedAttempts} granted
            </span>
            <span sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Dot color="danger" />
              {refusedAttempts} refused
            </span>
          </span>
        )}
      </Tile>

      <Tile label="Unique addresses">
        <span
          sx={{
            fontFamily: 'heading',
            fontSize: 11,
            fontWeight: 'heading',
            letterSpacing: 'heading',
            color: uniqueViews === 0 ? 'textFaint' : 'text',
          }}
        >
          {uniqueViews}
        </span>
        <span sx={{ fontSize: 0, lineHeight: 'body', color: 'textMuted' }}>
          {uniqueViews === 0
            ? 'Nothing yet'
            : hasIpRestrictions
              ? `${addressesOffAllowlist} of them not on your allowlist`
              : 'No address restrictions set'}
        </span>
      </Tile>
    </div>
  );
}

export default StatTiles;
