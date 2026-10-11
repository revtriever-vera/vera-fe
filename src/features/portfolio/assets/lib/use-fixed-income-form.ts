import { useMemo, useState } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { z } from 'zod';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useCreateFixedIncomeTitle } from '../api/use-create-fixed-income-title.mutation';
import { createFixedIncomeSchema, type FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import type { CreateTitleBody, FixedIncomeIndexer, TitleView } from '../types';
import { toTitleBody } from './fixed-income-body';
import { defaultRateText, indexerClassKey, localTodayIso } from './fixed-income-defaults';
import { defaultClassId } from './position-defaults';
import { termsAreValid } from './terms-valid';
import { useFailureReporter } from './use-failure-reporter';

export interface FixedIncomeFormParams {
    readonly classes: readonly AssetClassView[];
    readonly initialClassId: string | undefined;
    readonly onSaved: () => void;
}

export interface FixedIncomeFormState {
    readonly form: UseFormReturn<FixedIncomeFormInput>;
    readonly values: FixedIncomeFormInput;
    readonly today: string;
    readonly termsValid: boolean;
    readonly canSubmit: boolean;
    readonly busy: boolean;
    readonly alertMessage: string | null;
    readonly submit: () => Promise<void>;
    readonly changeIndexer: (indexer: FixedIncomeIndexer) => void;
}

export function fixedIncomeDefaults(
    classes: readonly AssetClassView[],
    initialClassId: string | undefined,
    locale: SupportedLocale
): FixedIncomeFormInput {
    return {
        kind: 'cdb',
        name: '',
        indexer: 'cdi_percent',
        rate: defaultRateText('cdi_percent', locale),
        applied: null,
        currency: 'BRL',
        appliedAt: null,
        maturityDate: null,
        classId: defaultClassId(classes, indexerClassKey('cdi_percent'), initialClassId)
    };
}

function useIndexerChange(
    form: UseFormReturn<FixedIncomeFormInput>,
    classes: readonly AssetClassView[],
    initialClassId: string | undefined
): (indexer: FixedIncomeIndexer) => void {
    const locale: SupportedLocale = useLocale();
    return (indexer: FixedIncomeIndexer): void => {
        form.setValue('indexer', indexer, { shouldValidate: form.formState.isSubmitted });
        form.setValue('rate', defaultRateText(indexer, locale));
        if (indexer !== 'prefixed') {
            form.setValue('currency', 'BRL');
        }
        if (!form.getFieldState('classId').isDirty) {
            form.setValue('classId', defaultClassId(classes, indexerClassKey(indexer), initialClassId));
        }
    };
}

interface SubmitParams {
    readonly form: UseFormReturn<FixedIncomeFormInput>;
    readonly classes: readonly AssetClassView[];
    readonly onSaved: () => void;
    readonly setAlertMessage: (message: string | null) => void;
}

function useTitleSubmit({ form, classes, onSaved, setAlertMessage }: SubmitParams): { submit: () => Promise<void>; busy: boolean } {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const toast: ToastApi = useToast();
    const classLabel: ClassLabel = useClassLabel();
    const create: UseMutationResult<TitleView, ApiError, CreateTitleBody> = useCreateFixedIncomeTitle();
    const report: (error: Error) => void = useFailureReporter({ onAlert: setAlertMessage }, t('toasts.addFailed'));
    const submit: () => Promise<void> = form.handleSubmit(async (input: FixedIncomeFormInput): Promise<void> => {
        const body: CreateTitleBody | null = toTitleBody(input);
        if (body === null) {
            return;
        }
        setAlertMessage(null);
        try {
            await create.mutateAsync(body);
            track('portfolio_asset_added', { type: 'fixed_income', source: 'fixed_income' });
            const chosen: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === input.classId);
            const className: string = chosen === undefined ? '' : classLabel(chosen.systemKey, chosen.name);
            toast.show({ tone: 'positive', title: t('toasts.added', { name: input.name.trim(), className }) });
            onSaved();
        } catch (error) {
            report(error as Error);
        }
    });
    return { submit, busy: create.isPending };
}

export function useFixedIncomeForm({ classes, initialClassId, onSaved }: FixedIncomeFormParams): FixedIncomeFormState {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const today: string = useMemo((): string => localTodayIso(), []);
    const schema: z.ZodType<FixedIncomeFormInput> = useMemo(
        (): z.ZodType<FixedIncomeFormInput> => createFixedIncomeSchema(t, today),
        [t, today]
    );
    const form: UseFormReturn<FixedIncomeFormInput> = useForm<FixedIncomeFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: fixedIncomeDefaults(classes, initialClassId, locale)
    });
    const values: FixedIncomeFormInput = useWatch({ control: form.control }) as FixedIncomeFormInput;
    const changeIndexer: (indexer: FixedIncomeIndexer) => void = useIndexerChange(form, classes, initialClassId);
    const { submit, busy } = useTitleSubmit({ form, classes, onSaved, setAlertMessage });
    return {
        form,
        values,
        today,
        termsValid: termsAreValid(schema, values),
        canSubmit: schema.safeParse(values).success,
        busy,
        alertMessage,
        submit,
        changeIndexer
    };
}
