import type { OfferRule, OfferTrial } from './billing-types';

const PERCENT_BASE: number = 100;

export function ruleForCycle(rules: readonly OfferRule[], cycle: number): OfferRule | null {
    return rules.find((rule: OfferRule): boolean => cycle >= rule.fromCycle && cycle <= rule.toCycle) ?? null;
}

export function discountedCents(baseCents: number, rules: readonly OfferRule[], cycle: number): number {
    const rule: OfferRule | null = ruleForCycle(rules, cycle);
    return rule === null ? baseCents : Math.round((baseCents * (PERCENT_BASE - rule.percent)) / PERCENT_BASE);
}

export function sortedRules(rules: readonly OfferRule[]): readonly OfferRule[] {
    return [...rules].sort((left: OfferRule, right: OfferRule): number => left.fromCycle - right.fromCycle);
}

export function trialDays(trial: OfferTrial): number {
    return trial.kind === 'none' ? 0 : (trial.days ?? 0);
}

export function addDays(from: Date, days: number): Date {
    const result: Date = new Date(from);
    result.setDate(result.getDate() + days);
    return result;
}
