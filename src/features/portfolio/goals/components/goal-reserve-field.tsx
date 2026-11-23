import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Button, buttonVariants } from '@/shared/ui/button';
import { MoneyInput } from '@/shared/ui/money-input';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { Skeleton } from '@/shared/ui/skeleton';
import { useEmergencySuggestion } from '../api/use-emergency-suggestion.query';
import { formatMonthName } from '../lib/format-goal-date';
import type { GoalFormInput } from '../schemas/goal.schema';
import { GOAL_BASE_CURRENCY, RESERVE_MONTHS_CHOICES, type EmergencySuggestion, type GoalView } from '../types';

export interface GoalReserveFieldProps {
    readonly form: UseFormReturn<GoalFormInput>;
    readonly goal: GoalView | null;
}

function useMoney(): (minor: number) => string {
    const locale: SupportedLocale = useLocale();
    return (minor: number): string => formatCurrency(minor, GOAL_BASE_CURRENCY, locale);
}

function monthsRange(averageMonths: readonly string[], locale: SupportedLocale): { from: string; to: string } {
    const first: string = averageMonths[0] ?? '';
    const last: string = averageMonths.at(-1) ?? first;
    return { from: formatMonthName(first, locale), to: formatMonthName(last, locale) };
}

function SuggestionLine({
    data,
    form
}: {
    readonly data: EmergencySuggestion;
    readonly form: UseFormReturn<GoalFormInput>;
}): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const money: (minor: number) => string = useMoney();
    if (data.suggestedMinor === null || data.averageMinor === null) {
        return null;
    }
    const suggested: number = data.suggestedMinor;
    const range: { from: string; to: string } = monthsRange(data.averageMonths, locale);
    const key: 'form.reserve.suggestionRange' | 'form.reserve.suggestionOne' =
        data.averageMonths.length > 1 ? 'form.reserve.suggestionRange' : 'form.reserve.suggestionOne';
    return (
        <div className="flex flex-col items-start gap-2">
            <p className="numeric text-sm text-content-muted">
                {t(key, { suggested: money(suggested), months: data.months, average: money(data.averageMinor), ...range })}
            </p>
            <Button
                variant="secondary"
                size="sm"
                onClick={(): void => {
                    form.setValue('targetMinor', suggested, { shouldDirty: true, shouldValidate: true });
                }}
            >
                {t('form.reserve.use', { suggested: money(suggested) })}
            </Button>
        </div>
    );
}

function SpendInput({ form, months }: { readonly form: UseFormReturn<GoalFormInput>; readonly months: number }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const spend: number | null = useWatch({ control: form.control, name: 'monthlySpend' });
    return (
        <div className="flex flex-col items-start gap-2">
            <MoneyInput
                label={t('form.reserve.spendLabel')}
                hint={t('form.reserve.spendHint')}
                currency={GOAL_BASE_CURRENCY}
                value={spend}
                onChange={(minor: number | null): void => {
                    form.setValue('monthlySpend', minor);
                    form.setValue('targetMinor', minor === null ? null : minor * months, { shouldDirty: true, shouldValidate: true });
                }}
            />
            <Link to="/spending/connections" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                {t('form.reserve.connect')}
            </Link>
        </div>
    );
}

function SuggestionBlock({ form, months }: { readonly form: UseFormReturn<GoalFormInput>; readonly months: number }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const suggestion: UseQueryResult<EmergencySuggestion> = useEmergencySuggestion(months, true);
    if (suggestion.data === undefined) {
        return suggestion.isError ? (
            <p role="alert" className="text-sm text-content-muted">
                {t('form.reserve.loadError')}
            </p>
        ) : (
            <Skeleton className="h-9 w-full" />
        );
    }
    return suggestion.data.suggestedMinor === null ? (
        <SpendInput form={form} months={months} />
    ) : (
        <SuggestionLine data={suggestion.data} form={form} />
    );
}

function ChangedAverage({ goal, form }: { readonly goal: GoalView; readonly form: UseFormReturn<GoalFormInput> }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const money: (minor: number) => string = useMoney();
    const reserve: GoalView['reserve'] = goal.reserve;
    if (reserve === null || !reserve.shouldUpdate || reserve.averageMinor === null || reserve.suggestedMinor === null) {
        return null;
    }
    const { months, suggestedMinor, averageMinor }: { months: number; suggestedMinor: number; averageMinor: number } = {
        months: reserve.months,
        suggestedMinor: reserve.suggestedMinor,
        averageMinor: reserve.averageMinor
    };
    return (
        <Alert
            tone="caution"
            title={t('form.reserve.changed', { average: money(averageMinor), suggested: money(suggestedMinor) })}
            action={
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={(): void => {
                        form.setValue('reserveMonths', months, { shouldDirty: true });
                        form.setValue('targetMinor', suggestedMinor, { shouldDirty: true, shouldValidate: true });
                    }}
                >
                    {t('form.reserve.update')}
                </Button>
            }
        />
    );
}

export function GoalReserveField({ form, goal }: GoalReserveFieldProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const months: number = useWatch({ control: form.control, name: 'reserveMonths' });
    const options: readonly SegmentedOption<string>[] = RESERVE_MONTHS_CHOICES.map((choice: number): SegmentedOption<string> => ({
        value: String(choice),
        label: t('form.reserve.monthsOption', { months: choice })
    }));
    return (
        <div className="flex flex-col gap-3">
            {goal === null ? null : <ChangedAverage goal={goal} form={form} />}
            <div className="flex flex-col gap-1.5">
                <SegmentedControl
                    label={t('form.reserve.monthsLabel')}
                    options={options}
                    value={String(months)}
                    onChange={(value: string): void => {
                        const next: number = Number(value);
                        const spend: number | null = form.getValues('monthlySpend');
                        form.setValue('reserveMonths', next, { shouldDirty: true });
                        if (spend !== null) {
                            form.setValue('targetMinor', spend * next, { shouldDirty: true, shouldValidate: true });
                        }
                    }}
                />
                <p className="text-2xs text-content-subtle">{t('form.reserve.monthsHint')}</p>
            </div>
            <SuggestionBlock form={form} months={months} />
        </div>
    );
}
