/** @jsxImportSource theme-ui */
import { Card } from '@components/ui';
import { Clock, Globe, Key, Layers, Mail } from '@components/icons';
import EmailProtection from './EmailProtection';
import ExpirationProtection from './ExpirationProtection';
import IpAllowlistProtection from './IpAllowlistProtection';
import PasswordProtection from './PasswordProtection';
import ProtectionRow from './ProtectionRow';
import ViewLimitProtection from './ViewLimitProtection';
import {
  msToShortLabel,
  resolveExpirationDate,
  resolveViewLimit,
  type CreateOptionsState,
  type ProtectionSummary,
  type ProtectionToggles,
  type ResolvedDefaults,
} from './useCreateSecret';

export interface ProtectionsPanelProps {
  toggles: ProtectionToggles;
  onToggleChange: (key: keyof ProtectionToggles, next: boolean) => void;
  options: CreateOptionsState;
  onOptionChange: <K extends keyof CreateOptionsState>(key: K, value: CreateOptionsState[K]) => void;
  defaults: ResolvedDefaults;
  summary: ProtectionSummary;
}

/**
 * The "Protections" card: five independent, collapsible rows plus a header
 * chip summarising whatever is currently active. Every field the rows manage
 * lives in `useCreateSecret` — this component only wires props through, so
 * the state a row shows is always exactly what `submit()` will send.
 */
export function ProtectionsPanel({
  toggles,
  onToggleChange,
  options,
  onOptionChange,
  defaults,
  summary,
}: ProtectionsPanelProps) {
  const resolvedViews = toggles.viewLimit ? resolveViewLimit(options, defaults.maxViews) : defaults.maxViews;
  const resolvedExpirationDate = toggles.expiration
    ? resolveExpirationDate(options, defaults.expirationMs)
    : new Date(Date.now() + defaults.expirationMs);

  return (
    <Card flush sx={{ overflow: 'hidden' }}>
      <div
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 5,
          px: [5, 8],
          pt: [5, 6],
          pb: 4,
        }}
      >
        <div sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <h2 sx={{ variant: 'text.cardHeading' }}>Protections</h2>
          <p sx={{ m: 0, fontSize: 2, lineHeight: 'body', color: 'textDim' }}>
            The defaults are already strict. Open only what you need.
          </p>
        </div>
        <span
          sx={{
            flexShrink: 0,
            px: 3,
            py: 1,
            borderRadius: 1,
            bg: 'primarySoft',
            fontFamily: 'monospace',
            fontSize: 1,
            color: 'primaryHover',
          }}
        >
          {summary.chip}
        </span>
      </div>

      <div sx={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid', borderColor: 'borderSubtle' }}>
        <ProtectionRow
          icon={<Key size={17} />}
          title="Password"
          description="Require a second password to open the secret."
          enabled={toggles.password}
          onToggle={(next) => onToggleChange('password', next)}
        >
          <PasswordProtection value={options.password} onChange={(v) => onOptionChange('password', v)} />
        </ProtectionRow>

        <ProtectionRow
          icon={<Globe size={17} />}
          title="IP allowlist"
          description="Only these addresses can open the link."
          enabled={toggles.ipAllowlist}
          onToggle={(next) => onToggleChange('ipAllowlist', next)}
        >
          <IpAllowlistProtection
            value={options.ipAllowlist}
            onChange={(v) => onOptionChange('ipAllowlist', v)}
          />
        </ProtectionRow>

        <ProtectionRow
          icon={<Layers size={17} />}
          title="View limit"
          description="How many times the link can be opened before it self-destructs."
          valueChip={String(defaults.maxViews)}
          enabled={toggles.viewLimit}
          onToggle={(next) => onToggleChange('viewLimit', next)}
        >
          <ViewLimitProtection
            preset={options.viewLimitPreset}
            customValue={options.viewLimitCustom}
            onPresetChange={(v) => onOptionChange('viewLimitPreset', v)}
            onCustomValueChange={(v) => onOptionChange('viewLimitCustom', v)}
            resolvedViews={resolvedViews}
          />
        </ProtectionRow>

        <ProtectionRow
          icon={<Clock size={17} />}
          title="Expiration"
          description="When the secret is destroyed, opened or not."
          valueChip={msToShortLabel(defaults.expirationMs)}
          enabled={toggles.expiration}
          onToggle={(next) => onToggleChange('expiration', next)}
        >
          <ExpirationProtection
            preset={options.expirationPreset}
            customDate={options.expirationCustomDate}
            onPresetChange={(v) => onOptionChange('expirationPreset', v)}
            onCustomDateChange={(v) => onOptionChange('expirationCustomDate', v)}
            resolvedDate={resolvedExpirationDate}
          />
        </ProtectionRow>

        <ProtectionRow
          icon={<Mail size={17} />}
          title="Email me on access"
          description="Get an email when the secret is opened, refused, or expires."
          enabled={toggles.email}
          onToggle={(next) => onToggleChange('email', next)}
          isLast
        >
          <EmailProtection value={options.email} onChange={(v) => onOptionChange('email', v)} />
        </ProtectionRow>
      </div>
    </Card>
  );
}

export default ProtectionsPanel;
