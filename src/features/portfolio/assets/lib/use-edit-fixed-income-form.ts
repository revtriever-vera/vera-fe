import { useMemo, useState } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { z } from 'zod';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { holderBody, holderValueOf, trackHolder } from '../../lib/holder-filter';
import { usePeople, type PeopleState } from '../../lib/people-context';
import { bpsToInput } from '../../lib/parse-percent-input';
import { useUpdateFixedIncomeTitle, type UpdateTitleInput } from '../api/use-update-fixed-income-title.mutation';
import { createFixedIncomeSchema, type FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import type { FixedIncomeIndexer, TitleDetail, UpdateTitleBody } from '../types';
import { toPreviewBody } from './fixed-income-body';
import { defaultRateText, localTodayIso } from './fixed-income-defaults';
import { termsAreValid } from './terms-valid';
import { useIssuerHandlers, type IssuerHandlers } from './use-issuer-handlers';
import { useFailureReporter } from './use-failure-reporter';
import type { FixedIncomeFormState } from './use-fixed-income-form';

export function titleFormValues(title: TitleDetail, locale: SupportedLocale): FixedIncomeFormInput {
    return {
        kind: title.kind,
        issuer: title.issuer,
        name: title.name,
        indexer: title.indexer,
        rate: bpsToInput(title.rateBps, locale),
        applied: title.appliedMinor,
        currency: title.currency,
        appliedAt: title.appliedAt,
        maturityDate: title.maturityDate,
        classId: title.classId,
        holder: holderValueOf(title.holderUserId)
    };
}

export function toUpdateBody(input: FixedIncomeFormInput, multi: boolean): UpdateTitleBody | null {
    const terms: ReturnType<typeof toPreviewBody> = toPreviewBody(input);
    return terms === null
        ? null
        : { ...terms, name: input.name.trim(), issuerId: input.issuer?.id ?? null, ...holderBody(input.holder, multi) };
}

export interface EditFixedIncomeParams {
    readonly title: TitleDetail;
    readonly onSaved: () => void;
}

interface TitleSubmit {
    readonly submit: () => Promise<void>;
    readonly busy: boolean;
    readonly alertMessage: string | null;
}

function useTitleSubmit(form: UseFormReturn<FixedIncomeFormInput>, title: TitleDetail, onSaved: () => void): TitleSubmit {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const toast: ToastApi = useToast();
    const { multi }: PeopleState = usePeople();
    const update: UseMutationResult<TitleDetail, ApiError, UpdateTitleInput> = useUpdateFixedIncomeTitle();
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const report: (error: Error) => void = useFailureReporter({ onAlert: setAlertMessage }, t('toasts.updateFailed'));
    const submit: () => Promise<void> = form.handleSubmit(async (input: FixedIncomeFormInput): Promise<void> => {
        const body: UpdateTitleBody | null = toUpdateBody(input, multi);
        if (body === null) {
            return;
        }
        setAlertMessage(null);
        try {
            await update.mutateAsync({ id: title.id, body });
            if (input.holder !== holderValueOf(title.holderUserId)) {
                trackHolder(input.holder, multi, 'edit');
            }
            toast.show({ tone: 'positive', title: t('toasts.updated', { symbol: input.name.trim() }) });
            onSaved();
        } catch (error) {
            report(error as Error);
        }
    });
    return { submit, busy: update.isPending, alertMessage };
}

export function useEditFixedIncomeForm({ title, onSaved }: EditFixedIncomeParams): FixedIncomeFormState {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const today: string = useMemo((): string => localTodayIso(), []);
    const schema: z.ZodType<FixedIncomeFormInput> = useMemo(
        (): z.ZodType<FixedIncomeFormInput> => createFixedIncomeSchema(t, today),
        [t, today]
    );
    const form: UseFormReturn<FixedIncomeFormInput> = useForm<FixedIncomeFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: titleFormValues(title, locale)
    });
    const values: FixedIncomeFormInput = useWatch({ control: form.control }) as FixedIncomeFormInput;
    const issuerHandlers: IssuerHandlers = useIssuerHandlers(form, 'edit');
    const { submit, busy, alertMessage }: TitleSubmit = useTitleSubmit(form, title, onSaved);
    const changeIndexer = (indexer: FixedIncomeIndexer): void => {
        form.setValue('indexer', indexer, { shouldValidate: form.formState.isSubmitted });
        form.setValue('rate', defaultRateText(indexer, locale));
        if (indexer !== 'prefixed') {
            form.setValue('currency', 'BRL');
        }
    };
    return {
        form,
        values,
        today,
        termsValid: termsAreValid(schema, values),
        canSubmit: schema.safeParse(values).success,
        busy,
        alertMessage,
        submit,
        changeIndexer,
        ...issuerHandlers
    };
}
