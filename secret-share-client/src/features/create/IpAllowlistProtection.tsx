/** @jsxImportSource theme-ui */
import { ChipInput } from '@components/ui';

export interface IpAllowlistProtectionProps {
  value: string[];
  onChange: (next: string[]) => void;
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
// Loose on purpose: real IPv6 validation is a much bigger regex than is worth
// shipping for a client-side convenience check. The server is the authority
// on whether an address is actually well-formed and reachable.
const IPV6_LIKE = /^[0-9a-fA-F:]+$/;

function validateIp(candidate: string): string | null {
  if (IPV4.test(candidate)) return null;
  if (candidate.includes(':') && IPV6_LIKE.test(candidate)) return null;
  return 'Enter a valid IPv4 or IPv6 address.';
}

/**
 * The IP allowlist field. Replaces the old comma-separated text input with a
 * proper chip list — each address is its own token, invalid entries are
 * rejected in place (so the draft text is never lost), and an empty list
 * really is `[]`, not the single bogus `['']` entry the old
 * `ipList.split(',')` produced on empty input.
 */
export function IpAllowlistProtection({ value, onChange }: IpAllowlistProtectionProps) {
  return (
    <>
      <ChipInput
        label="IP allowlist"
        value={value}
        onChange={onChange}
        placeholder="Add an address"
        validate={validateIp}
      />
      <p sx={{ m: 0, fontSize: 1, lineHeight: 'body', color: 'textMuted' }}>
        Press Enter after each address. Requests from anywhere else are refused and recorded in your
        access log.
      </p>
    </>
  );
}

export default IpAllowlistProtection;
