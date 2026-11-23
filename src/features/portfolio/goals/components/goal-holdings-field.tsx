import type { ChangeEvent, ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Field } from '@/shared/ui/field';
import { Skeleton } from '@/shared/ui/skeleton';
import { useHoldings } from '../../api/use-holdings.query';
import { formatShareBps } from '../../lib/format-bps';
import type { HoldingView, HoldingsResponse } from '../../types';
import { freeBpsOf, holdingKey } from '../lib/goal-holdings';
import type { GoalFormInput } from '../schemas/goal.schema';
import { GOAL_KIND } from '../types';

export interface GoalHoldingsFieldProps {
    readonly form: UseFormReturn<GoalFormInput>;
    readonly usedBps: ReadonlyMap<string, number>;
}

const REGULAR_FIRST: ReadonlySet<string> = new Set<string>(['tesouro', 'fixed_income']);

function ordered(holdings: readonly HoldingView[], reserve: boolean): readonly HoldingView[] {
    if (!reserve) {
        return holdings;
    }
    const rank = (holding: HoldingView): number => (REGULAR_FIRST.has(holding.typeGroup) ? 0 : 1);
    return [...holdings].sort((left: HoldingView, right: HoldingView): number => rank(left) - rank(right));
}

interface RowProps {
    readonly holding: HoldingView;
    readonly value: string;
    readonly freeBps: number;
    readonly error: string | undefined;
    readonly onChange: (text: string) => void;
}

function HoldingRow({ holding, value, freeBps, error, onChange }: RowProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const label: string = holding.symbol === holding.name ? holding.name : `${holding.symbol} · ${holding.name}`;
    return (
        <li>
            <Field
                id={`goal-share-${holdingKey(holding.kind, holding.id)}`}
                label={t('form.holdings.rowLabel', { name: label })}
                value={value}
                inputMode="decimal"
                autoComplete="off"
                placeholder={t('form.holdings.sharePlaceholder')}
                hint={t('form.holdings.free', { free: formatShareBps(freeBps, locale, 0) })}
                error={error}
                disabled={freeBps === 0 && value === ''}
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                    onChange(event.target.value);
                }}
            />
        </li>
    );
}

function HoldingsEmpty(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    return (
        <p className="text-sm text-content-muted">
            {t('form.holdings.empty')}{' '}
            <Link to="/portfolio/assets" className="font-semibold text-accent-strong underline">
                {t('form.holdings.addAssets')}
            </Link>
        </p>
    );
}

function HoldingsList({ form, usedBps, holdings }: GoalHoldingsFieldProps & { readonly holdings: readonly HoldingView[] }): ReactElement {
    const kind: string = useWatch({ control: form.control, name: 'kind' });
    return (
        <Controller
            control={form.control}
            name="shares"
            render={({ field }): ReactElement => (
                <ul className="flex flex-col gap-3">
                    {ordered(holdings, kind === GOAL_KIND.emergencyReserve).map((holding: HoldingView): ReactElement => {
                        const key: string = holdingKey(holding.kind, holding.id);
                        const change = (text: string): void => {
                            field.onChange({ ...field.value, [key]: text });
                        };
                        return (
                            <HoldingRow
                                key={key}
                                holding={holding}
                                value={field.value[key] ?? ''}
                                freeBps={freeBpsOf(usedBps, key)}
                                error={form.formState.errors.shares?.[key]?.message}
                                onChange={change}
                            />
                        );
                    })}
                </ul>
            )}
        />
    );
}

function HoldingsBody(props: GoalHoldingsFieldProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const holdings: UseQueryResult<HoldingsResponse> = useHoldings();
    if (holdings.data === undefined) {
        return holdings.isError ? (
            <p role="alert" className="text-sm text-critical">
                {t('form.holdings.loadError')}
            </p>
        ) : (
            <Skeleton className="h-16 w-full" />
        );
    }
    if (holdings.data.data.length === 0) {
        return <HoldingsEmpty />;
    }
    return <HoldingsList {...props} holdings={holdings.data.data} />;
}

export function GoalHoldingsField(props: GoalHoldingsFieldProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const reserve: boolean = useWatch({ control: props.form.control, name: 'kind' }) === GOAL_KIND.emergencyReserve;
    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-content">{t('form.holdings.title')}</legend>
            <p className="text-2xs text-content-subtle">{t(reserve ? 'form.holdings.reserveHint' : 'form.holdings.hint')}</p>
            <HoldingsBody {...props} />
        </fieldset>
    );
}
