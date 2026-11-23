import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseMutationResult } from '@tanstack/react-query';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { CategoryView } from '../../types';
import { useConfirmSeries, type ConfirmSeriesInput } from '../api/use-recurring.mutations';
import {
    createConfirmSeriesSchema,
    toConfirmBody,
    type ConfirmSeriesFormInput,
    type ConfirmSeriesSchema
} from '../schemas/confirm-series.schema';
import type { ConfirmSeriesResult, RecurringSeriesView } from '../types';
import { recurringErrorMessage } from './recurring-error-message';
import { suggestedCategoryId } from './suggested-category';

export interface ConfirmSeriesForm {
    readonly form: UseFormReturn<ConfirmSeriesFormInput>;
    readonly pending: boolean;
    readonly submit: () => void;
}

function defaultValues(series: RecurringSeriesView, categoryId: string): ConfirmSeriesFormInput {
    return {
        name: series.name,
        cadence: series.cadence,
        expectedDay: series.expectedDay === null ? '' : String(series.expectedDay),
        kind: series.kind,
        categoryId,
        createRule: categoryId !== ''
    };
}

export function useConfirmSeriesForm(
    series: RecurringSeriesView,
    categories: readonly CategoryView[],
    onDone: () => void
): ConfirmSeriesForm {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const toast: ToastApi = useToast();
    const mutation: UseMutationResult<ConfirmSeriesResult, ApiError, ConfirmSeriesInput> = useConfirmSeries();
    const schema: ConfirmSeriesSchema = useMemo((): ConfirmSeriesSchema => createConfirmSeriesSchema(t), [t]);
    const initialCategory: string = suggestedCategoryId(series, categories);
    const form: UseFormReturn<ConfirmSeriesFormInput> = useForm<ConfirmSeriesFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: defaultValues(series, initialCategory)
    });
    const handle: () => Promise<void> = form.handleSubmit((input: ConfirmSeriesFormInput): void => {
        mutation.mutate(
            { id: series.id, body: toConfirmBody(input) },
            {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: t('toast.confirmed', { name: input.name.trim() }) });
                    onDone();
                },
                onError: (error: ApiError): void => {
                    toast.show({ tone: 'critical', title: recurringErrorMessage(t, error) });
                }
            }
        );
    });
    return {
        form,
        pending: mutation.isPending,
        submit: (): void => {
            void handle();
        }
    };
}
