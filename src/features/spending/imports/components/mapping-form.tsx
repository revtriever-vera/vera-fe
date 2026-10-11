import { useId, useMemo, type ReactElement } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch, type Control, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import type { SelectChoice } from '@/shared/ui/select-menu';
import {
    AMOUNT_MODES,
    DATE_FORMATS,
    DECIMAL_SEPARATORS,
    createMappingSchema,
    toCsvMapping,
    type AmountMode,
    type CsvMapping,
    type DecimalSeparator,
    type MappingColumnField,
    type MappingFormValues
} from '../schemas/mapping.schema';
import { LabeledSelect } from './labeled-select';

export interface MappingFormProps {
    readonly columns: readonly string[];
    readonly initial: MappingFormValues;
    readonly busy: boolean;
    readonly onSubmit: (mapping: CsvMapping) => void;
}

type Translate = UseTranslationResponse<'spendingImports', undefined>['t'];

interface ColumnFieldProps {
    readonly control: Control<MappingFormValues>;
    readonly name: MappingColumnField;
    readonly label: string;
    readonly choices: readonly SelectChoice[];
}

function ColumnField({ control, name, label, choices }: ColumnFieldProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }): ReactElement => (
                <LabeledSelect
                    label={label}
                    value={field.value}
                    choices={choices}
                    placeholder={t('mapping.columnPlaceholder')}
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                />
            )}
        />
    );
}

interface MappingPartProps {
    readonly control: Control<MappingFormValues>;
    readonly t: Translate;
}

function AmountColumns({
    control,
    t,
    mode,
    choices
}: MappingPartProps & { readonly mode: AmountMode; readonly choices: readonly SelectChoice[] }): ReactElement {
    if (mode === 'single') {
        return <ColumnField control={control} name="amountColumn" label={t('mapping.amount')} choices={choices} />;
    }
    return (
        <>
            <ColumnField control={control} name="debitColumn" label={t('mapping.debit')} choices={choices} />
            <ColumnField control={control} name="creditColumn" label={t('mapping.credit')} choices={choices} />
        </>
    );
}

function DateFormatField({ control, t }: MappingPartProps): ReactElement {
    const formats: readonly SelectChoice[] = DATE_FORMATS.map((format: (typeof DATE_FORMATS)[number]): SelectChoice => ({
        value: format,
        label: t(`mapping.dateFormats.${format}`),
        warning: null
    }));
    return (
        <Controller
            control={control}
            name="dateFormat"
            render={({ field }): ReactElement => (
                <LabeledSelect
                    label={t('mapping.dateFormat')}
                    value={field.value}
                    choices={formats}
                    placeholder={t('mapping.dateFormat')}
                    onChange={field.onChange}
                />
            )}
        />
    );
}

function DecimalSeparatorField({ control, t }: MappingPartProps): ReactElement {
    const separators: readonly SegmentedOption<DecimalSeparator>[] = [
        { value: DECIMAL_SEPARATORS[0], label: t('mapping.comma') },
        { value: DECIMAL_SEPARATORS[1], label: t('mapping.dot') }
    ];
    return (
        <Controller
            control={control}
            name="decimalSeparator"
            render={({ field }): ReactElement => (
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-content">{t('mapping.decimalSeparator')}</span>
                    <SegmentedControl
                        label={t('mapping.decimalSeparator')}
                        options={separators}
                        value={field.value}
                        onChange={field.onChange}
                    />
                </div>
            )}
        />
    );
}

interface CheckboxFieldProps {
    readonly form: UseFormReturn<MappingFormValues>;
    readonly name: 'hasHeader' | 'invertSign';
    readonly label: string;
}

function CheckboxField({ form, name, label }: CheckboxFieldProps): ReactElement {
    return (
        <label className="flex items-center gap-2 text-sm text-content">
            <input type="checkbox" className="size-4 accent-accent-strong" {...form.register(name)} />
            {label}
        </label>
    );
}

function AmountModeField({ control, t }: MappingPartProps): ReactElement {
    const modes: readonly SegmentedOption<AmountMode>[] = [
        { value: AMOUNT_MODES[0], label: t('mapping.single') },
        { value: AMOUNT_MODES[1], label: t('mapping.split') }
    ];
    return (
        <Controller
            control={control}
            name="amountMode"
            render={({ field }): ReactElement => (
                <SegmentedControl label={t('mapping.amountModeLabel')} options={modes} value={field.value} onChange={field.onChange} />
            )}
        />
    );
}

function useMappingForm(initial: MappingFormValues): UseFormReturn<MappingFormValues> {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const schema: z.ZodType<MappingFormValues> = useMemo((): z.ZodType<MappingFormValues> => createMappingSchema(t), [t]);
    return useForm<MappingFormValues>({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: initial });
}

function MappingFields({
    control,
    columns
}: {
    readonly control: Control<MappingFormValues>;
    readonly columns: readonly string[];
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const mode: AmountMode = useWatch({ control, name: 'amountMode' });
    const choices: readonly SelectChoice[] = columns.map((name: string, index: number): SelectChoice => ({
        value: String(index),
        label: name,
        warning: null
    }));
    return (
        <>
            <AmountModeField control={control} t={t} />
            <div className="grid gap-3 sm:grid-cols-2">
                <ColumnField control={control} name="dateColumn" label={t('mapping.date')} choices={choices} />
                <ColumnField control={control} name="descriptionColumn" label={t('mapping.description')} choices={choices} />
                <AmountColumns control={control} t={t} mode={mode} choices={choices} />
                <DateFormatField control={control} t={t} />
                <DecimalSeparatorField control={control} t={t} />
            </div>
        </>
    );
}

export function MappingForm({ columns, initial, busy, onSubmit }: MappingFormProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const titleId: string = useId();
    const form: UseFormReturn<MappingFormValues> = useMappingForm(initial);
    const submit: ReturnType<typeof form.handleSubmit> = form.handleSubmit((values: MappingFormValues): void => {
        onSubmit(toCsvMapping(values));
    });
    return (
        <form
            noValidate
            aria-labelledby={titleId}
            onSubmit={(event): void => {
                void submit(event);
            }}
            className="flex flex-col gap-3 rounded-card border border-border bg-surface-muted p-3"
        >
            <div className="flex flex-col gap-1">
                <h3 id={titleId} className="text-sm font-semibold text-content">
                    {t('mapping.title')}
                </h3>
                <p className="text-sm text-content-muted">{t('mapping.intro')}</p>
            </div>
            <CheckboxField form={form} name="hasHeader" label={t('mapping.hasHeader')} />
            <MappingFields control={form.control} columns={columns} />
            <CheckboxField form={form} name="invertSign" label={t('mapping.invertSign')} />
            <Button type="submit" variant="secondary" loading={busy} className="self-start">
                {busy ? t('mapping.submitting') : t('mapping.submit')}
            </Button>
        </form>
    );
}
