import { useCallback, useEffect, useMemo, useState } from 'react';
import { secretsApi } from '@api/client';
import { ApiError } from '@generated/core/ApiError';
import type { GetSecretStatsResponse } from '@generated/models/GetSecretStatsResponse';
import type { ISecretAccessLog } from '@generated/models/ISecretAccessLog';

export type LogFilter = 'all' | 'granted' | 'refused';

/**
 * `loading`   — the initial stats+logs fetch is in flight.
 * `not-found` — the creator link is dead: wrong identifier, already revoked
 *               server-side by a previous visit, or any other load failure.
 *               There is nothing actionable to distinguish these from here,
 *               so they all land on the same terminal screen.
 * `ready`     — loaded successfully; the page renders the full dashboard.
 * `revoked`   — this session just revoked it. Deliberately distinct from
 *               `not-found`: the user just took the action and should see
 *               confirmation of *that*, not a generic "gone" screen.
 */
export type ManageStatus = 'loading' | 'not-found' | 'ready' | 'revoked';

export interface UseSecretManagementResult {
  status: ManageStatus;
  stats: GetSecretStatsResponse | null;
  logs: ISecretAccessLog[];
  filter: LogFilter;
  setFilter: (filter: LogFilter) => void;
  filteredLogs: ISecretAccessLog[];
  grantedCount: number;
  refusedCount: number;
  revokeDialogOpen: boolean;
  openRevokeDialog: () => void;
  closeRevokeDialog: () => void;
  revoking: boolean;
  revokeError: string | null;
  confirmRevoke: () => Promise<void>;
}

function isNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

function revokeErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const body: unknown = err.body;
    if (typeof body === 'object' && body !== null && 'error' in body) {
      const message = (body as Record<string, unknown>).error;
      if (typeof message === 'string' && message.trim()) return message;
    }
    return `The server refused to revoke this secret (${err.status}). Try again in a moment.`;
  }
  if (err instanceof Error && err.message) return err.message;
  return 'Something went wrong revoking this secret. Check your connection and try again.';
}

/**
 * Owns everything the manage page needs: the initial load, the access-log
 * filter, and the revoke confirmation flow.
 */
export function useSecretManagement(
  creatorIdentifier: string | undefined,
): UseSecretManagementResult {
  const [status, setStatus] = useState<ManageStatus>('loading');
  const [stats, setStats] = useState<GetSecretStatsResponse | null>(null);
  const [logs, setLogs] = useState<ISecretAccessLog[]>([]);
  const [filter, setFilter] = useState<LogFilter>('all');

  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorIdentifier) {
      setStatus('not-found');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    Promise.all([
      secretsApi.getApiSecretsStats(creatorIdentifier),
      secretsApi.getApiSecretsLogs(creatorIdentifier),
    ])
      .then(([statsRes, logsRes]) => {
        if (cancelled) return;
        setStats(statsRes.data ?? null);
        setLogs(logsRes.data?.logs ?? []);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('not-found');
      });

    return () => {
      cancelled = true;
    };
  }, [creatorIdentifier]);

  const grantedCount = useMemo(() => logs.filter((l) => l.accessGranted).length, [logs]);
  const refusedCount = useMemo(() => logs.filter((l) => !l.accessGranted).length, [logs]);

  const filteredLogs = useMemo(() => {
    if (filter === 'granted') return logs.filter((l) => l.accessGranted);
    if (filter === 'refused') return logs.filter((l) => !l.accessGranted);
    return logs;
  }, [logs, filter]);

  const openRevokeDialog = useCallback(() => {
    setRevokeError(null);
    setRevokeDialogOpen(true);
  }, []);

  const closeRevokeDialog = useCallback(() => {
    setRevokeDialogOpen((open) => (revoking ? open : false));
  }, [revoking]);

  const confirmRevoke = useCallback(async () => {
    if (!creatorIdentifier || revoking) return;
    setRevoking(true);
    setRevokeError(null);
    try {
      await secretsApi.deleteApiSecrets(creatorIdentifier);
      setRevokeDialogOpen(false);
      setStatus('revoked');
    } catch (err) {
      if (isNotFound(err)) {
        // Someone else already revoked it, or it just expired/exhausted
        // under us — either way the outcome the user wanted is achieved.
        setRevokeDialogOpen(false);
        setStatus('revoked');
        return;
      }
      setRevokeError(revokeErrorMessage(err));
    } finally {
      setRevoking(false);
    }
  }, [creatorIdentifier, revoking]);

  return {
    status,
    stats,
    logs,
    filter,
    setFilter,
    filteredLogs,
    grantedCount,
    refusedCount,
    revokeDialogOpen,
    openRevokeDialog,
    closeRevokeDialog,
    revoking,
    revokeError,
    confirmRevoke,
  };
}

export default useSecretManagement;
