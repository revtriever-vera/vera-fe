import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { ImportRemoved, ImportView } from '../../types';
import { useUndoImport } from '../api/use-undo-import.mutation';

export interface UndoImportDialogProps {
    readonly item: ImportView;
    readonly onClose: () => void;
}

export function UndoImportDialog({ item, onClose }: UndoImportDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const undo: UseMutationResult<ImportRemoved, ApiError, string> = useUndoImport();
    const confirm = (): void => {
        undo.mutate(item.id, {
            onSuccess: (removed: ImportRemoved): void => {
                toast.show({ tone: 'positive', title: t('toasts.undone', { count: removed.removed }) });
                onClose();
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: t('toasts.undoFailed'), detail: spendingErrorMessage(ts, error) });
                onClose();
            }
        });
    };
    return (
        <ConfirmDialog
            title={t('undo.title')}
            description={t('undo.description', { count: item.inserted })}
            confirmLabel={t('undo.confirm')}
            destructive
            pending={undo.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
