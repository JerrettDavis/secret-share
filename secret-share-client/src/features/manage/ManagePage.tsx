/** @jsxImportSource theme-ui */
import { useParams } from 'react-router-dom';
import PageMain from '@components/layout/PageMain';
import { Rise } from '@components/ui';
import OverviewHeader from './OverviewHeader';
import StatTiles from './StatTiles';
import ProtectionsSummary from './ProtectionsSummary';
import AccessLog from './AccessLog';
import RevokePanel from './RevokePanel';
import RevokeDialog from './RevokeDialog';
import { ManageLoadingState, ManageNotFoundState, ManageRevokedState } from './ManageStates';
import { useSecretManagement } from './useSecretManagement';
import { countAddressesOffAllowlist, mapSecretStatus } from './utils';

/**
 * The manage page, reached at `/manage/:creatorIdentifier`. Loads stats and
 * access logs in parallel, then renders one of: a loading skeleton, a
 * terminal "gone" state, the live dashboard, or (after a successful revoke) a
 * terminal "revoked" state.
 */
export function ManagePage() {
  const { creatorIdentifier } = useParams<{ creatorIdentifier: string }>();
  const manage = useSecretManagement(creatorIdentifier);

  if (manage.status === 'loading') {
    return (
      <PageMain maxWidth="wide">
        <ManageLoadingState />
      </PageMain>
    );
  }

  if (manage.status === 'not-found') {
    return (
      <PageMain maxWidth="narrow" center>
        <ManageNotFoundState />
      </PageMain>
    );
  }

  if (manage.status === 'revoked') {
    return (
      <PageMain maxWidth="narrow" center>
        <ManageRevokedState />
      </PageMain>
    );
  }

  const stats = manage.stats ?? {};
  const reportedViews = stats.reportedViews ?? 0;
  const maxViews = stats.maxViews ?? null;
  const expirationDate = stats.expirationDate ?? null;
  const createdAt = stats.createdAt ?? null;
  const hasPassword = stats.hasPassword ?? false;
  const ipRestrictions = stats.ipRestrictions ?? [];
  const emailNotification = stats.emailNotification ?? null;
  const uniqueViews = stats.uniqueViews ?? 0;

  const hasActivity = manage.grantedCount + manage.refusedCount > 0;
  const addressesOffAllowlist = countAddressesOffAllowlist(manage.logs, ipRestrictions);

  return (
    <PageMain maxWidth="wide">
      <Rise>
        <OverviewHeader
          status={mapSecretStatus(stats.status)}
          identifier={creatorIdentifier ?? ''}
          createdAt={createdAt}
        />
      </Rise>

      <Rise delay={60}>
        <StatTiles
          reportedViews={reportedViews}
          maxViews={maxViews}
          expirationDate={expirationDate}
          grantedAttempts={manage.grantedCount}
          refusedAttempts={manage.refusedCount}
          uniqueViews={uniqueViews}
          addressesOffAllowlist={addressesOffAllowlist}
          hasIpRestrictions={ipRestrictions.length > 0}
        />
      </Rise>

      <Rise delay={120}>
        <ProtectionsSummary
          hasPassword={hasPassword}
          ipRestrictions={ipRestrictions}
          emailNotification={emailNotification}
        />
      </Rise>

      <Rise delay={180}>
        <AccessLog
          logs={manage.logs}
          filteredLogs={manage.filteredLogs}
          filter={manage.filter}
          onFilterChange={manage.setFilter}
          grantedCount={manage.grantedCount}
          refusedCount={manage.refusedCount}
        />
      </Rise>

      <Rise delay={240}>
        <RevokePanel onRevoke={manage.openRevokeDialog} hasActivity={hasActivity} />
      </Rise>

      <RevokeDialog
        open={manage.revokeDialogOpen}
        onClose={manage.closeRevokeDialog}
        onConfirm={manage.confirmRevoke}
        submitting={manage.revoking}
        error={manage.revokeError}
        reportedViews={reportedViews}
        maxViews={maxViews}
        expirationDate={expirationDate}
        logCount={manage.logs.length}
      />
    </PageMain>
  );
}

export default ManagePage;
