/** @jsxImportSource theme-ui */
import { SegmentedControl, type SegmentedOption } from '@components/ui';
import { formatCreated } from '@lib/format';
import { EXPIRATION_PRESET_MS, msToLongLabel, type ExpirationPreset } from './useCreateSecret';

export interface ExpirationProtectionProps {
  preset: ExpirationPreset;
  customDate: string;
  onPresetChange: (preset: ExpirationPreset) => void;
  onCustomDateChange: (value: string) => void;
  /** The `Date` that will actually be submitted — drives the caption. */
  resolvedDate: Date;
}

const OPTIONS: ReadonlyArray<SegmentedOption<ExpirationPreset>> = [
  { value: '1h', label: '1 hour' },
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'custom', label: 'Pick a date' },
];

export function ExpirationProtection({
  preset,
  customDate,
  onPresetChange,
  onCustomDateChange,
  resolvedDate,
}: ExpirationProtectionProps) {
  const resolvedLabel = formatCreated(resolvedDate.toISOString());
  const caption =
    preset === 'custom'
      ? `Destroys on ${resolvedLabel}.`
      : `Destroys on ${resolvedLabel} — ${msToLongLabel(EXPIRATION_PRESET_MS[preset])} from now, in your local time.`;

  return (
    <>
      <SegmentedControl label="Expiration" options={OPTIONS} value={preset} onChange={onPresetChange} />
      {preset === 'custom' ? (
        <input
          type="datetime-local"
          aria-label="Custom expiration date and time"
          value={customDate}
          onChange={(e) => onCustomDateChange(e.target.value)}
          sx={{ variant: 'forms.input' }}
        />
      ) : null}
      <p sx={{ m: 0, fontSize: 1, lineHeight: 'body', color: 'textMuted' }}>{caption}</p>
    </>
  );
}

export default ExpirationProtection;
