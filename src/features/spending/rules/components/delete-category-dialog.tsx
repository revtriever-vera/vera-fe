import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { Recategorized } from '../../types';
import type { DeleteCategoryInput } from '../api/use-delete-category.mutation';
import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { CategoryPicker } from '../../components/category-picker';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import { useCategoryLabel, type CategoryLabel } from '../../lib/use-category-label';
import type { CategoryView } from '../../types';
import { useDeleteCategory } from '../api/use-delete-category.mutation';
import { recategorizedToast } from '../lib/recategorized-toast';

export interface DeleteCategoryDialogProps {
    readonly category: CategoryView;
    readonly onClose: () => void;
}

interface Deletion {
    readonly confirm: () => void;
    readonly pending: boolean;
}

function useDeletion(category: CategoryView, moveTo: string | null, onClose: () => void): Deletion {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const remove: UseMutationResult<Recategorized, ApiError, DeleteCategoryInput> = useDeleteCategory();
    return {
        pending: remove.isPending,
        confirm: (): void => {
            remove.mutate(
                { id: category.id, moveTo },
                {
                    onSuccess: (result): void => {
                        toast.show({ tone: 'positive', title: recategorizedToast(t, 'categoryDeleted', result.recategorized) });
                        onClose();
                    },
                    onError: (error: Error): void => {
                        toast.show({ tone: 'critical', title: t('toasts.categoryDeleteFailed'), detail: spendingErrorMessage(ts, error) });
                        onClose();
                    }
                }
            );
        }
    };
}

export function DeleteCategoryDialog({ category, onClose }: DeleteCategoryDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const label: CategoryLabel = useCategoryLabel();
    const [moveTo, setMoveTo] = useState<string | null>(null);
    const deletion: Deletion = useDeletion(category, moveTo, onClose);
    return (
        <Modal
            title={t('deleteCategory.title', { name: label(category) })}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t('deleteCategory.cancel')}
                    </Button>
                    <Button variant="danger" loading={deletion.pending} onClick={deletion.confirm}>
                        {t('deleteCategory.confirm')}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-content">{t('deleteCategory.moveTo')}</span>
                <CategoryPicker
                    label={t('deleteCategory.moveToLabel')}
                    value={moveTo}
                    onChange={setMoveTo}
                    allowNone
                    noneLabel={t('deleteCategory.auto')}
                    onlyKind={category.kind}
                    excludeId={category.id}
                />
                <p className="text-sm text-content-muted">{t('deleteCategory.rulesWarning')}</p>
            </div>
        </Modal>
    );
}
