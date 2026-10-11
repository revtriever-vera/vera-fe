import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { ConnectionView } from '../../types';
import type { RemoveConnectionInput } from '../types';
import { useRemoveConnection } from '../api/use-remove-connection.mutation';
import { RemoveDialog } from './remove-dialog';

export interface RemoveConnectionDialogProps {
    readonly connection: ConnectionView;
    readonly onClose: () => void;
}

export function RemoveConnectionDialog({ connection, onClose }: RemoveConnectionDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const remove: UseMutationResult<void, ApiError, RemoveConnectionInput> = useRemoveConnection();
    const bank: string = connection.connectorName ?? t('banks.unknownBank');
    const confirm = (purgeTransactions: boolean): void => {
        remove.mutate(
            { id: connection.id, purgeTransactions },
            {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: t('banks.toasts.removed') });
                    onClose();
                },
                onError: (error: Error): void => {
                    toast.show({ tone: 'critical', title: t('banks.toasts.removeFailed'), detail: spendingErrorMessage(ts, error) });
                    onClose();
                }
            }
        );
    };
    return (
        <RemoveDialog
            title={t('banks.removeDialog.title', { bank })}
            description={t('banks.removeDialog.description')}
            purgeLabel={t('banks.removeDialog.purge')}
            confirmLabel={t('banks.removeDialog.confirm')}
            confirmPurgeLabel={t('banks.removeDialog.confirmPurge')}
            cancelLabel={t('banks.removeDialog.cancel')}
            pending={remove.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
