import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { track } from '@/shared/lib/analytics';
import { cn } from '@/shared/lib/cn';
import { useUpdateCategoryFlexibility, type UpdateCategoryFlexibilityInput } from '../api/use-update-category-flexibility.mutation';
import { spendingErrorMessage } from '../lib/spending-error-message';
import { useCategoryLabel, type CategoryLabel } from '../lib/use-category-label';
import { CATEGORY_KIND, FLEXIBILITY, type CategoryFlexibility, type CategoryView } from '../types';

export type FlexibilityTarget = Pick<CategoryView, 'id' | 'kind' | 'flexibility' | 'systemKey' | 'name'>;

export interface FlexibilityToggleProps {
    readonly category: FlexibilityTarget;
    readonly size?: 'sm' | 'md';
}

const SIZE_CLASS: Readonly<Record<'sm' | 'md', string>> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
};

interface FlexibilityChange {
    readonly pending: boolean;
    readonly toggle: () => void;
}

function useFlexibilityChange(category: FlexibilityTarget): FlexibilityChange {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const update: UseMutationResult<CategoryView, ApiError, UpdateCategoryFlexibilityInput> = useUpdateCategoryFlexibility();
    return {
        pending: update.isPending,
        toggle: (): void => {
            if (update.isPending) {
                return;
            }
            const flexibility: CategoryFlexibility =
                category.flexibility === FLEXIBILITY.flexible ? FLEXIBILITY.fixed : FLEXIBILITY.flexible;
            update.mutate(
                { id: category.id, flexibility },
                {
                    onSuccess: (): void => {
                        track('spending_flexibility_changed', { flexibility });
                    },
                    onError: (error: Error): void => {
                        toast.show({ tone: 'critical', title: t('flexibility.failed'), detail: spendingErrorMessage(t, error) });
                    }
                }
            );
        }
    };
}

export function FlexibilityToggle({ category, size = 'sm' }: FlexibilityToggleProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const label: CategoryLabel = useCategoryLabel();
    const change: FlexibilityChange = useFlexibilityChange(category);
    if (category.kind !== CATEGORY_KIND.expense) {
        return null;
    }
    const flexible: boolean = category.flexibility === FLEXIBILITY.flexible;
    const state: string = t(`categories.flexibility.${flexible ? FLEXIBILITY.flexible : FLEXIBILITY.fixed}`);
    return (
        <button
            type="button"
            aria-pressed={flexible}
            aria-label={t('flexibility.toggleLabel', { name: label(category), state })}
            aria-disabled={change.pending}
            onClick={change.toggle}
            className={cn(
                'rounded-control border font-semibold transition-colors aria-disabled:cursor-progress aria-disabled:opacity-60',
                SIZE_CLASS[size],
                flexible ? 'border-accent bg-accent-soft text-accent-strong' : 'border-border bg-surface-muted text-content-muted'
            )}
        >
            {state}
        </button>
    );
}
