/** @jsxImportSource theme-ui */
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { BracketFrame, Button, Callout, Card } from '@components/ui';
import { unblur } from '@components/ui/keyframes';
import { ArrowRight, Check, Copy, Lock, X } from '@components/icons';

export interface RevealedSecretProps {
  /** The plain-text secret, already decrypted. Never sent anywhere from here. */
  secret: string;
}

const COPY_RESET_MS = 2000;

/**
 * The final screen: the decrypted secret, shown exactly once.
 *
 * "Clear the screen" is a real destructive action, not a nicety — it drops
 * the secret out of this component's state entirely, so a screen left open
 * (or screen-shared) doesn't keep leaking it after the recipient is done.
 * There is no way back to the secret from that state; it was already deleted
 * server-side the moment this screen appeared.
 */
export function RevealedSecret({ secret }: RevealedSecretProps) {
  const [cleared, setCleared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const lineCount = secret.split('\n').length;
  const charCount = secret.length;

  const copy = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(secret);
      setCopyFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      setCopied(false);
      setCopyFailed(true);
      window.setTimeout(() => setCopyFailed(false), COPY_RESET_MS * 2);
    }
  }, [secret]);

  if (cleared) {
    return (
      <BracketFrame radius={14}>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            textAlign: 'center',
          }}
        >
          <span
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 46,
              height: 46,
              borderRadius: 5,
              bg: 'chip',
              color: 'textDim',
            }}
          >
            <Lock size={22} />
          </span>
          <h1 sx={{ variant: 'text.cardHeading' }}>Screen cleared.</h1>
          <p sx={{ variant: 'text.lead', textAlign: 'center' }}>
            The secret is out of this page now — it was already gone from the server the moment it
            was decrypted. If you didn&rsquo;t finish copying it, ask the sender for a new link.
          </p>
          <Link
            to="/"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 'medium' }}
          >
            Create a secret link
            <ArrowRight size={14} />
          </Link>
        </Card>
      </BracketFrame>
    );
  }

  return (
    <div sx={{ display: 'flex', flexDirection: 'column', gap: [5, 6] }}>
      <Callout tone="warning">
        <p sx={{ m: 0, fontWeight: 'heading', color: 'warning' }}>
          The secret is now deleted from the server.
        </p>
        <p sx={{ m: 0, mt: 1, fontSize: 2 }}>
          What you see below is the only copy left. Reloading this page will not bring it back.
        </p>
      </Callout>

      <BracketFrame radius={14}>
        <Card flush sx={{ overflow: 'hidden' }}>
          <div
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              px: [5, 7],
              py: 4,
              borderBottom: '1px solid',
              borderColor: 'borderDim',
            }}
          >
            <span
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: 30,
                height: 30,
                borderRadius: 3,
                bg: 'primarySoft',
                color: 'primary',
              }}
            >
              <Lock size={16} />
            </span>
            <h1 sx={{ flexGrow: 1, variant: 'text.cardHeading' }}>Decrypted secret</h1>
          </div>

          <div sx={{ px: [5, 7], py: [6, 7], bg: 'well' }}>
            <pre
              sx={{
                m: 0,
                fontFamily: 'monospace',
                fontSize: 4,
                lineHeight: 1.85,
                color: 'text',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                animation: `${unblur} .75s cubic-bezier(.2,.7,.3,1) .15s both`,
              }}
            >
              {secret}
            </pre>
          </div>

          <div
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
              px: [5, 7],
              py: 3,
              borderTop: '1px solid',
              borderColor: 'borderDim',
            }}
          >
            <span sx={{ fontSize: 1, color: 'textMuted' }}>
              {lineCount} {lineCount === 1 ? 'line' : 'lines'} &middot; {charCount} characters
            </span>
            <span sx={{ fontSize: 1, color: 'textMuted', display: ['none', 'inline'] }}>
              Select the text to copy part of it
            </span>
          </div>
        </Card>
      </BracketFrame>

      <div sx={{ display: 'flex', flexDirection: ['column', 'row'], gap: 3 }}>
        <Button
          variant="primary"
          size="action"
          icon={copied ? <Check size={18} /> : <Copy size={18} />}
          onClick={copy}
          sx={{ flexGrow: 1 }}
        >
          {copied ? 'Copied' : 'Copy the secret'}
        </Button>
        <Button
          variant="secondary"
          size="action"
          icon={<X size={17} />}
          onClick={() => setCleared(true)}
        >
          Clear the screen
        </Button>
      </div>

      {copyFailed ? (
        <p role="alert" sx={{ m: 0, textAlign: 'center', fontSize: 1, color: 'warning' }}>
          Could not reach the clipboard. Select the text above and copy it manually.
        </p>
      ) : null}

      <p sx={{ m: 0, textAlign: 'center', fontSize: 1, lineHeight: 'body', color: 'textMuted' }}>
        The plain text never left this device. Paste it somewhere safe before you close the tab —
        after that, only the sender can send you a new one.
      </p>
    </div>
  );
}

export default RevealedSecret;
