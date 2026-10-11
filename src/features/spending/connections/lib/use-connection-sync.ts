import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { ApiError } from '@/shared/lib/api/api-error';
import { track } from '@/shared/lib/analytics';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import { useSyncAll } from '../api/use-sync-all.mutation';
import { useSyncConnection } from '../api/use-sync-connection.mutation';

export interface ConnectionSync {
    readonly onePending: boolean;
    readonly allPending: boolean;
    readonly syncOne: (id: string) => void;
    readonly syncAll: () => void;
}

export function useConnectionSync(onRequested: () => void): ConnectionSync {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const one: UseMutationResult<{ queued: boolean }, ApiError, string> = useSyncConnection();
    const all: UseMutationResult<{ queued: number }, ApiError, void> = useSyncAll();
    const failure = (error: Error): void => {
        const inProgress: boolean = error instanceof ApiError && error.problem.type === 'connections.sync_in_progress';
        toast.show({
            tone: inProgress ? 'neutral' : 'critical',
            title: inProgress ? spendingErrorMessage(ts, error) : t('banks.toasts.syncFailed'),
            detail: inProgress ? undefined : spendingErrorMessage(ts, error)
        });
    };
    const syncOne = (id: string): void => {
        one.mutate(id, {
            onSuccess: (): void => {
                track('spending_sync_requested', { scope: 'one' });
                toast.show({ tone: 'positive', title: t('banks.toasts.syncQueued') });
                onRequested();
            },
            onError: failure
        });
    };
    const syncAll = (): void => {
        all.mutate(undefined, {
            onSuccess: (result: { queued: number }): void => {
                track('spending_sync_requested', { scope: 'all' });
                toast.show({
                    tone: result.queued > 0 ? 'positive' : 'neutral',
                    title: result.queued > 0 ? t('banks.toasts.syncAllQueued', { count: result.queued }) : t('banks.toasts.syncAllNone')
                });
                onRequested();
            },
            onError: failure
        });
    };
    return { onePending: one.isPending, allPending: all.isPending, syncOne, syncAll };
}
