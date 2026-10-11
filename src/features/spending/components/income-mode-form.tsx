import { useMemo, type ReactElement } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Controller, useForm, useWatch, type Control, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { MoneyInput } from '@/shared/ui/money-input';
import { createIncomeModeSchema, type IncomeModeFormInput } from '../schemas/income-mode.schema';
import { INCOME_MODES, SPENDING_CURRENCY, type IncomeMode } from '../types';

export interface IncomeModeFormProps {
    readonly formId: string;
    readonly initial: IncomeModeFormInput;
    readonly onSubmit: (input: IncomeModeFormInput, form: UseFormReturn<IncomeModeFormInput>) => Promise<void>;
}

function DeclaredIncomeField({ control }: { readonly control: Control<IncomeModeFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    return (
        <Controller
            control={control}
            name="declaredIncomeMinor"
            render={({ field, fieldState }): ReactElement => (
                <MoneyInput
                    label={t('income.declaredLabel')}
                    hint={t('income.declaredHint')}
                    currency={SPENDING_CURRENCY}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                />
            )}
        />
    );
}

export function IncomeModeForm({ formId, initial, onSubmit }: IncomeModeFormProps): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const schema: z.ZodType<IncomeModeFormInput> = useMemo((): z.ZodType<IncomeModeFormInput> => createIncomeModeSchema(t), [t]);
    const form: UseFormReturn<IncomeModeFormInput> = useForm<IncomeModeFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: initial
    });
    const mode: IncomeMode = useWatch({ control: form.control, name: 'mode' });
    const options: readonly SegmentedOption<IncomeMode>[] = [
        { value: INCOME_MODES[0], label: t('income.fromTransactions') },
        { value: INCOME_MODES[1], label: t('income.declared') }
    ];
    return (
        <form
            id={formId}
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(event): void => {
                void form.handleSubmit(async (input: IncomeModeFormInput): Promise<void> => onSubmit(input, form))(event);
            }}
        >
            <SegmentedControl
                label={t('income.modeLabel')}
                options={options}
                value={mode}
                onChange={(next: IncomeMode): void => {
                    form.setValue('mode', next, { shouldValidate: true });
                }}
            />
            {mode === INCOME_MODES[0] ? (
                <p className="text-sm text-content-muted">{t('income.transactionsHint')}</p>
            ) : (
                <DeclaredIncomeField control={form.control} />
            )}
        </form>
    );
}
