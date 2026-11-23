import { describe, expect, it } from 'vitest';
import { discountedPriceCents, isCompleteRule } from './signup-link-offer';

describe('discountedPriceCents', () => {
    it('applies the percent over the Premium price', () => {
        expect(discountedPriceCents(50)).toBe(745);
        expect(discountedPriceCents(90)).toBe(149);
    });

    it('rounds to the cent', () => {
        expect(discountedPriceCents(33)).toBe(998);
    });
});

describe('isCompleteRule', () => {
    it('accepts a rule inside the platform limits', () => {
        expect(isCompleteRule({ percent: 90, fromCycle: 1, toCycle: 1 })).toBe(true);
    });

    it('refuses a percent above 90 and an inverted cycle range', () => {
        expect(isCompleteRule({ percent: 91, fromCycle: 1, toCycle: 3 })).toBe(false);
        expect(isCompleteRule({ percent: 20, fromCycle: 4, toCycle: 3 })).toBe(false);
    });
});
