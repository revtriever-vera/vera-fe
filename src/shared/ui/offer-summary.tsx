import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { OfferRule, OfferTrial } from '@/shared/lib/billing/billing-types';
import { sortedRules } from '@/shared/lib/billing/offer-pricing';
import { ruleText, trialText } from '@/shared/lib/billing/offer-text';

export interface OfferSummaryProps {
    readonly trial: OfferTrial;
    readonly rules: readonly OfferRule[];
}

export function OfferSummary({ trial, rules }: OfferSummaryProps): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const trialLine: string | null = trialText(t, trial);
    const ordered: readonly OfferRule[] = sortedRules(rules);
    if (trialLine === null && ordered.length === 0) {
        return null;
    }
    return (
        <ul className="m-0 flex list-disc flex-col gap-1 pl-4 text-sm text-content">
            {trialLine === null ? null : <li>{trialLine}</li>}
            {ordered.map((rule: OfferRule): ReactElement => (
                <li key={`${String(rule.fromCycle)}-${String(rule.toCycle)}`}>{ruleText(t, rule)}</li>
            ))}
            {ordered.length === 0 ? null : <li>{t('offer.afterRules')}</li>}
        </ul>
    );
}
