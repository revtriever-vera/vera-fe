import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseMutationResult } from '@tanstack/react-query';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useUpdateSeries, type UpdateSeriesInput } from '../api/use-recurring.mutations';
import { createEditSeriesSchema, toUpdateBody, type EditSeriesFormInput, type EditSeriesSchema } from '../schemas/edit-series.schema';
import type { RecurringSeriesRecord, RecurringSeriesView } from '../types';
import { recurringErrorMessage } from './recurring-error-message';

export interface EditSeriesForm {
    readonly form: UseFormReturn<EditSeriesFormInput>;
    readonly pending: boolean;
    readonly submit: () => void;
}

function defaultValues(series: RecurringSeriesView): EditSeriesFormInput {
    return {
        name: series.name,
        cadence: series.cadence,
        expectedDay: series.expectedDay === null ? '' : String(series.expectedDay),
        valueMode: series.valueMode,
        kind: series.kind
    };
}

export function useEditSeriesForm(series: RecurringSeriesView, onDone: () => void): EditSeriesForm {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const toast: ToastApi = useToast();
    const mutation: UseMutationResult<RecurringSeriesRecord, ApiError, UpdateSeriesInput> = useUpdateSeries();
    const schema: EditSeriesSchema = useMemo((): EditSeriesSchema => createEditSeriesSchema(t), [t]);
    const form: UseFormReturn<EditSeriesFormInput> = useForm<EditSeriesFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: defaultValues(series)
    });
    const handle: () => Promise<void> = form.handleSubmit((input: EditSeriesFormInput): void => {
        mutation.mutate(
            { id: series.id, body: toUpdateBody(input) },
            {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: t('toast.updated', { name: input.name.trim() }) });
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
