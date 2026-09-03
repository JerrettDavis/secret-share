/** @jsxImportSource theme-ui */

export interface EmailProtectionProps {
  value: string;
  onChange: (value: string) => void;
}

/** Plain email input for the "email me on access" notification address. */
export function EmailProtection({ value, onChange }: EmailProtectionProps) {
  return (
    <>
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        aria-label="Notification email address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ variant: 'forms.input' }}
      />
      <p sx={{ m: 0, fontSize: 1, lineHeight: 'body', color: 'textMuted' }}>
        Both links below are also emailed to this address, so you can find the management link again
        later.
      </p>
    </>
  );
}

export default EmailProtection;
