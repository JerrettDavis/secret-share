/** @jsxImportSource theme-ui */
import type { ReactNode } from 'react';
import { Button, Callout, Card, CopyField, Rise } from '@components/ui';
import { ArrowRight, Check, Clock, ExternalLink, Globe, Key, Layers, Mail, Plus, Sliders } from '@components/icons';
import { formatUtc } from '@lib/format';
import type { CreateSuccessResult } from './useCreateSecret';

export interface CreateSuccessProps {
  result: CreateSuccessResult;
  onCreateAnother: () => void;
}

interface MetaItem {
  key: string;
  icon: ReactNode;
  label: string;
}

function buildMetaItems(result: CreateSuccessResult): MetaItem[] {
  const items: MetaItem[] = [
    {
      key: 'views',
      icon: <Layers size={14} />,
      label: result.views === 1 ? 'Opens once' : `Opens ${result.views} times`,
    },
    {
      key: 'expires',
      icon: <Clock size={14} />,
      label: `Expires ${formatUtc(result.expiresAtIso)}`,
    },
  ];
  if (result.passwordProtected) {
    items.push({ key: 'password', icon: <Key size={14} />, label: 'Password required' });
  }
  if (result.ipAllowlistCount > 0) {
    items.push({
      key: 'ip',
      icon: <Globe size={14} />,
      label: `${result.ipAllowlistCount} allowed ${result.ipAllowlistCount === 1 ? 'address' : 'addresses'}`,
    });
  }
  if (result.emailNotified) {
    items.push({ key: 'email', icon: <Mail size={14} />, label: 'Email on access' });
  }
  return items;
}

function MetaRow({ items }: { items: MetaItem[] }) {
  return (
    <div sx={{ display: 'flex', flexDirection: ['column', 'row'], alignItems: ['flex-start', 'center'], gap: [2, 4] }}>
      {items.map((item, i) => (
        <div key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: [2, 4] }}>
          {i > 0 ? <span aria-hidden sx={{ display: ['none', 'block'], width: '1px', height: '12px', bg: 'borderInput' }} /> : null}
          <span sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 1, color: 'textDim' }}>
            <span aria-hidden sx={{ display: 'flex', color: 'textMuted' }}>
              {item.icon}
            </span>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The two links a finished secret produces, visually distinguished (cyan
 * share link vs. purple management link) so they are never confused for one
 * another, plus the one-way-door warning: neither link can be regenerated,
 * because the decryption key only ever existed inside the share link's URL
 * fragment — the server never saw it and cannot hand it back.
 */
export function CreateSuccess({ result, onCreateAnother }: CreateSuccessProps) {
  const metaItems = buildMetaItems(result);

  return (
    <>
      <Rise sx={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
        <span
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: '48px',
            height: '48px',
            borderRadius: 5,
            bg: 'successSoft',
            border: '1px solid',
            borderColor: 'successLine',
            color: 'success',
          }}
        >
          <Check size={24} />
        </span>
        <div sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '2px' }}>
          <h1 sx={{ variant: 'text.title', fontSize: [12, 13] }}>Your secret is sealed.</h1>
          <p sx={{ variant: 'text.lead', maxWidth: '52ch' }}>
            Two links, two jobs. Send the first one to your recipient and keep the second one to
            yourself.
          </p>
        </div>
      </Rise>

      <Rise delay={80}>
        <Card accent="primary" flush>
          <div sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span
                aria-hidden
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: '30px',
                  height: '30px',
                  borderRadius: 3,
                  bg: 'primarySoft',
                  color: 'primary',
                }}
              >
                <ExternalLink size={16} />
              </span>
              <h2 sx={{ variant: 'text.cardHeading', flexGrow: 1, fontSize: 8 }}>Share link</h2>
              <span
                sx={{
                  display: ['none', 'inline-flex'],
                  flexShrink: 0,
                  px: 3,
                  py: 1,
                  borderRadius: 9,
                  bg: 'primarySoft',
                  fontSize: 1,
                  fontWeight: 'medium',
                  color: 'primaryHover',
                }}
              >
                Give this to the recipient
              </span>
            </div>
            <CopyField value={result.shareLink} variant="primary" label="Copy share link" />
            <MetaRow items={metaItems} />
          </div>
        </Card>
      </Rise>

      <Rise delay={160}>
        <Card accent="creator" flush>
          <div sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span
                aria-hidden
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: '30px',
                  height: '30px',
                  borderRadius: 3,
                  bg: 'rgba(174,27,215,0.16)',
                  color: 'secondaryText',
                }}
              >
                <Sliders size={16} />
              </span>
              <h2 sx={{ variant: 'text.cardHeading', flexGrow: 1, fontSize: 8 }}>Management link</h2>
              <span
                sx={{
                  display: 'inline-flex',
                  flexShrink: 0,
                  px: 3,
                  py: 1,
                  borderRadius: 9,
                  bg: 'rgba(174,27,215,0.14)',
                  fontSize: 1,
                  fontWeight: 'medium',
                  color: 'secondaryText',
                }}
              >
                Keep this to yourself
              </span>
            </div>
            <CopyField value={result.manageLink} variant="creator" label="Copy management link" />
            <p sx={{ m: 0, fontSize: 1, lineHeight: 'body', color: '#9C8FAD' }}>
              Anyone with this link can read the access log and destroy the secret. Bookmark it, or find
              it in the email we just sent you.
            </p>
          </div>
        </Card>
      </Rise>

      <Rise delay={240}>
        <Callout tone="warning">
          <span sx={{ fontWeight: 'heading', color: 'warning' }}>
            Copy both links before you leave this page.
          </span>{' '}
          The decryption key lives inside the share link, not on the server, so nobody — including us —
          can rebuild it for you.
        </Callout>
      </Rise>

      {/* Neither child is `fullWidth`: the shared Button/link variants set
          `flexShrink: 0`, so two `width: 100%` elements side by side would
          both claim the full row and overflow instead of sharing it.
          `flexGrow` + `minWidth: 0` split the row evenly on desktop; in the
          mobile column layout, flex's default `align-items: stretch` already
          makes each one full-width without any extra rule. */}
      <Rise delay={300} sx={{ display: 'flex', flexDirection: ['column', 'row'], gap: 3 }}>
        <Button
          variant="primary"
          icon={<Plus size={17} />}
          onClick={onCreateAnother}
          sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}
        >
          Create another secret
        </Button>
        <a
          href={result.manageLink}
          sx={{
            variant: 'buttons.secondary',
            height: 'action',
            minHeight: 'action',
            textDecoration: 'none',
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
          }}
        >
          Open the management page
          <ArrowRight size={16} />
        </a>
      </Rise>
    </>
  );
}

export default CreateSuccess;
