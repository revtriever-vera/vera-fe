import type { TFunction } from 'i18next';
import type { OfferRule, OfferTrial } from './billing-types';
import { trialDays } from './offer-pricing';

export function trialText(t: TFunction<'billing'>, trial: OfferTrial): string | null {
    const count: number = trialDays(trial);
    if (trial.kind === 'none' || count === 0) {
        return null;
    }
    return trial.kind === 'card' ? t('offer.trialCard', { count }) : t('offer.trialNoCard', { count });
}

export function ruleText(t: TFunction<'billing'>, rule: OfferRule): string {
    if (rule.fromCycle === rule.toCycle) {
        return t('offer.ruleSingle', { percent: rule.percent, cycle: rule.fromCycle });
    }
    return t('offer.rule', { percent: rule.percent, from: rule.fromCycle, to: rule.toCycle });
}
