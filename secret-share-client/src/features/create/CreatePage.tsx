/** @jsxImportSource theme-ui */
import PageMain from '@components/layout/PageMain';
import { Button, Callout, Rise } from '@components/ui';
import { Lock, Shield } from '@components/icons';
import CreateSuccess from './CreateSuccess';
import EncryptingState from './EncryptingState';
import ProtectionsPanel from './ProtectionsPanel';
import SecretInput from './SecretInput';
import { useCreateSecret } from './useCreateSecret';

/**
 * The "Create a secret" flow, mounted at `/`.
 *
 * A small state machine drives what renders: `editing` (secret + protections
 * + submit), `encrypting` (client-side crypto, then the create request — see
 * `EncryptingState` for the retry-capable error path), and `done` (the two
 * links). All the state itself lives in `useCreateSecret`; this component
 * only picks which screen to show and wires props through.
 */
export function CreatePage() {
  const create = useCreateSecret();

  if (create.phase === 'encrypting') {
    return (
      <PageMain maxWidth="narrow" center>
        <EncryptingState stage={create.stage} error={create.error} onRetry={create.retry} onBack={create.backToEditing} />
      </PageMain>
    );
  }

  if (create.phase === 'done' && create.result) {
    return (
      <PageMain maxWidth="success">
        <CreateSuccess result={create.result} onCreateAnother={create.startOver} />
      </PageMain>
    );
  }

  const recap = create.secret ? create.summary.recap : 'Enter a secret above to continue.';

  return (
    <PageMain maxWidth="form">
      <Rise sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span sx={{ variant: 'badges.eyebrow', alignSelf: 'flex-start' }}>
          <Shield size={12} />
          End-to-end encrypted
        </span>
        <h1 sx={{ variant: 'text.display' }}>Share a secret that deletes itself.</h1>
        <p sx={{ variant: 'text.lead', maxWidth: '54ch' }}>
          Your secret is encrypted in this browser before it goes anywhere. You get a link that opens
          once — after that the secret is gone from the server for good.
        </p>
      </Rise>

      <Rise delay={80}>
        <SecretInput value={create.secret} onChange={create.setSecret} />
      </Rise>

      <Rise delay={160}>
        <ProtectionsPanel
          toggles={create.toggles}
          onToggleChange={create.setToggle}
          options={create.options}
          onOptionChange={create.setOption}
          defaults={create.defaults}
          summary={create.summary}
        />
      </Rise>

      <Rise delay={240} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Button
          variant="primary"
          size="action"
          fullWidth
          icon={<Lock size={18} />}
          disabled={!create.secret}
          onClick={create.submit}
        >
          Encrypt and get share link
        </Button>
        <p sx={{ m: 0, textAlign: 'center', fontSize: 2, color: 'textMuted' }}>{recap}</p>
      </Rise>

      <Callout tone="info">
        Encryption happens on this device. The key travels inside the link you share — it is never sent
        to the server, so the server holds ciphertext it cannot read.
      </Callout>
    </PageMain>
  );
}

export default CreatePage;
