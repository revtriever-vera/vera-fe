import { useEffect, useState, type ReactElement } from 'react';
import { useNavigate, useSearch, type UseNavigateResult } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { track } from '@/shared/lib/analytics';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Skeleton } from '@/shared/ui/skeleton';
import { usePortfolioSettings } from '../../api/use-portfolio-settings.query';
import { BaseCurrencySwitch } from '../../components/base-currency-switch';
import type { BaseCurrency, PortfolioSettings } from '../../types';
import { useContributionSuggestion } from '../api/use-contribution-suggestion.query';
import { AmountInput } from '../components/amount-input';
import { SuggestionPanel } from '../components/suggestion-panel';
import { majorToMinor, minorToMajor } from '../lib/amount-minor';
import { DEFAULT_AMOUNT } from '../lib/quick-amounts';
import type { ContributionSuggestion } from '../types';

const DEBOUNCE_MS: number = 400;
const EMPTY_AMOUNT: number = 0;

function initialMinor(amount: number | undefined, currency: BaseCurrency, locale: SupportedLocale): number | null {
    const minor: number = majorToMinor(amount ?? DEFAULT_AMOUNT, currency, locale);
    return minor > 0 ? minor : null;
}

function useAmountInUrl(amountMinor: number | null, currency: BaseCurrency): void {
    const locale: SupportedLocale = useLocale();
    const search: { amount?: number } = useSearch({ from: '/_auth/_app/portfolio/contribution' });
    const navigate: UseNavigateResult<string> = useNavigate();
    const amount: number = amountMinor === null ? EMPTY_AMOUNT : minorToMajor(amountMinor, currency, locale);
    useEffect((): void => {
        if (amount !== search.amount) {
            void navigate({ to: '/portfolio/contribution', search: { amount }, replace: true });
        }
    }, [amount, search.amount, navigate]);
}

function useTrackCalculated(suggestion: ContributionSuggestion | undefined, currency: BaseCurrency): void {
    useEffect((): void => {
        if (suggestion !== undefined) {
            track('portfolio_contribution_calculated', { classesFunded: suggestion.classes.length, currency });
        }
    }, [suggestion, currency]);
}

function ContributionBody({ currency }: { readonly currency: BaseCurrency }): ReactElement {
    const locale: SupportedLocale = useLocale();
    const search: { amount?: number } = useSearch({ from: '/_auth/_app/portfolio/contribution' });
    const [draft, setDraft] = useState<number | null>((): number | null => initialMinor(search.amount, currency, locale));
    const amountMinor: number | null = useDebouncedValue(draft, DEBOUNCE_MS);
    const query: UseQueryResult<ContributionSuggestion> = useContributionSuggestion(amountMinor);
    useAmountInUrl(amountMinor, currency);
    useTrackCalculated(query.data, currency);
    return (
        <div className="flex flex-col gap-4">
            <AmountInput value={draft} currency={currency} onChange={setDraft} />
            <SuggestionPanel amountMinor={amountMinor} query={query} />
        </div>
    );
}

function ContributionSettings(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const settings: UseQueryResult<PortfolioSettings> = usePortfolioSettings();
    if (settings.error !== null) {
        return <FailureAlert error={settings.error} title={t('settingsError')} />;
    }
    if (settings.data === undefined) {
        return <Skeleton className="h-40 w-full" />;
    }
    return <ContributionBody currency={settings.data.baseCurrency} />;
}

export function ContributionPage(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-start min-[560px]:justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">{t('title')}</h2>
                    <p className="max-w-2xl text-sm text-content-muted">{t('subtitle')}</p>
                </div>
                <BaseCurrencySwitch />
            </div>
            <ContributionSettings />
        </section>
    );
}
