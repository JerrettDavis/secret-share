/** @jsxImportSource theme-ui */
import { MaskedField } from '@components/ui';

export interface PasswordProtectionProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * The secondary password field. Note what this component does *not* do: it
 * never sends `value` anywhere itself. `useCreateSecret.submit()` hashes it
 * via `hashPassword` at the moment of submission — the plaintext never
 * reaches the network.
 */
export function PasswordProtection({ value, onChange }: PasswordProtectionProps) {
  return (
    <>
      <MaskedField
        aria-label="Secondary password"
        placeholder="Add a password"
        autoComplete="new-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p sx={{ m: 0, fontSize: 1, lineHeight: 'body', color: 'textMuted' }}>
        Hashed on this device before it is sent. Send it to the recipient through a different channel
        than the link — a shared link and its password in the same thread protect nothing.
      </p>
    </>
  );
}

export default PasswordProtection;
