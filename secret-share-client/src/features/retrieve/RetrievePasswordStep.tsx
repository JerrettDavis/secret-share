/** @jsxImportSource theme-ui */
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BracketFrame, Button, Card, MaskedField } from '@components/ui';
import { rise, shake } from '@components/ui/keyframes';
import { ArrowRight, Key } from '@components/icons';

export interface RetrievePasswordStepProps {
  /** True while a password attempt is in flight. */
  busy: boolean;
  /** Set when the last attempt came back with a wrong password. */
  error?: 'INVALID_PASSWORD';
  /** Fired with the raw (unhashed) password on submit. */
  onSubmit: (password: string) => void;
}

/**
 * Password entry, reused for both the first ask and every retry.
 *
 * On `INVALID_PASSWORD` this must not read as a dead end: the card shakes
 * once, the field gets a red ring and inline message, and the button stays
 * labelled "Try again" in spirit — it invites another attempt rather than
 * blocking the flow. `useRetrieveSecret` clears the error the instant a retry
 * is submitted, so the shake animation replays on every consecutive failure
 * rather than only firing once.
 */
export function RetrievePasswordStep({ busy, error, onSubmit }: RetrievePasswordStepProps) {
  const [password, setPassword] = useState('');
  const hasError = error === 'INVALID_PASSWORD';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || busy) return;
    onSubmit(password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: [6, 7],
        animation: `${rise} .5s cubic-bezier(.2,.7,.3,1) both`,
      }}
    >
      <BracketFrame radius={14} color={hasError ? 'rgba(255,92,122,0.55)' : undefined}>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: [6, 7],
            ...(hasError
              ? {
                  borderColor: 'dangerLine',
                  backgroundColor: '#171B1E',
                  animation: `${shake} .5s cubic-bezier(.36,.07,.19,.97) both`,
                }
              : null),
          }}
        >
          <div sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 46,
                height: 46,
                borderRadius: 5,
                bg: hasError ? 'dangerSoft' : 'primarySoft',
                border: '1px solid',
                borderColor: hasError ? 'dangerLine' : 'primaryLine',
                color: hasError ? 'danger' : 'primary',
              }}
            >
              <Key size={23} />
            </span>
            <h1 sx={{ variant: 'text.title' }}>
              {hasError ? "That password doesn't match." : 'This secret needs a password.'}
            </h1>
            <p sx={{ variant: 'text.lead' }}>
              {hasError
                ? 'Nothing was decrypted and the secret is untouched — a refused attempt does not use up a view. Check the password with the sender and try again.'
                : 'The sender added a second password on top of the link. Ask them for it — ideally somewhere other than where they sent you the link.'}
            </p>
          </div>

          <MaskedField
            label="Password"
            placeholder="Enter the password"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={
              hasError
                ? "Incorrect password. This attempt has been recorded in the sender's access log."
                : undefined
            }
            disabled={busy}
          />

          <div sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Button
              type="submit"
              variant="primary"
              size="action"
              fullWidth
              icon={<Key size={18} />}
              loading={busy}
              disabled={!password}
            >
              {busy ? 'Checking…' : hasError ? 'Try again' : 'Unlock and decrypt'}
            </Button>
            <p sx={{ variant: 'text.caption', textAlign: 'center' }}>
              {hasError
                ? 'After 20 attempts from the same address this link is rate-limited for 15 minutes. If the password has gone missing, ask the sender to send a fresh secret rather than guessing.'
                : "The password is hashed on this device before it is checked. Every attempt — right or wrong — appears in the sender's access log."}
            </p>
          </div>
        </Card>
      </BracketFrame>

      <div
        sx={{
          display: 'flex',
          flexDirection: ['column', 'row'],
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          fontSize: 3,
          color: 'textDim',
        }}
      >
        Need to send one of your own?
        <Link
          to="/"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 'medium' }}
        >
          Create a secret link
          <ArrowRight size={14} />
        </Link>
      </div>
    </form>
  );
}

export default RetrievePasswordStep;
