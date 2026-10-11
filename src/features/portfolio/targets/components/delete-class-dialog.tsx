import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useDeleteClass } from '../api/use-delete-class.mutation';
import { formatTargetBps } from '../../lib/format-bps';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';

export interface DeleteClassDialogProps {
    readonly assetClass: AssetClassView;
    readonly onClose: () => void;
}

export function DeleteClassDialog({ assetClass, onClose }: DeleteClassDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const locale: SupportedLocale = useLocale();
    const label: ClassLabel = useClassLabel();
    const toast: ToastApi = useToast();
    const remove: UseMutationResult<void, ApiError, string> = useDeleteClass();
    const name: string = label(assetClass.systemKey, assetClass.name);
    const description: string =
        assetClass.targetBps > 0
            ? t('classes.delete.descriptionWithTarget', { target: formatTargetBps(assetClass.targetBps, locale) })
            : t('classes.delete.description');

    const confirm = async (): Promise<void> => {
        try {
            await remove.mutateAsync(assetClass.id);
            toast.show({ tone: 'positive', title: t('classes.toasts.deleted', { name }) });
        } catch (error) {
            toast.show({ tone: 'critical', title: t('classes.toasts.deleteFailed'), detail: portfolioErrorMessage(tp, error as Error) });
        }
        onClose();
    };

    return (
        <ConfirmDialog
            title={t('classes.delete.title', { name })}
            description={description}
            confirmLabel={t('classes.delete.confirm')}
            destructive
            pending={remove.isPending}
            onConfirm={(): void => {
                void confirm();
            }}
            onCancel={onClose}
        />
    );
}
