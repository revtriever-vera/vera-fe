import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useUndoInvestmentImport } from '../api/use-undo-investment-import.mutation';
import { investmentImportErrorMessage } from '../lib/investment-import-error-message';
import type { InvestmentImportUndone, InvestmentImportView } from '../types';

export interface UndoInvestmentImportDialogProps {
    readonly item: InvestmentImportView;
    readonly onClose: () => void;
}

export function UndoInvestmentImportDialog({ item, onClose }: UndoInvestmentImportDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const toast: ToastApi = useToast();
    const undo: UseMutationResult<InvestmentImportUndone, ApiError, string> = useUndoInvestmentImport();
    const confirm = (): void => {
        undo.mutate(item.id, {
            onSuccess: (): void => {
                toast.show({ tone: 'positive', title: t('toasts.undone') });
                onClose();
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: t('toasts.undoFailed'), detail: investmentImportErrorMessage(t, error) });
                onClose();
            }
        });
    };
    return (
        <ConfirmDialog
            title={t('undo.title')}
            description={t('undo.description', { count: item.operations })}
            confirmLabel={t('undo.confirm')}
            destructive
            pending={undo.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
