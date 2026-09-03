import { useCallback, useEffect, useMemo, useState } from 'react';
import { secretsApi } from '@api/client';
import { ApiError } from '@generated/core/ApiError';
import type { ICreateSecretRequest } from '@generated/models/ICreateSecretRequest';
import { hashPassword } from '@lib/hashPassword';
import { formatUtc } from '@lib/format';
import { buildManageLink, buildShareLink, encryptSecret } from './crypto';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export type CreatePhase = 'editing' | 'encrypting' | 'done';

/** Which client-side step is in flight while `phase === 'encrypting'`. */
export type EncryptStage = 'sealing' | 'uploading';

export type ViewLimitPreset = '1' | '3' | '5' | '10' | 'custom';
export type ExpirationPreset = '1h' | '24h' | '7d' | '30d' | 'custom';

export interface ProtectionToggles {
  password: boolean;
  ipAllowlist: boolean;
  viewLimit: boolean;
  expiration: boolean;
  email: boolean;
}

export interface CreateOptionsState {
  password: string;
  ipAllowlist: string[];
  viewLimitPreset: ViewLimitPreset;
  /** Raw text of the "Custom" view-limit input. */
  viewLimitCustom: string;
  expirationPreset: ExpirationPreset;
  /** Raw `datetime-local` value of the "Pick a date" expiration input. */
  expirationCustomDate: string;
  email: string;
}

/** Server-provided defaults, normalised to always have a usable value. */
export interface ResolvedDefaults {
  maxViews: number;
  /** Default expiration length, in milliseconds (the unit the API uses). */
  expirationMs: number;
}

export interface ProtectionSummary {
  /** Compact form for the Protections card header, e.g. `"3 views · 24 h · +3"`. */
  chip: string;
  /** Full recap shown under the submit button, e.g. `"3 views · expires in 24 hours · password"`. */
  recap: string;
}

export interface CreateSuccessResult {
  shareLink: string;
  manageLink: string;
  views: number;
  expiresAtIso: string;
  passwordProtected: boolean;
  ipAllowlistCount: number;
  emailNotified: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────

const VIEW_LIMIT_VALUES: Record<Exclude<ViewLimitPreset, 'custom'>, number> = {
  '1': 1,
  '3': 3,
  '5': 5,
  '10': 10,
};

const EXPIRATION_MS: Record<Exclude<ExpirationPreset, 'custom'>, number> = {
  '1h': 3_600_000,
  '24h': 86_400_000,
  '7d': 604_800_000,
  '30d': 2_592_000_000,
};

const FALLBACK_DEFAULTS: ResolvedDefaults = { maxViews: 1, expirationMs: EXPIRATION_MS['7d'] };

const INITIAL_TOGGLES: ProtectionToggles = {
  password: false,
  ipAllowlist: false,
  viewLimit: false,
  expiration: false,
  email: false,
};

const INITIAL_OPTIONS: CreateOptionsState = {
  password: '',
  ipAllowlist: [],
  viewLimitPreset: '1',
  viewLimitCustom: '1',
  expirationPreset: '24h',
  expirationCustomDate: '',
  email: '',
};

// ─────────────────────────────────────────────────────────────────────────
// Pure helpers — exported for the protection components to render captions
// with the exact same numbers the hook will actually submit.
// ─────────────────────────────────────────────────────────────────────────

export { EXPIRATION_MS as EXPIRATION_PRESET_MS };

/** `1` -> `"1st"`, `3` -> `"3rd"`, `11` -> `"11th"`, etc. */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** `"1 h"` under 36h, otherwise `"N days"` — used for both presets and defaults. */
export function msToShortLabel(ms: number): string {
  const hours = ms / 3_600_000;
  if (hours < 36) return `${Math.round(hours)} h`;
  return `${Math.round(ms / 86_400_000)} days`;
}

/** `"1 hour"` / `"24 hours"` / `"7 days"` — long form for captions and recap text. */
export function msToLongLabel(ms: number): string {
  const hours = ms / 3_600_000;
  if (hours < 36) {
    const h = Math.round(hours);
    return `${h} ${h === 1 ? 'hour' : 'hours'}`;
  }
  const days = Math.round(ms / 86_400_000);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

function nearestViewLimitPreset(n: number): ViewLimitPreset {
  const match = (Object.entries(VIEW_LIMIT_VALUES) as Array<[Exclude<ViewLimitPreset, 'custom'>, number]>).find(
    ([, v]) => v === n,
  );
  return match ? match[0] : 'custom';
}

function nearestExpirationPreset(ms: number): ExpirationPreset {
  let best: ExpirationPreset = '24h';
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const [key, value] of Object.entries(EXPIRATION_MS) as Array<
    [Exclude<ExpirationPreset, 'custom'>, number]
  >) {
    const diff = Math.abs(value - ms);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = key;
    }
  }
  return best;
}

/** The view-limit number that will actually be submitted, given the current state. */
export function resolveViewLimit(options: CreateOptionsState, fallback: number): number {
  if (options.viewLimitPreset === 'custom') {
    const n = Number.parseInt(options.viewLimitCustom, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }
  return VIEW_LIMIT_VALUES[options.viewLimitPreset];
}

/** The expiration `Date` that will actually be submitted, given the current state. */
export function resolveExpirationDate(options: CreateOptionsState, fallbackMs: number): Date {
  if (options.expirationPreset === 'custom') {
    if (options.expirationCustomDate) {
      const d = new Date(options.expirationCustomDate);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date(Date.now() + fallbackMs);
  }
  return new Date(Date.now() + EXPIRATION_MS[options.expirationPreset]);
}

function expirationChipLabel(options: CreateOptionsState, fallbackMs: number): string {
  if (options.expirationPreset === 'custom' && options.expirationCustomDate) {
    const d = new Date(options.expirationCustomDate);
    if (!Number.isNaN(d.getTime())) return formatUtc(d.toISOString());
  }
  const ms = options.expirationPreset === 'custom' ? fallbackMs : EXPIRATION_MS[options.expirationPreset];
  return msToShortLabel(ms);
}

function expirationRecapPhrase(options: CreateOptionsState, fallbackMs: number): string {
  if (options.expirationPreset === 'custom' && options.expirationCustomDate) {
    const d = new Date(options.expirationCustomDate);
    if (!Number.isNaN(d.getTime())) return `expires on ${formatUtc(d.toISOString())}`;
  }
  const ms = options.expirationPreset === 'custom' ? fallbackMs : EXPIRATION_MS[options.expirationPreset];
  return `expires in ${msToLongLabel(ms)}`;
}

/**
 * Compact chip + full recap for the current selection. Shared by the
 * Protections card header and the pre-submit recap line so the two can never
 * disagree with each other or with what `submit()` will actually send.
 */
export function summarizeProtections(
  toggles: ProtectionToggles,
  options: CreateOptionsState,
  defaults: ResolvedDefaults,
): ProtectionSummary {
  const views = toggles.viewLimit ? resolveViewLimit(options, defaults.maxViews) : defaults.maxViews;
  const viewsLabel = pluralize(views, 'view', 'views');

  const expChip = toggles.expiration
    ? expirationChipLabel(options, defaults.expirationMs)
    : msToShortLabel(defaults.expirationMs);
  const expRecap = toggles.expiration
    ? expirationRecapPhrase(options, defaults.expirationMs)
    : `expires in ${msToLongLabel(defaults.expirationMs)}`;

  const extras: string[] = [];
  if (toggles.password && options.password) extras.push('password');
  if (toggles.ipAllowlist && options.ipAllowlist.length > 0) {
    extras.push(pluralize(options.ipAllowlist.length, 'allowed address', 'allowed addresses'));
  }
  if (toggles.email && options.email) extras.push('email on access');

  const chip = extras.length > 0 ? `${viewsLabel} · ${expChip} · +${extras.length}` : `${viewsLabel} · ${expChip}`;
  const recap = [viewsLabel, expRecap, ...extras].join(' · ');

  return { chip, recap };
}

// ─────────────────────────────────────────────────────────────────────────
// Error normalisation
// ─────────────────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/**
 * The old `EncryptForm` awaited the create request with no try/catch at all —
 * a failure (network drop, validation error, rate limit) surfaced only as an
 * unhandled promise rejection in the console, and the UI stayed stuck on
 * whatever it last rendered. This turns anything `submit()` can throw
 * (a WebCrypto failure, an `ApiError`, a plain network error) into copy a
 * person can act on.
 */
function toErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const body: unknown = e.body;
    if (isRecord(body) && typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }
    if (e.status === 429) return 'Too many attempts. Wait a few minutes and try again.';
    if (e.status >= 500) return 'The server had a problem creating this secret. Try again in a moment.';
    return `The server rejected this request (status ${e.status}). Check your options and try again.`;
  }
  if (e instanceof Error && e.message) return e.message;
  return 'Something went wrong while creating your secret. Try again.';
}

// ─────────────────────────────────────────────────────────────────────────
// The hook
// ─────────────────────────────────────────────────────────────────────────

export function useCreateSecret() {
  const [phase, setPhase] = useState<CreatePhase>('editing');
  const [stage, setStage] = useState<EncryptStage>('sealing');
  const [secret, setSecret] = useState('');
  const [toggles, setToggles] = useState<ProtectionToggles>(INITIAL_TOGGLES);
  const [options, setOptions] = useState<CreateOptionsState>(INITIAL_OPTIONS);
  const [defaults, setDefaults] = useState<ResolvedDefaults>(FALLBACK_DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateSuccessResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    secretsApi
      .getApiSecretsDefaults()
      .then((res) => {
        if (cancelled) return;
        const maxViews = res.data?.maxViews ?? FALLBACK_DEFAULTS.maxViews;
        const expirationMs = res.data?.defaultExpirationLength ?? FALLBACK_DEFAULTS.expirationMs;
        setDefaults({ maxViews, expirationMs });
        setOptions((prev) => ({
          ...prev,
          viewLimitPreset: nearestViewLimitPreset(maxViews),
          viewLimitCustom: String(maxViews),
          expirationPreset: nearestExpirationPreset(expirationMs),
        }));
      })
      .catch(() => {
        // Defaults are only a prefill convenience — every field stays
        // editable against the hard-coded fallback if this request fails.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setToggle = useCallback((key: keyof ProtectionToggles, next: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: next }));
  }, []);

  const setOption = useCallback(
    <K extends keyof CreateOptionsState>(key: K, value: CreateOptionsState[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const submit = useCallback(async () => {
    if (!secret) return;
    setError(null);
    setStage('sealing');
    setPhase('encrypting');

    try {
      const { encryptedSecret, keyB64, ivB64 } = await encryptSecret(secret);
      setStage('uploading');

      const body: ICreateSecretRequest = { encryptedSecret };

      if (toggles.password && options.password) {
        body.secretPassword = await hashPassword(options.password);
      }
      if (toggles.ipAllowlist) {
        // Always a real array here — an empty allowlist sends `[]`. The old
        // form built this from a comma-separated text field via
        // `ipList.split(',')`, which on empty input produced `['']` (one
        // bogus empty-string entry that blocked every address). `ChipInput`
        // never produces that, so the bug cannot recur.
        body.ipRestrictions = options.ipAllowlist;
      }
      if (toggles.viewLimit) {
        body.maxViews = resolveViewLimit(options, defaults.maxViews);
      }
      if (toggles.expiration) {
        body.expirationDate = resolveExpirationDate(options, defaults.expirationMs).toISOString();
      }
      if (toggles.email && options.email) {
        body.emailNotification = options.email;
      }

      const response = await secretsApi.postApiSecrets(body);
      const identifier = response.data?.identifier;
      const creatorIdentifier = response.data?.creatorIdentifier;
      if (!identifier || !creatorIdentifier) {
        throw new Error('The server accepted the secret but did not return a link. Please try again.');
      }

      const views = toggles.viewLimit ? resolveViewLimit(options, defaults.maxViews) : defaults.maxViews;
      const expiresAt = toggles.expiration
        ? resolveExpirationDate(options, defaults.expirationMs)
        : new Date(Date.now() + defaults.expirationMs);

      setResult({
        shareLink: buildShareLink(identifier, keyB64, ivB64),
        manageLink: buildManageLink(creatorIdentifier),
        views,
        expiresAtIso: expiresAt.toISOString(),
        passwordProtected: toggles.password && !!options.password,
        ipAllowlistCount: toggles.ipAllowlist ? options.ipAllowlist.length : 0,
        emailNotified: toggles.email && !!options.email,
      });
      setSecret('');
      setPhase('done');
    } catch (e) {
      // Stay on the encrypting screen: `EncryptingState` swaps its checklist
      // for a retry-capable error instead of the page silently doing nothing
      // (or, as before, throwing an unhandled rejection).
      setError(toErrorMessage(e));
    }
  }, [secret, toggles, options, defaults]);

  const backToEditing = useCallback(() => {
    setError(null);
    setPhase('editing');
  }, []);

  const startOver = useCallback(() => {
    setError(null);
    setResult(null);
    setStage('sealing');
    setSecret('');
    setToggles(INITIAL_TOGGLES);
    // Keep the defaults-derived prefill (view limit / expiration presets);
    // only the toggles and the sensitive/one-off fields reset.
    setOptions((prev) => ({
      ...INITIAL_OPTIONS,
      viewLimitPreset: prev.viewLimitPreset,
      viewLimitCustom: prev.viewLimitCustom,
      expirationPreset: prev.expirationPreset,
    }));
    setPhase('editing');
  }, []);

  const summary = useMemo(() => summarizeProtections(toggles, options, defaults), [toggles, options, defaults]);

  return {
    phase,
    stage,
    secret,
    setSecret,
    toggles,
    setToggle,
    options,
    setOption,
    defaults,
    summary,
    error,
    result,
    submit,
    retry: submit,
    backToEditing,
    startOver,
  };
}

export default useCreateSecret;
