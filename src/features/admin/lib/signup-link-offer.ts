import type { DiscountRule } from '../types';

export const PREMIUM_PRICE_CENTS: number = 1490;
export const PRICE_CURRENCY: string = 'BRL';
export const MAX_RULES: number = 20;
export const MAX_PERCENT: number = 90;
export const MAX_TRIAL_DAYS: number = 60;
export const NO_CARD_MAX_VALIDITY_DAYS: number = 90;
export const MAX_OFFER_VALIDITY_DAYS: number = 365;
export const DEFAULT_OFFER_VALIDITY_DAYS: number = 30;

export const TRIAL_KIND: { readonly none: 'none'; readonly card: 'card'; readonly noCard: 'no_card' } = {
    none: 'none',
    card: 'card',
    noCard: 'no_card'
};

export function discountedPriceCents(percent: number, basePriceCents: number = PREMIUM_PRICE_CENTS): number {
    return Math.round((basePriceCents * (100 - percent)) / 100);
}

export function isCompleteRule(rule: DiscountRule): boolean {
    return rule.percent >= 1 && rule.percent <= MAX_PERCENT && rule.fromCycle >= 1 && rule.toCycle >= rule.fromCycle;
}
