import { ApiError } from '@generated/core/ApiError';

/**
 * Every distinguishable reason a retrieve attempt can fail.
 *
 * Most codes come straight off the wire as `body.errorCode`. Two are derived
 * on the client:
 *  - `RATE_LIMITED`   — HTTP 429 from the rate limiter, which has no body code;
 *  - `LINK_MALFORMED` — the link itself is broken (bad base64, missing key/iv
 *                       fragment, or decryption threw). The server never sees
 *                       these, so nothing can report them but us.
 */
export type RetrieveErrorCode =
  | 'NOT_FOUND'
  | 'EXPIRED'
  | 'VIEW_LIMIT_REACHED'
  | 'IP_NOT_ALLOWED'
  | 'PASSWORD_REQUIRED'
  | 'INVALID_PASSWORD'
  | 'RATE_LIMITED'
  | 'LINK_MALFORMED'
  | 'UNKNOWN';

export interface RetrieveError {
  code: RetrieveErrorCode;
  /** Server-supplied message where available; otherwise a sane default. */
  message: string;
  details?: {
    /** ISO timestamp — present on `EXPIRED`. */
    expiresAt?: string;
    /** The address the server saw — present on `IP_NOT_ALLOWED`. */
    clientIp?: string;
  };
}

const KNOWN_CODES: ReadonlySet<string> = new Set<RetrieveErrorCode>([
  'NOT_FOUND',
  'EXPIRED',
  'VIEW_LIMIT_REACHED',
  'IP_NOT_ALLOWED',
  'PASSWORD_REQUIRED',
  'INVALID_PASSWORD',
  'RATE_LIMITED',
  'LINK_MALFORMED',
  'UNKNOWN',
]);

const DEFAULT_MESSAGES: Record<RetrieveErrorCode, string> = {
  NOT_FOUND: 'This secret no longer exists.',
  EXPIRED: 'This secret has expired.',
  VIEW_LIMIT_REACHED: 'This secret has already been opened the maximum number of times.',
  IP_NOT_ALLOWED: 'This link cannot be opened from your network.',
  PASSWORD_REQUIRED: 'This secret is protected by a password.',
  INVALID_PASSWORD: 'That password is not correct.',
  RATE_LIMITED: 'Too many attempts. Wait a few minutes and try again.',
  LINK_MALFORMED: 'This link is incomplete or damaged.',
  UNKNOWN: 'Something went wrong opening this secret.',
};

/**
 * Last-resort mapping for servers that predate `errorCode`. Ordered most- to
 * least-specific; matched case-insensitively against `body.error`.
 */
const LEGACY_MESSAGE_PATTERNS: ReadonlyArray<[RegExp, RetrieveErrorCode]> = [
  [/invalid\s+(secret\s+)?password/i, 'INVALID_PASSWORD'],
  [/(secret\s+)?password\s+required/i, 'PASSWORD_REQUIRED'],
  [/view\s+limit/i, 'VIEW_LIMIT_REACHED'],
  [/ip\s+(is\s+)?not\s+allowed|ip\s+restrict/i, 'IP_NOT_ALLOWED'],
  [/expired/i, 'EXPIRED'],
  [/not\s+found/i, 'NOT_FOUND'],
  [/too\s+many\s+requests|rate\s*limit/i, 'RATE_LIMITED'],
];

/** A structural error thrown by the client itself before/after the request. */
export class LinkMalformedError extends Error {
  readonly code = 'LINK_MALFORMED' as const;
  constructor(message = DEFAULT_MESSAGES.LINK_MALFORMED) {
    super(message);
    this.name = 'LinkMalformedError';
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function pickDetails(body: unknown): RetrieveError['details'] | undefined {
  if (!isRecord(body) || !isRecord(body.details)) return undefined;
  const { expiresAt, clientIp } = body.details;
  const details: RetrieveError['details'] = {};
  if (typeof expiresAt === 'string') details.expiresAt = expiresAt;
  if (typeof clientIp === 'string') details.clientIp = clientIp;
  return Object.keys(details).length ? details : undefined;
}

function build(code: RetrieveErrorCode, message?: string, details?: RetrieveError['details']) {
  const err: RetrieveError = {
    code,
    message: message && message.trim() ? message : DEFAULT_MESSAGES[code],
  };
  if (details) err.details = details;
  return err;
}

/**
 * Normalise anything a failed retrieve can throw into a `RetrieveError`.
 *
 * Resolution order:
 *  1. our own `LinkMalformedError`;
 *  2. `body.errorCode` from the server (the authoritative source);
 *  3. HTTP status — 429 -> `RATE_LIMITED`, 404 -> `NOT_FOUND`;
 *  4. legacy string matching against `body.error`, so this still degrades
 *     usefully against a server that has not been upgraded;
 *  5. `UNKNOWN`.
 */
export function toRetrieveError(e: unknown): RetrieveError {
  if (e instanceof LinkMalformedError) {
    return build('LINK_MALFORMED', e.message);
  }

  if (e instanceof ApiError) {
    const body: unknown = e.body;
    const details = pickDetails(body);
    const serverMessage =
      isRecord(body) && typeof body.error === 'string' ? body.error : undefined;

    // 2. explicit code from the server
    if (isRecord(body) && typeof body.errorCode === 'string' && KNOWN_CODES.has(body.errorCode)) {
      return build(body.errorCode as RetrieveErrorCode, serverMessage, details);
    }

    // 3. status-derived codes
    if (e.status === 429) return build('RATE_LIMITED', serverMessage, details);
    if (e.status === 404) return build('NOT_FOUND', serverMessage, details);

    // 4. legacy message matching
    if (serverMessage) {
      for (const [re, code] of LEGACY_MESSAGE_PATTERNS) {
        if (re.test(serverMessage)) return build(code, serverMessage, details);
      }
    }

    return build('UNKNOWN', serverMessage, details);
  }

  // A network failure, an abort, or a decrypt that threw before we got here.
  if (e instanceof Error && e.message) {
    return build('UNKNOWN', e.message);
  }

  return build('UNKNOWN');
}

/** Convenience for UIs that only need copy for a code they already have. */
export function defaultMessageFor(code: RetrieveErrorCode): string {
  return DEFAULT_MESSAGES[code];
}
