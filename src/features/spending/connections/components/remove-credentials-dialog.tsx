import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { RemoveOptions } from '../types';
import { useRemoveCredentials } from '../api/use-remove-credentials.mutation';
import { RemoveDialog } from './remove-dialog';

export function RemoveCredentialsDialog({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const remove: UseMutationResult<void, ApiError, RemoveOptions> = useRemoveCredentials();
    const confirm = (purgeTransactions: boolean): void => {
        remove.mutate(
            { purgeTransactions },
            {
                onSuccess: (): void => {
                    track('spending_credentials_removed');
                    toast.show({ tone: 'positive', title: t('credentials.toasts.removed') });
                    onClose();
                },
                onError: (error: Error): void => {
                    toast.show({ tone: 'critical', title: t('credentials.toasts.removeFailed'), detail: spendingErrorMessage(ts, error) });
                    onClose();
                }
            }
        );
    };
    return (
        <RemoveDialog
            title={t('credentials.removeDialog.title')}
            description={t('credentials.removeDialog.description')}
            purgeLabel={t('credentials.removeDialog.purge')}
            confirmLabel={t('credentials.removeDialog.confirm')}
            confirmPurgeLabel={t('credentials.removeDialog.confirmPurge')}
            cancelLabel={t('credentials.removeDialog.cancel')}
            pending={remove.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
