import { Info } from 'lucide-react';
import type { ReactElement } from 'react';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { DateField } from '@/shared/ui/date-field';
import { Field } from '@/shared/ui/field';
import { MoneyInput } from '@/shared/ui/money-input';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import type { SelectChoice } from '@/shared/ui/select-menu';
import type { AssetClassView } from '../../types';
import { MIN_APPLIED_DATE, rateLabelKey } from '../lib/fixed-income-defaults';
import type { FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import {
    ASSET_CURRENCIES,
    FIXED_INCOME_INDEXERS,
    FIXED_INCOME_KINDS,
    type AssetCurrency,
    type FixedIncomeIndexer,
    type FixedIncomeKind
} from '../types';
import { ClassSelect } from './class-select';
import { LabeledSelect } from './labeled-select';

export interface FixedIncomeFormProps {
    readonly form: UseFormReturn<FixedIncomeFormInput>;
    readonly classes: readonly AssetClassView[];
    readonly today: string;
    readonly formId: string;
    readonly alertMessage: string | null;
    readonly onSubmit: () => void;
    readonly onIndexerChange: (indexer: FixedIncomeIndexer) => void;
}

function ErrorLine({ message }: { readonly message: string | undefined }): ReactElement | null {
    return message === undefined ? null : (
        <p role="alert" className="text-2xs text-critical">
            {message}
        </p>
    );
}

function KindAndName({ form }: { readonly form: UseFormReturn<FixedIncomeFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const choices: readonly SelectChoice[] = FIXED_INCOME_KINDS.map((kind: FixedIncomeKind): SelectChoice => ({
        value: kind,
        label: t(`fixedIncome.kinds.${kind}`),
        warning: null
    }));
    return (
        <>
            <Controller
                control={form.control}
                name="kind"
                render={({ field }): ReactElement => (
                    <LabeledSelect
                        label={t('fixedIncome.kind')}
                        placeholder={t('fixedIncome.kind')}
                        value={field.value}
                        choices={choices}
                        onChange={field.onChange}
                    />
                )}
            />
            <Field
                label={t('fixedIncome.name')}
                placeholder={t('fixedIncome.namePlaceholder')}
                autoComplete="off"
                error={form.formState.errors.name?.message}
                {...form.register('name')}
            />
        </>
    );
}

function IndexerAndRate({
    form,
    onIndexerChange
}: {
    readonly form: UseFormReturn<FixedIncomeFormInput>;
    readonly onIndexerChange: (indexer: FixedIncomeIndexer) => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const indexer: FixedIncomeIndexer = useWatch({ control: form.control, name: 'indexer' });
    const choices: readonly SelectChoice[] = FIXED_INCOME_INDEXERS.map((item: FixedIncomeIndexer): SelectChoice => ({
        value: item,
        label: t(`fixedIncome.indexers.${item}`),
        warning: null
    }));
    return (
        <>
            <LabeledSelect
                label={t('fixedIncome.indexer')}
                placeholder={t('fixedIncome.indexer')}
                value={indexer}
                choices={choices}
                error={form.formState.errors.currency?.message}
                onChange={(value: string): void => {
                    onIndexerChange(value as FixedIncomeIndexer);
                }}
            />
            <Field
                label={t(rateLabelKey(indexer))}
                inputMode="decimal"
                autoComplete="off"
                error={form.formState.errors.rate?.message}
                {...form.register('rate')}
            />
        </>
    );
}

function CurrencyToggle({ form }: { readonly form: UseFormReturn<FixedIncomeFormInput> }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const currency: AssetCurrency = useWatch({ control: form.control, name: 'currency' });
    const indexer: FixedIncomeIndexer = useWatch({ control: form.control, name: 'indexer' });
    const options: readonly SegmentedOption<AssetCurrency>[] = ASSET_CURRENCIES.map(
        (item: AssetCurrency): SegmentedOption<AssetCurrency> => ({ value: item, label: item })
    );
    if (indexer !== 'prefixed') {
        return null;
    }
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-content">{t('fixedIncome.currency')}</span>
            <SegmentedControl
                label={t('fixedIncome.currency')}
                options={options}
                value={currency}
                onChange={(next: AssetCurrency): void => {
                    form.setValue('currency', next, { shouldValidate: true });
                }}
            />
        </div>
    );
}

function AppliedAmount({ form }: { readonly form: UseFormReturn<FixedIncomeFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const currency: AssetCurrency = useWatch({ control: form.control, name: 'currency' });
    return (
        <>
            <Controller
                control={form.control}
                name="applied"
                render={({ field }): ReactElement => (
                    <MoneyInput
                        label={t('fixedIncome.applied')}
                        value={field.value}
                        currency={currency}
                        name={field.name}
                        ref={field.ref}
                        error={form.formState.errors.applied?.message}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                    />
                )}
            />
            <CurrencyToggle form={form} />
        </>
    );
}

function AppliedAtField({ form, today }: { readonly form: UseFormReturn<FixedIncomeFormInput>; readonly today: string }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <div className="flex flex-col gap-1">
            <Controller
                control={form.control}
                name="appliedAt"
                render={({ field }): ReactElement => (
                    <DateField
                        label={t('fixedIncome.appliedAt')}
                        value={field.value}
                        min={MIN_APPLIED_DATE}
                        max={today}
                        onChange={(iso: string | null): void => {
                            field.onChange(iso);
                            void form.trigger(['appliedAt', 'maturityDate']);
                        }}
                    />
                )}
            />
            <ErrorLine message={form.formState.errors.appliedAt?.message} />
        </div>
    );
}

function MaturityField({ form }: { readonly form: UseFormReturn<FixedIncomeFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const appliedAt: string | null = useWatch({ control: form.control, name: 'appliedAt' });
    return (
        <div className="flex flex-col gap-1">
            <Controller
                control={form.control}
                name="maturityDate"
                render={({ field }): ReactElement => (
                    <DateField
                        label={t('fixedIncome.maturityDate')}
                        value={field.value}
                        min={appliedAt}
                        onChange={(iso: string | null): void => {
                            field.onChange(iso);
                            void form.trigger('maturityDate');
                        }}
                    />
                )}
            />
            <ErrorLine message={form.formState.errors.maturityDate?.message} />
        </div>
    );
}

function ClassField({
    form,
    classes
}: {
    readonly form: UseFormReturn<FixedIncomeFormInput>;
    readonly classes: readonly AssetClassView[];
}): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <Controller
            control={form.control}
            name="classId"
            render={({ field }): ReactElement => (
                <ClassSelect
                    label={t('fixedIncome.class')}
                    placeholder={t('fixedIncome.classPlaceholder')}
                    value={field.value}
                    classes={classes}
                    error={form.formState.errors.classId?.message}
                    onChange={field.onChange}
                />
            )}
        />
    );
}

export function FixedIncomeForm({
    form,
    classes,
    today,
    formId,
    alertMessage,
    onSubmit,
    onIndexerChange
}: FixedIncomeFormProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <form
            id={formId}
            noValidate
            onSubmit={(event): void => {
                event.preventDefault();
                onSubmit();
            }}
            className="@container flex flex-col gap-4"
        >
            {alertMessage === null ? null : <Alert title={alertMessage} />}
            <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2">
                <KindAndName form={form} />
                <IndexerAndRate form={form} onIndexerChange={onIndexerChange} />
                <AppliedAmount form={form} />
                <AppliedAtField form={form} today={today} />
                <MaturityField form={form} />
            </div>
            <ClassField form={form} classes={classes} />
            <p className="flex items-start gap-2 text-xs text-content-muted">
                <Info className="mt-px size-4 shrink-0" aria-hidden="true" />
                {t('fixedIncome.tesouroNotice')}
            </p>
        </form>
    );
}
