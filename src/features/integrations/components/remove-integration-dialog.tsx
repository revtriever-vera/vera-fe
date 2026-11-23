import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useRemoveIntegration } from '../api/use-remove-integration.mutation';
import { integrationErrorMessage } from '../lib/integration-error-message';
import type { IntegrationKind } from '../types';

export function RemoveIntegrationDialog({ kind, onClose }: { readonly kind: IntegrationKind; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    const toast: ToastApi = useToast();
    const remove: UseMutationResult<void, Error, IntegrationKind> = useRemoveIntegration();

    const confirm = (): void => {
        remove.mutate(kind, {
            onSuccess: (): void => {
                track('integration_removed', { kind });
                toast.show({ tone: 'positive', title: t('toasts.removed') });
                onClose();
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: integrationErrorMessage(t, error, kind) });
                onClose();
            }
        });
    };

    return (
        <ConfirmDialog
            title={t('removeDialog.title', { name: t(`kinds.${kind}.title`) })}
            description={t(`kinds.${kind}.removeWarning`)}
            confirmLabel={t('removeDialog.confirm')}
            cancelLabel={t('cancel')}
            destructive
            pending={remove.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
