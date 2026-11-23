import { describe, expect, it } from 'vitest';
import type { OfferRule } from './billing-types';
import { addDays, discountedCents, ruleForCycle, sortedRules, trialDays } from './offer-pricing';

const RULES: OfferRule[] = [
    { percent: 25, fromCycle: 4, toCycle: 6 },
    { percent: 50, fromCycle: 1, toCycle: 3 }
];

describe('offer pricing', () => {
    it('picks the rule that covers the cycle and none after the last one', () => {
        expect(ruleForCycle(RULES, 5)?.percent).toBe(25);
        expect(ruleForCycle(RULES, 7)).toBeNull();
    });

    it('rounds the discounted price half up like the API', () => {
        expect(discountedCents(1490, RULES, 1)).toBe(745);
        expect(discountedCents(1490, RULES, 4)).toBe(1118);
        expect(discountedCents(1490, RULES, 9)).toBe(1490);
    });

    it('sorts a copy by the first cycle', () => {
        expect(sortedRules(RULES).map((rule) => rule.fromCycle)).toEqual([1, 4]);
        expect(RULES[0]?.fromCycle).toBe(4);
    });

    it('counts trial days only when there is a trial', () => {
        expect(trialDays({ kind: 'none', days: null })).toBe(0);
        expect(trialDays({ kind: 'card', days: 14 })).toBe(14);
        expect(trialDays({ kind: 'no_card', days: null })).toBe(0);
    });

    it('adds days without touching the original date', () => {
        const start: Date = new Date('2026-11-23T12:00:00.000Z');

        expect(addDays(start, 7).toISOString()).toBe('2026-11-30T12:00:00.000Z');
        expect(start.toISOString()).toBe('2026-11-23T12:00:00.000Z');
    });
});
