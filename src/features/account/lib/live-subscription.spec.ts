import { describe, expect, it } from 'vitest';
import { cancelsPremiumOnDelete } from './live-subscription';

describe('cancelsPremiumOnDelete', () => {
    it('is true for a hosted Premium with a live subscription', () => {
        expect(cancelsPremiumOnDelete({ mode: 'hosted', plan: 'premium', subscriptionStatus: 'active' })).toBe(true);
        expect(cancelsPremiumOnDelete({ mode: 'hosted', plan: 'premium', subscriptionStatus: 'past_due' })).toBe(true);
    });

    it.each([
        [{ mode: 'self_hosted', plan: 'self_hosted', subscriptionStatus: null }],
        [{ mode: 'hosted', plan: 'free', subscriptionStatus: null }],
        [{ mode: 'hosted', plan: 'premium', subscriptionStatus: 'canceled' }],
        [{ mode: 'hosted', plan: 'premium', subscriptionStatus: null }]
    ] as const)('is false for %j', (billing): void => {
        expect(cancelsPremiumOnDelete(billing)).toBe(false);
    });
});
