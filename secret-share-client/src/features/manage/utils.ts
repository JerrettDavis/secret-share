import { GetSecretStatsResponse } from '@generated/models/GetSecretStatsResponse';
import type { ISecretAccessLog } from '@generated/models/ISecretAccessLog';

/**
 * Small, pure helpers shared across the manage-page components. Kept out of
 * the components themselves so `StatTiles`/`OverviewHeader`/etc. stay focused
 * on layout.
 */

/** `"9c1b4f2a…412e0"` — first 8 + last 5 characters, matching the canvas. */
export function truncateIdentifier(id: string): string {
  if (!id || id.length <= 15) return id;
  return `${id.slice(0, 8)}…${id.slice(-5)}`;
}

/** The three states a creator's secret can be in while it is still live. */
export type LiveStatus = 'active' | 'expired' | 'exhausted';

/**
 * The API's `status` field is a generated string enum, which TypeScript
 * treats as nominally distinct from the plain string union `StatusPill`
 * expects — hence the explicit mapping rather than a cast.
 */
export function mapSecretStatus(status?: GetSecretStatsResponse.status): LiveStatus {
  if (status === GetSecretStatsResponse.status.EXPIRED) return 'expired';
  if (status === GetSecretStatsResponse.status.EXHAUSTED) return 'exhausted';
  return 'active';
}

/**
 * How many of the log's *unique* IP addresses fall outside the creator's
 * allowlist. The stats endpoint reports `ipRestrictions` but not this
 * breakdown, and the access log is the only place the addresses that were
 * actually seen are recorded — so it is derived here rather than trusted from
 * the server. Returns 0 whenever no restriction is configured (the number is
 * meaningless without one).
 */
export function countAddressesOffAllowlist(
  logs: ReadonlyArray<ISecretAccessLog>,
  ipRestrictions: ReadonlyArray<string>,
): number {
  if (ipRestrictions.length === 0) return 0;
  const allowed = new Set(ipRestrictions);
  const seen = new Set<string>();
  let offList = 0;
  for (const log of logs) {
    const ip = log.ipAddress;
    if (!ip || seen.has(ip)) continue;
    seen.add(ip);
    if (!allowed.has(ip)) offList += 1;
  }
  return offList;
}

/** `1 view` / `2 views` — the only pluralisation this feature needs. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}
