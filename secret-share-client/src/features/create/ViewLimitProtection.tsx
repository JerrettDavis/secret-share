/** @jsxImportSource theme-ui */
import { SegmentedControl, type SegmentedOption } from '@components/ui';
import { ordinal, type ViewLimitPreset } from './useCreateSecret';

export interface ViewLimitProtectionProps {
  preset: ViewLimitPreset;
  customValue: string;
  onPresetChange: (preset: ViewLimitPreset) => void;
  onCustomValueChange: (value: string) => void;
  /** The view count that will actually be submitted — drives the caption. */
  resolvedViews: number;
}

const OPTIONS: ReadonlyArray<SegmentedOption<ViewLimitPreset>> = [
  { value: '1', label: '1' },
  { value: '3', label: '3' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: 'custom', label: 'Custom' },
];

export function ViewLimitProtection({
  preset,
  customValue,
  onPresetChange,
  onCustomValueChange,
  resolvedViews,
}: ViewLimitProtectionProps) {
  const caption =
    resolvedViews <= 1
      ? 'The secret is destroyed as soon as it is opened once. Refused attempts do not count against the limit.'
      : `The secret is destroyed the moment the ${ordinal(resolvedViews)} view completes. Refused attempts do not count against the limit.`;

  return (
    <>
      <SegmentedControl label="View limit" options={OPTIONS} value={preset} onChange={onPresetChange} />
      {preset === 'custom' ? (
        <input
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          placeholder="Number of views"
          aria-label="Custom view limit"
          value={customValue}
          onChange={(e) => onCustomValueChange(e.target.value)}
          sx={{ variant: 'forms.input', maxWidth: 160 }}
        />
      ) : null}
      <p sx={{ m: 0, fontSize: 1, lineHeight: 'body', color: 'textMuted' }}>{caption}</p>
    </>
  );
}

export default ViewLimitProtection;
