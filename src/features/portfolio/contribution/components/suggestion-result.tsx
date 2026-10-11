import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { ContributionClass, ContributionSuggestion } from '../types';
import { CalculationNote } from './calculation-note';
import { ContributionClassCard } from './contribution-class-card';
import { ContributionWarnings } from './contribution-warnings';

export interface SuggestionResultProps {
    readonly suggestion: ContributionSuggestion;
}

export function SuggestionResult({ suggestion }: SuggestionResultProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const locale: SupportedLocale = useLocale();
    const portfolioEmpty: boolean = suggestion.totalBeforeMinor === 0;
    return (
        <div className="flex flex-col gap-4">
            <p role="status" className="sr-only">
                {t('announce', { amount: formatCurrency(suggestion.amountMinor, suggestion.baseCurrency, locale) })}
            </p>
            <ContributionWarnings warnings={suggestion.warnings} />
            <ul aria-label={t('listLabel')} className="flex flex-col gap-3">
                {suggestion.classes.map((item: ContributionClass): ReactElement => (
                    <ContributionClassCard
                        key={item.classId}
                        item={item}
                        currency={suggestion.baseCurrency}
                        portfolioEmpty={portfolioEmpty}
                    />
                ))}
            </ul>
            <CalculationNote totalAfterMinor={suggestion.totalAfterMinor} currency={suggestion.baseCurrency} />
        </div>
    );
}
