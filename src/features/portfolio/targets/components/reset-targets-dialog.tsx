import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import type { ClassesResponse } from '../../types';
import { useResetTargets } from '../api/use-reset-targets.mutation';

export interface ResetTargetsDialogProps {
    readonly onReset: (classes: ClassesResponse) => void;
    readonly onClose: () => void;
}

export function ResetTargetsDialog({ onReset, onClose }: ResetTargetsDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const toast: ToastApi = useToast();
    const reset: UseMutationResult<ClassesResponse, ApiError, void> = useResetTargets();
    const confirm = async (): Promise<void> => {
        try {
            onReset(await reset.mutateAsync());
            track('portfolio_targets_reset');
            toast.show({ tone: 'positive', title: t('reset.success') });
        } catch (error) {
            toast.show({ tone: 'critical', title: t('reset.failed'), detail: portfolioErrorMessage(tp, error as Error) });
        }
        onClose();
    };
    return (
        <ConfirmDialog
            title={t('reset.title')}
            description={t('reset.description')}
            confirmLabel={t('reset.confirm')}
            pending={reset.isPending}
            onConfirm={(): void => {
                void confirm();
            }}
            onCancel={onClose}
        />
    );
}
