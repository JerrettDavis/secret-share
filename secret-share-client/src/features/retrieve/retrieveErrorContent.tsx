/** @jsxImportSource theme-ui */
import { useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Clock,
  Copy,
  Globe,
  Info,
  Layers,
  LinkBroken,
  Plus,
  Warning,
} from '@components/icons';
import { defaultMessageFor, type RetrieveError, type RetrieveErrorCode } from '@api/errors';
import { formatUtc } from '@lib/format';

export interface ErrorContent {
  /** Left rail accent colour (theme token name or raw CSS colour). */
  railColor: string;
  cardBorderColor: string;
  cardBg: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  icon: ReactNode;
  title: string;
  /** Static copy, or a function for the rare code (`UNKNOWN`) that wants to fold in server detail. */
  body: string | ((error: RetrieveError) => string);
  /** Optional block between the lead paragraph and the actions — an expiry row, an IP row, a checklist, a callout. */
  renderDetail?: (error: RetrieveError) => ReactNode;
  /** Always at least the "create your own" link; some codes replace or add to it. */
  renderActions: (error: RetrieveError) => ReactNode;
}

const ICON_SIZE = 23;

/** The standard recovery action for every dead end: go make your own secret. */
function CreateOwnCta() {
  return (
    <Link
      to="/"
      sx={{
        variant: 'buttons.secondary',
        height: 'touch',
        alignSelf: 'flex-start',
        textDecoration: 'none',
      }}
    >
      <Plus size={16} />
      Create a secret of your own
    </Link>
  );
}

const COPY_RESET_MS = 2000;

/** "Copy my address" — for IP_NOT_ALLOWED, so the recipient can hand it to the sender to allowlist. */
function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      // Best-effort — the address is already shown on screen for manual copy.
    }
  }, [address]);

  return (
    <button
      type="button"
      onClick={copy}
      sx={{
        variant: 'buttons.secondary',
        height: 'touch',
        alignSelf: 'flex-start',
        cursor: 'pointer',
      }}
    >
      <Copy size={16} />
      {copied ? 'Copied' : 'Copy my address'}
    </button>
  );
}

const WORTH_CHECKING = [
  'Copy the link again, whole — chat apps and email clients often trim the long part after the last slash.',
  'Links are case-sensitive: two links that differ only in capitalisation are different secrets.',
  'The sender may have revoked the secret early, which removes it immediately.',
];

function ChecklistDetail() {
  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        px: 5,
        py: 4,
        border: '1px solid',
        borderColor: 'borderDim',
        borderRadius: 4,
        bg: 'well',
      }}
    >
      <span sx={{ variant: 'text.cap' }}>Worth checking</span>
      {WORTH_CHECKING.map((tip) => (
        <div key={tip} sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <Check size={15} sx={{ flexShrink: 0, marginTop: '2px', color: 'primary' }} />
          <span sx={{ fontSize: 3, lineHeight: 'body', color: 'textSecondary' }}>{tip}</span>
        </div>
      ))}
    </div>
  );
}

const neutralNotFound: ErrorContent = {
  railColor: '#4A616B',
  cardBorderColor: 'border',
  cardBg: 'surface',
  iconBg: 'chip',
  iconBorder: 'borderStrong',
  iconColor: 'textSecondary',
  icon: <LinkBroken size={ICON_SIZE} />,
  title: "We can't find this link.",
  body: 'Nothing on the server matches this address. Nine times out of ten the link was cut short somewhere between the sender and you.',
  renderDetail: () => <ChecklistDetail />,
  renderActions: () => <CreateOwnCta />,
};

const unknownFallback: ErrorContent = {
  railColor: 'borderStrong',
  cardBorderColor: 'border',
  cardBg: 'surface',
  iconBg: 'chip',
  iconBorder: 'borderStrong',
  iconColor: 'textSecondary',
  icon: <Info size={ICON_SIZE} />,
  title: 'Something went wrong opening this secret.',
  body: (error) => {
    const fallback = defaultMessageFor('UNKNOWN');
    if (error.message && error.message !== fallback) {
      return `Something went wrong opening this secret: ${error.message}`;
    }
    return 'Try again in a moment. If it keeps happening, ask the sender to create a fresh link.';
  },
  renderActions: () => <CreateOwnCta />,
};

/**
 * Copy, colour and layout for every terminal retrieve failure — sourced from
 * the design canvas (`ErrorExpired`, `ErrorViewed`, `ErrorNotFound`,
 * `ErrorIpBlocked`). `RetrieveErrorState` is the only consumer.
 */
export const retrieveErrorContent: Record<RetrieveErrorCode, ErrorContent> = {
  EXPIRED: {
    railColor: 'warning',
    cardBorderColor: '#33301F',
    cardBg: '#171A16',
    iconBg: 'warningSoft',
    iconBorder: 'warningLine',
    iconColor: 'warning',
    icon: <Clock size={ICON_SIZE} />,
    title: 'This link has expired.',
    body: 'The sender set it to self-destruct, and that moment has passed. The secret was deleted from the server at expiry — it cannot be recovered by them, by us, or by anyone else.',
    renderDetail: (error) =>
      error.details?.expiresAt ? (
        <div
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            px: 4,
            py: 3,
            border: '1px solid',
            borderColor: '#2B2A20',
            borderRadius: 4,
            backgroundColor: '#12140F',
          }}
        >
          <Clock size={15} sx={{ flexShrink: 0, color: '#8B8464' }} />
          <span sx={{ flexGrow: 1, fontSize: 2, color: '#8B8464' }}>Destroyed at expiry</span>
          <span sx={{ fontFamily: 'monospace', fontSize: 1, color: '#B5AC86' }}>
            {formatUtc(error.details.expiresAt)}
          </span>
        </div>
      ) : null,
    renderActions: () => (
      <>
        <p sx={{ m: 0, fontSize: 3, lineHeight: 'body', color: 'textDim' }}>
          Ask the sender to create a fresh link — and this time, open it soon after it arrives.
        </p>
        <CreateOwnCta />
      </>
    ),
  },

  VIEW_LIMIT_REACHED: {
    railColor: 'accent',
    cardBorderColor: '#362239',
    cardBg: '#191420',
    iconBg: 'rgba(214,29,220,0.11)',
    iconBorder: 'rgba(214,29,220,0.36)',
    iconColor: 'accentText',
    icon: <Layers size={ICON_SIZE} />,
    title: 'This secret has already been opened.',
    body: 'It was set to open once. That view has been used, so the secret was destroyed on the server and there is nothing left to show.',
    renderDetail: () => (
      <div
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 3,
          px: 4,
          py: 4,
          border: '1px solid',
          borderColor: '#3A2440',
          borderRadius: 4,
          backgroundColor: '#150F1B',
        }}
      >
        <Warning size={17} sx={{ flexShrink: 0, marginTop: '1px', color: 'accentText' }} />
        <p sx={{ m: 0, fontSize: 2, lineHeight: 'body', color: '#C4A9CE' }}>
          <strong sx={{ fontWeight: 'heading', color: 'accentText' }}>Wasn&rsquo;t you?</strong>{' '}
          Then someone else opened it. Treat the secret as exposed, rotate it, and tell the
          sender — the attempt is in their access log with its time and address.
        </p>
      </div>
    ),
    renderActions: () => (
      <>
        <p sx={{ m: 0, fontSize: 3, lineHeight: 'body', color: 'textDim' }}>
          If you still need the secret, the sender has to create a new link. Old ones can never
          be reopened.
        </p>
        <CreateOwnCta />
      </>
    ),
  },

  IP_NOT_ALLOWED: {
    railColor: 'danger',
    cardBorderColor: '#3A2830',
    cardBg: '#171B1E',
    iconBg: 'dangerSoft',
    iconBorder: 'dangerLine',
    iconColor: 'danger',
    icon: <Globe size={ICON_SIZE} />,
    title: "This link isn't open to your network.",
    body: 'The sender limited this secret to specific addresses, and yours isn’t one of them. Nothing was decrypted, the secret is untouched, and your attempt has been recorded in their access log.',
    renderDetail: (error) =>
      error.details?.clientIp ? (
        <div
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            px: 4,
            py: 3,
            border: '1px solid',
            borderColor: '#2E2429',
            borderRadius: 4,
            backgroundColor: '#14161A',
          }}
        >
          <Globe size={16} sx={{ flexShrink: 0, color: '#8E6B74' }} />
          <span sx={{ flexGrow: 1, fontSize: 2, color: '#A78790' }}>The address you came from</span>
          <span sx={{ fontFamily: 'monospace', fontSize: 2, color: 'text' }}>
            {error.details.clientIp}
          </span>
        </div>
      ) : null,
    renderActions: (error) => (
      <>
        <p sx={{ m: 0, fontSize: 3, lineHeight: 'body', color: 'textDim' }}>
          Send that address to the sender so they can allow it, or open the link again from the
          network they expected you to use.
        </p>
        {error.details?.clientIp ? (
          <CopyAddressButton address={error.details.clientIp} />
        ) : (
          <CreateOwnCta />
        )}
      </>
    ),
  },

  NOT_FOUND: neutralNotFound,
  LINK_MALFORMED: neutralNotFound,

  RATE_LIMITED: {
    railColor: 'warning',
    cardBorderColor: '#33301F',
    cardBg: '#171A16',
    iconBg: 'warningSoft',
    iconBorder: 'warningLine',
    iconColor: 'warning',
    icon: <Clock size={ICON_SIZE} />,
    title: 'Too many attempts.',
    body: 'This link accepts 20 password attempts from the same address every 15 minutes. That limit has been reached — wait for it to reset before trying again.',
    renderActions: () => (
      <>
        <p sx={{ m: 0, fontSize: 3, lineHeight: 'body', color: 'textDim' }}>
          If the password has genuinely gone missing, guessing will not help — ask the sender to
          create a fresh link instead.
        </p>
        <CreateOwnCta />
      </>
    ),
  },

  UNKNOWN: unknownFallback,

  // These two are resolved into the `password` phase by `useRetrieveSecret` and
  // should never reach `RetrieveErrorState` in practice. Entries exist only so
  // this map stays total over `RetrieveErrorCode`.
  PASSWORD_REQUIRED: unknownFallback,
  INVALID_PASSWORD: unknownFallback,
};

export default retrieveErrorContent;
