import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import type { HoldingView } from '../../types';
import { useDeleteHolding, type DeleteHoldingInput } from '../api/use-delete-holding.mutation';

export interface RemoveHoldingDialogProps {
    readonly holding: HoldingView;
    readonly onClose: () => void;
}

export function RemoveHoldingDialog({ holding, onClose }: RemoveHoldingDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const toast: ToastApi = useToast();
    const remove: UseMutationResult<void, ApiError, DeleteHoldingInput> = useDeleteHolding();
    const confirm = (): void => {
        remove.mutate(
            { kind: holding.kind, id: holding.id },
            {
                onSuccess: (): void => {
                    track('portfolio_asset_removed');
                    toast.show({ tone: 'positive', title: t('toasts.removed', { symbol: holding.symbol }) });
                    onClose();
                },
                onError: (error: Error): void => {
                    toast.show({ tone: 'critical', title: t('toasts.removeFailed'), detail: portfolioErrorMessage(tp, error) });
                    onClose();
                }
            }
        );
    };
    return (
        <ConfirmDialog
            title={t('remove.title', { symbol: holding.symbol })}
            description={t('remove.description')}
            confirmLabel={t('remove.confirm')}
            destructive
            pending={remove.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
