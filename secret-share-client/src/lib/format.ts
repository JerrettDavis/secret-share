/**
 * Date/time formatting helpers.
 *
 * Everything a secret's lifetime depends on (expiry, access-log timestamps) is
 * rendered in UTC on purpose: a secret that "expires at 14:20" must mean the
 * same instant to the creator and the recipient, wherever they are.
 *
 * Every function is total — an unparseable or empty input returns the raw
 * string rather than "Invalid Date".
 */

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parse(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** `"3 Sep 2026, 14:20 UTC"` */
export function formatUtc(iso: string): string {
  const d = parse(iso);
  if (!d) return iso;
  return (
    `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}, ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
  );
}

/** `"2 September 2026 at 14:20 UTC"` */
export function formatCreated(iso: string): string {
  const d = parse(iso);
  if (!d) return iso;
  return (
    `${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()} at ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
  );
}

/** `"2 Sep, 14:52:10"` — compact, for dense access-log rows. */
export function formatLogTime(iso: string): string {
  const d = parse(iso);
  if (!d) return iso;
  return (
    `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}, ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * `"in 23 h"`, `"in 4 d"`, `"in 12 min"`, `"23 h ago"`, `"now"`.
 *
 * Relative to the moment it is called, so callers that want it to tick need to
 * re-render on an interval themselves.
 */
export function formatRelative(iso: string): string {
  const d = parse(iso);
  if (!d) return iso;

  const delta = d.getTime() - Date.now();
  const abs = Math.abs(delta);
  const future = delta >= 0;

  let value: string;
  if (abs < 45_000) return 'now';
  if (abs < HOUR) value = `${Math.round(abs / MINUTE)} min`;
  else if (abs < DAY) value = `${Math.round(abs / HOUR)} h`;
  else if (abs < 60 * DAY) value = `${Math.round(abs / DAY)} d`;
  else value = `${Math.round(abs / (30 * DAY))} mo`;

  return future ? `in ${value}` : `${value} ago`;
}
